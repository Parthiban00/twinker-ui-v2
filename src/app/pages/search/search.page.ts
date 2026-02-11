import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { StorageService } from 'src/app/services/storage.service';
import { HomeMainService } from '../home-main/home-main.service';
import { SearchService, SearchResults } from './search.service';

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
  categoryIds: string[] = [];

  recentSearches: string[] = [];

  // Results
  matchedCategories: any[] = [];
  matchedVendors: any[] = [];
  matchedProducts: any[] = [];

  // Suggestions
  servicePillars = [
    { name: 'Food', icon: 'restaurant-outline', bgColor: '#FFF0F0', accentColor: '#F85C70', route: '/home-land', queryTitle: 'Food' },
    { name: 'Groceries', icon: 'cart-outline', bgColor: '#F0FFF4', accentColor: '#2ecc71', route: '/home-land', queryTitle: 'Groceries' },
    { name: 'Medicine', icon: 'medkit-outline', bgColor: '#F0F4FF', accentColor: '#4A5BF5', route: '/home-land', queryTitle: 'Medicine' },
    { name: 'Desserts', icon: 'ice-cream-outline', bgColor: '#FFF0F8', accentColor: '#FC5C7D', route: '/home-land', queryTitle: 'Desserts' },
    { name: 'Beverages', icon: 'cafe-outline', bgColor: '#FFF5F0', accentColor: '#FF8C42', route: '/home-land', queryTitle: 'Beverages' }
  ];

  cuisineGrid = [
    { name: 'Pizza', icon: 'pizza-outline', bgColor: '#FFF0F0', accentColor: '#F85C70' },
    { name: 'Burger', icon: 'fast-food-outline', bgColor: '#FFF5F0', accentColor: '#FF8C42' },
    { name: 'Salad', icon: 'leaf-outline', bgColor: '#F0FFF4', accentColor: '#2ecc71' },
    { name: 'Noodles', icon: 'restaurant-outline', bgColor: '#FFF0F8', accentColor: '#FC5C7D' },
    { name: 'Cakes', icon: 'ice-cream-outline', bgColor: '#FFF0F5', accentColor: '#E91E8C' },
    { name: 'Juice', icon: 'cafe-outline', bgColor: '#FFF5F0', accentColor: '#FF8C42' },
    { name: 'Pharma', icon: 'medkit-outline', bgColor: '#F0F4FF', accentColor: '#4A5BF5' },
    { name: 'Veggies', icon: 'nutrition-outline', bgColor: '#F0FFF4', accentColor: '#2DBCB6' }
  ];

  // Dummy fallback data
  dummyVendors = [
    { _id: 'v1', vendorName: 'Pizza Palace', cuisine: 'Italian', rating: 4.5, distance: '2.3 km', deliveryTime: '25 min', imageUrl: '' },
    { _id: 'v2', vendorName: 'Burger Barn', cuisine: 'American', rating: 4.2, distance: '1.8 km', deliveryTime: '20 min', imageUrl: '' },
    { _id: 'v3', vendorName: 'Spice Garden', cuisine: 'Indian', rating: 4.6, distance: '3.1 km', deliveryTime: '30 min', imageUrl: '' },
    { _id: 'v4', vendorName: 'Green Bowl', cuisine: 'Healthy', rating: 4.4, distance: '2.5 km', deliveryTime: '25 min', imageUrl: '' },
    { _id: 'v5', vendorName: 'Sweet Treats', cuisine: 'Desserts', rating: 4.7, distance: '4.0 km', deliveryTime: '35 min', imageUrl: '' }
  ];

  dummyProducts = [
    { _id: 'p1', productName: 'Margherita Pizza', price: 9.99, vendorName: 'Pizza Palace', vendorId: 'v1', imageUrl: '' },
    { _id: 'p2', productName: 'Pepperoni Pizza', price: 12.99, vendorName: 'Pizza Palace', vendorId: 'v1', imageUrl: '' },
    { _id: 'p3', productName: 'Classic Burger', price: 7.49, vendorName: 'Burger Barn', vendorId: 'v2', imageUrl: '' },
    { _id: 'p4', productName: 'Chicken Biryani', price: 11.50, vendorName: 'Spice Garden', vendorId: 'v3', imageUrl: '' },
    { _id: 'p5', productName: 'Caesar Salad', price: 8.99, vendorName: 'Green Bowl', vendorId: 'v4', imageUrl: '' },
    { _id: 'p6', productName: 'Chocolate Cake', price: 6.50, vendorName: 'Sweet Treats', vendorId: 'v5', imageUrl: '' },
    { _id: 'p7', productName: 'Noodle Bowl', price: 10.00, vendorName: 'Spice Garden', vendorId: 'v3', imageUrl: '' },
    { _id: 'p8', productName: 'Fresh Juice', price: 4.50, vendorName: 'Green Bowl', vendorId: 'v4', imageUrl: '' }
  ];

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private storageService: StorageService,
    private homeMainService: HomeMainService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.localityId = this.route.snapshot.queryParamMap.get('localityId') || '';
    this.loadRecentSearches();
    this.loadCategories();
    this.setupSearchPipeline();
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
        if (!term.trim()) return [];
        return this.searchService.searchAll(term, this.localityId, this.categoryIds);
      })
    ).subscribe({
      next: (results: SearchResults) => {
        this.matchedVendors = results.vendors;
        this.matchedProducts = results.products;
        this.matchedCategories = this.filterLocalCategories(this.searchTerm);
        this.isLoading = false;

        // If API returned nothing, use dummy data filtered by search term
        if (!this.matchedVendors.length && !this.matchedProducts.length) {
          this.useDummyResults(this.searchTerm);
        }
      },
      error: () => {
        this.useDummyResults(this.searchTerm);
        this.isLoading = false;
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

  // --- Category matching ---

  private filterLocalCategories(term: string): any[] {
    const q = term.toLowerCase();
    const matched: any[] = [];

    this.servicePillars.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.queryTitle.toLowerCase().includes(q)) {
        matched.push({ type: 'pillar', ...p });
      }
    });

    this.cuisineGrid.forEach(c => {
      if (c.name.toLowerCase().includes(q)) {
        matched.push({ type: 'cuisine', ...c });
      }
    });

    return matched;
  }

  // --- Dummy fallback ---

  private useDummyResults(term: string) {
    const q = term.toLowerCase();
    this.matchedVendors = this.dummyVendors.filter(v =>
      v.vendorName.toLowerCase().includes(q) || v.cuisine.toLowerCase().includes(q)
    );
    this.matchedProducts = this.dummyProducts.filter(p =>
      p.productName.toLowerCase().includes(q) || p.vendorName.toLowerCase().includes(q)
    );
    if (!this.matchedCategories.length) {
      this.matchedCategories = this.filterLocalCategories(term);
    }
  }

  // --- Load categories for API search ---

  private loadCategories() {
    if (!this.localityId) return;
    this.homeMainService.getAllCategoriesByLocality(this.localityId).subscribe({
      next: (res: any) => {
        if (res.status && res.data) {
          this.categoryIds = res.data.map((c: any) => c._id);
        }
      },
      error: () => {}
    });
  }

  // --- Recent searches ---

  private loadRecentSearches() {
    this.recentSearches = this.storageService.getItem(RECENT_SEARCHES_KEY) || [];
  }

  private saveRecentSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;

    // Remove existing (case-insensitive) to avoid duplicates
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
    if (cat.type === 'pillar') {
      this.router.navigate([cat.route], {
        queryParams: { title: cat.queryTitle, localityId: this.localityId }
      });
    } else {
      this.router.navigate(['/home-land'], {
        queryParams: { title: cat.name, localityId: this.localityId }
      });
    }
  }

  navigateVendor(vendor: any) {
    this.saveRecentSearch(this.searchTerm);
    this.router.navigate(['/items'], {
      queryParams: { vendorId: vendor._id }
    });
  }

  navigateProduct(product: any) {
    this.saveRecentSearch(this.searchTerm);
    this.router.navigate(['/items'], {
      queryParams: { vendorId: product.vendorId || product.vendor?._id || '' }
    });
  }

  navigatePillar(pillar: any) {
    this.router.navigate([pillar.route], {
      queryParams: { title: pillar.queryTitle, localityId: this.localityId }
    });
  }

  navigateCuisine(cuisine: any) {
    this.router.navigate(['/home-land'], {
      queryParams: { title: cuisine.name, localityId: this.localityId }
    });
  }

  get hasResults(): boolean {
    return this.matchedCategories.length > 0 || this.matchedVendors.length > 0 || this.matchedProducts.length > 0;
  }
}
