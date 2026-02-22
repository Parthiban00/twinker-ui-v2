import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { StorageService } from 'src/app/services/storage.service';
import { CommonService } from 'src/app/services/common.service';
import { HomeMainService } from '../home-main/home-main.service';
import { SearchService, SearchResults } from './search.service';
import { environment } from 'src/environments/environment';

const RECENT_SEARCHES_KEY = 'recent-searches';
const MAX_RECENT = 10;

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false,
})
export class SearchPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchTerm = '';
  isLoading = false;
  hasSearched = false;
  localityId = '';
  vertical: 'eats' | 'mart' = 'eats';
  imgBaseUrl: string = environment.imageBaseUrl;

  recentSearches: string[] = [];

  // Results
  matchedCategories: any[] = [];
  matchedVendors: any[] = [];
  matchedProducts: any[] = [];

  // Browse data from API
  apiCategories: any[] = [];
  apiCuisines: any[] = [];
  trendingDishes: any[] = [];
  defaultAddress: any;

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private storageService: StorageService,
    private commonService: CommonService,
    private homeMainService: HomeMainService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.localityId = this.route.snapshot.queryParamMap.get('localityId') || '';
    const routeVertical = this.route.snapshot.queryParamMap.get('vertical');
    this.vertical = (routeVertical === 'eats' || routeVertical === 'mart')
      ? routeVertical
      : this.storageService.getActiveVertical();
    this.storageService.saveActiveVertical(this.vertical);
    const prefill = this.route.snapshot.queryParamMap.get('q') || '';
    this.loadRecentSearches();
    this.loadBrowseData();
    this.setupSearchPipeline();

    // Auto-trigger search if a query was passed (e.g. from cuisine click)
    if (prefill) {
      this.searchTerm = prefill;
      setTimeout(() => this.searchSubject.next(prefill), 100);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 300);
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  goBack() {
    this.navCtrl.back();
  }

  // --- Load browse data from API ---

  private loadBrowseData() {
    if (!this.localityId) return;

    // Read default address from local storage — no extra API call needed
    const userData = this.storageService.getUser();
    if (userData?.addresses?.length) {
      this.defaultAddress = userData.addresses.find((a: any) => a.isDefault) || userData.addresses[0];
    }

    // Fire categories + dashboard in parallel (2 calls, both needed for the browse UI)
    forkJoin({
      categories: this.homeMainService.getAllCategoriesByLocality(this.localityId).pipe(catchError(() => of(null))),
      dashboard: this.homeMainService.getDashboard(this.localityId, this.vertical).pipe(catchError(() => of(null))),
    }).subscribe(({ categories, dashboard }) => {
      // Categories — filter by active vertical
      if (categories?.status && categories?.data) {
        this.apiCategories = categories.data.filter(
          (c: any) => !c.vertical || c.vertical === this.vertical
        );
      }

      // Dashboard — cuisines + trending dishes
      if (dashboard?.status && dashboard?.data) {
        this.apiCuisines = dashboard.data.cuisines || [];

        // Build trending dishes: popular items first, then discounted deals
        const popular = (dashboard.data.popularItems || []).map((p: any) => ({
          _id: p._id,
          productName: p.productName,
          price: p.price,
          actualPrice: p.actualPrice,
          imageUrl: p.imageUrl ? (this.imgBaseUrl + p.imageUrl) : '',
          vendorName: p.vendor?.name || '',
          vendorId: p.vendor?._id || '',
          discount: p.discount,
          discountType: p.discountType,
          tag: p.tag
        }));

        const dealItems = (dashboard.data.deals || [])
          .filter((d: any) => !popular.some((p: any) => p._id === d._id))
          .map((p: any) => ({
            _id: p._id,
            productName: p.productName,
            price: p.price,
            actualPrice: p.actualPrice,
            imageUrl: p.imageUrl ? (this.imgBaseUrl + p.imageUrl) : '',
            vendorName: p.vendor?.name || '',
            vendorId: p.vendor?._id || '',
            discount: p.discount,
            discountType: p.discountType,
            tag: p.tag || 'offer'
          }));

        this.trendingDishes = [...popular, ...dealItems];
      }

      this.cdr.detectChanges();
    });
  }

  // --- Search pipeline ---

  private setupSearchPipeline() {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(term => {
        if (term.trim()) {
          this.isLoading = true;
          this.hasSearched = true;
        } else {
          this.isLoading = false;
          this.hasSearched = false;
          this.clearResults();
        }
      }),
      switchMap(term => {
        if (!term.trim()) {
          return this.searchService.searchAll('', this.localityId, this.vertical);
        }
        return this.searchService.searchAll(term, this.localityId, this.vertical);
      })
    ).subscribe({
      next: (results: SearchResults) => {
        // Map vendor results
        this.matchedVendors = results.vendors.map(v => {
          const mapped: any = {
            _id: v._id,
            vendorName: v.name,
            imageUrl: v.profileImgUrl ? (this.imgBaseUrl + v.profileImgUrl) : '',
            rating: v.rating || '4.5',
            categories: v.categories
          };
          // Calculate distance/time
          this.calcVendorDistanceAndTime(mapped, v);
          // Build cuisine string from categories
          if (v.categories?.length) {
            mapped.cuisine = v.categories.map((c: any) => c.categoryName).join(', ');
          }
          return mapped;
        });

        // Map product results and sort: popular/trending/recommended/offer first
        const mapped = results.products.map(p => ({
          _id: p._id,
          productName: p.productName,
          price: p.price,
          actualPrice: p.actualPrice,
          imageUrl: p.imageUrl ? (this.imgBaseUrl + p.imageUrl) : '',
          vendorName: p.vendor?.name || '',
          vendorId: p.vendor?._id || '',
          discount: p.discount,
          discountType: p.discountType,
          tag: p.tag || 'none'
        }));

        // Priority tags come first, then items with discounts, then the rest
        const priorityTags = ['bestseller', 'trending', 'recommended', 'new'];
        mapped.sort((a, b) => {
          const aHasTag = priorityTags.includes(a.tag?.toLowerCase());
          const bHasTag = priorityTags.includes(b.tag?.toLowerCase());
          const aHasDiscount = a.discount > 0;
          const bHasDiscount = b.discount > 0;

          if (aHasTag && !bHasTag) return -1;
          if (!aHasTag && bHasTag) return 1;
          if (aHasDiscount && !bHasDiscount) return -1;
          if (!aHasDiscount && bHasDiscount) return 1;
          return 0;
        });

        this.matchedProducts = mapped;

        // Map category results
        this.matchedCategories = results.categories.map(c => ({
          _id: c._id,
          categoryId: c._id,
          name: c.categoryName,
          icon: this.getCategoryIcon(c.categoryName),
          bgColor: this.getCategoryBgColor(c.categoryName),
          accentColor: this.getCategoryAccentColor(c.categoryName)
        }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchInput() {
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.hasSearched = false;
    this.isLoading = false;
    this.clearResults();
    this.searchInput?.nativeElement?.focus();
  }

  private clearResults() {
    this.matchedCategories = [];
    this.matchedVendors = [];
    this.matchedProducts = [];
  }

  // --- Helpers ---

  private calcVendorDistanceAndTime(mapped: any, raw: any) {
    if (this.defaultAddress?.coords && raw.latitude && raw.longitude) {
      mapped.distance = this.commonService.calculateDistance(
        this.defaultAddress.coords.lat,
        this.defaultAddress.coords.lng,
        raw.latitude,
        raw.longitude
      ) + ' km';
      mapped.deliveryTime = (Math.ceil(parseFloat(mapped.distance)) * 3) + 15 + ' min';
    }
  }

  getCategoryIcon(name: string): string {
    const map: Record<string, string> = {
      'food': 'restaurant-outline',
      'groceries': 'cart-outline',
      'medicine': 'medkit-outline',
      'desserts': 'ice-cream-outline',
      'beverages': 'cafe-outline'
    };
    return map[name?.toLowerCase()] || 'grid-outline';
  }

  getCategoryBgColor(name: string): string {
    const map: Record<string, string> = {
      'food': '#FFF0F0',
      'groceries': '#F0FFF4',
      'medicine': '#F0F4FF',
      'desserts': '#FFF0F8',
      'beverages': '#FFF5F0'
    };
    return map[name?.toLowerCase()] || '#f5f5f5';
  }

  getCategoryAccentColor(name: string): string {
    const map: Record<string, string> = {
      'food': '#F85C70',
      'groceries': '#2ecc71',
      'medicine': '#4A5BF5',
      'desserts': '#FC5C7D',
      'beverages': '#FF8C42'
    };
    return map[name?.toLowerCase()] || '#888';
  }

  getDiscountLabel(item: any): string {
    if (!item.discount) return '';
    if (item.discountType === 'in-percentage') {
      return `${item.discount}% OFF`;
    } else if (item.discountType === 'in-price') {
      return `\u20B9${item.discount} OFF`;
    }
    return `${item.discount}% OFF`;
  }

  getTagLabel(tag: string): string {
    const map: Record<string, string> = {
      'bestseller': 'Bestseller',
      'trending': 'Trending',
      'recommended': 'Recommended',
      'new': 'New',
      'offer': 'Offer'
    };
    return map[tag?.toLowerCase()] || '';
  }

  // --- Recent searches ---

  private loadRecentSearches() {
    this.recentSearches = this.storageService.getItem(RECENT_SEARCHES_KEY) || [];
  }

  private saveRecentSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;

    this.recentSearches = this.recentSearches.filter(
      s => s.toLowerCase() !== trimmed.toLowerCase()
    );
    this.recentSearches.unshift(trimmed);
    if (this.recentSearches.length > MAX_RECENT) {
      this.recentSearches = this.recentSearches.slice(0, MAX_RECENT);
    }
    this.storageService.setItem(RECENT_SEARCHES_KEY, this.recentSearches);
  }

  removeRecentSearch(index: number) {
    this.recentSearches.splice(index, 1);
    this.storageService.setItem(RECENT_SEARCHES_KEY, this.recentSearches);
  }

  clearAllRecent() {
    this.recentSearches = [];
    this.storageService.setItem(RECENT_SEARCHES_KEY, []);
  }

  tapRecentSearch(term: string) {
    this.searchTerm = term;
    this.onSearchInput();
  }

  // --- Navigation ---

  navigateCategory(cat: any) {
    this.saveRecentSearch(this.searchTerm);
    this.router.navigate(['/home-land'], {
      queryParams: {
        categoryId: cat.categoryId || cat._id,
        localityId: this.localityId,
        title: cat.name,
        vertical: this.vertical
      }
    });
  }

  navigateVendor(vendor: any) {
    this.saveRecentSearch(this.searchTerm);
    this.router.navigate(['/items'], {
      queryParams: {
        vendorId: vendor._id,
        vertical: this.vertical
      }
    });
  }

  navigateProduct(product: any) {
    this.saveRecentSearch(this.searchTerm);
    this.router.navigate(['/items'], {
      queryParams: {
        vendorId: product.vendorId,
        vertical: this.vertical
      }
    });
  }

  navigatePillar(cat: any) {
    this.router.navigate(['/home-land'], {
      queryParams: {
        categoryId: cat._id,
        localityId: this.localityId,
        title: cat.categoryName,
        vertical: this.vertical
      }
    });
  }

  navigateCuisine(cuisine: any) {
    // Find the Food category to navigate with cuisineFilter
    const foodCat = this.apiCategories.find(
      c => c.categoryName?.toLowerCase() === 'food'
    );
    this.router.navigate(['/home-land'], {
      queryParams: {
        categoryId: foodCat?._id || '',
        localityId: this.localityId,
        title: 'Food',
        cuisineFilter: cuisine.name,
        vertical: this.vertical
      }
    });
  }

  get hasResults(): boolean {
    return this.matchedCategories.length > 0 || this.matchedVendors.length > 0 || this.matchedProducts.length > 0;
  }
}
