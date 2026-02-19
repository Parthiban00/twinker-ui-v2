import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CouponsPage } from 'src/app/shared/pages/coupons/coupons.page';
import { SpecificItemListPage } from 'src/app/shared/pages/specific-item-list/specific-item-list.page';
import { VendorService } from './vendor.service';
import { CommonService } from 'src/app/services/common.service';
import { HomeMainService } from '../home-main/home-main.service';
import { StorageService } from 'src/app/services/storage.service';
import { environment } from 'src/environments/environment';
import { AllItemsPage } from 'src/app/shared/pages/all-items/all-items.page';
import { register } from 'swiper/element/bundle';

register();

interface CategoryTheme {
  accentColor: string;
  gradientStart: string;
  gradientEnd: string;
  bgTint: string;
  icon: string;
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  filterChips: string[];
  cuisines: { name: string; icon: string }[];
  deals: { title: string; subtitle: string; badge: string; color: string }[];
}

const categoryThemes: Record<string, CategoryTheme> = {
  'Food': {
    accentColor: '#F85C70',
    gradientStart: '#F85C70',
    gradientEnd: '#FC5C7D',
    bgTint: 'rgba(248,92,112,0.06)',
    icon: 'restaurant-outline',
    heroTitle: 'What are you craving?',
    heroSubtitle: 'Discover the best eats near you',
    searchPlaceholder: 'Search for restaurants or dishes...',
    filterChips: ['Nearest', 'Top rated', 'Fast delivery', 'Offers', 'Pure veg'],
    cuisines: [
      { name: 'Pizza', icon: '\uD83C\uDF55' },
      { name: 'Biryani', icon: '\uD83C\uDF5B' },
      { name: 'Chinese', icon: '\uD83E\uDD61' },
      { name: 'Burger', icon: '\uD83C\uDF54' },
      { name: 'South Indian', icon: '\uD83E\uDD58' },
      { name: 'Desserts', icon: '\uD83C\uDF70' },
      { name: 'Rolls', icon: '\uD83C\uDF2F' },
      { name: 'Thali', icon: '\uD83C\uDF71' }
    ],
    deals: [
      { title: '50% OFF up to \u20B9100', subtitle: 'On your first order', badge: 'NEW USER', color: '#F85C70' },
      { title: 'Free delivery', subtitle: 'On orders above \u20B9199', badge: 'FREE', color: '#2ecc71' },
      { title: 'Flat \u20B9125 OFF', subtitle: 'Use code TASTY125', badge: 'DEAL', color: '#FF8C42' }
    ]
  },
  'Groceries': {
    accentColor: '#2ecc71',
    gradientStart: '#2ecc71',
    gradientEnd: '#27ae60',
    bgTint: 'rgba(46,204,113,0.06)',
    icon: 'cart-outline',
    heroTitle: 'Fresh groceries delivered',
    heroSubtitle: 'Farm-fresh produce at your doorstep',
    searchPlaceholder: 'Search for groceries or stores...',
    filterChips: ['Nearest', 'Top rated', 'Best price', 'Organic', 'Express'],
    cuisines: [
      { name: 'Fruits', icon: '\uD83C\uDF4E' },
      { name: 'Vegetables', icon: '\uD83E\uDD6C' },
      { name: 'Dairy', icon: '\uD83E\uDD5B' },
      { name: 'Snacks', icon: '\uD83C\uDF7F' },
      { name: 'Beverages', icon: '\uD83E\uDDC3' },
      { name: 'Staples', icon: '\uD83C\uDF3E' },
      { name: 'Bakery', icon: '\uD83C\uDF5E' },
      { name: 'Meat', icon: '\uD83E\uDD69' }
    ],
    deals: [
      { title: '\u20B91 deals on fruits', subtitle: 'Limited time only', badge: '\u20B91', color: '#2ecc71' },
      { title: 'Buy 2 Get 1 Free', subtitle: 'On dairy products', badge: 'B2G1', color: '#3498db' },
      { title: '30% OFF on veggies', subtitle: 'Fresh from farms', badge: 'FRESH', color: '#27ae60' }
    ]
  },
  'Medicine': {
    accentColor: '#4A5BF5',
    gradientStart: '#4A5BF5',
    gradientEnd: '#6C7CFF',
    bgTint: 'rgba(74,91,245,0.06)',
    icon: 'medkit-outline',
    heroTitle: 'Medicines to your door',
    heroSubtitle: 'Genuine medicines with fast delivery',
    searchPlaceholder: 'Search medicines or pharmacies...',
    filterChips: ['Nearest', 'Top rated', '24/7 open', 'Discounts', 'Express'],
    cuisines: [
      { name: 'OTC', icon: '\uD83D\uDC8A' },
      { name: 'Wellness', icon: '\uD83E\uDDD8' },
      { name: 'Personal care', icon: '\uD83E\uDDF4' },
      { name: 'Baby care', icon: '\uD83C\uDF7C' },
      { name: 'Devices', icon: '\uD83E\uDE7A' },
      { name: 'Ayurveda', icon: '\uD83C\uDF3F' }
    ],
    deals: [
      { title: '25% OFF on all orders', subtitle: 'Use code HEALTH25', badge: 'SAVE', color: '#4A5BF5' },
      { title: 'Free delivery', subtitle: 'On pharmacy orders', badge: 'FREE', color: '#2ecc71' },
      { title: 'Flat \u20B950 OFF', subtitle: 'On orders above \u20B9500', badge: 'FLAT', color: '#6C7CFF' }
    ]
  },
  'Desserts': {
    accentColor: '#E91E8C',
    gradientStart: '#E91E8C',
    gradientEnd: '#FF6EB4',
    bgTint: 'rgba(233,30,140,0.06)',
    icon: 'ice-cream-outline',
    heroTitle: 'Something sweet?',
    heroSubtitle: 'Indulge in desserts & sweet treats',
    searchPlaceholder: 'Search desserts or bakeries...',
    filterChips: ['Nearest', 'Top rated', 'Fast delivery', 'Cakes', 'Ice cream'],
    cuisines: [
      { name: 'Cakes', icon: '\uD83C\uDF82' },
      { name: 'Ice cream', icon: '\uD83C\uDF66' },
      { name: 'Cookies', icon: '\uD83C\uDF6A' },
      { name: 'Pastries', icon: '\uD83E\uDD50' },
      { name: 'Chocolates', icon: '\uD83C\uDF6B' },
      { name: 'Indian sweets', icon: '\uD83C\uDF6C' }
    ],
    deals: [
      { title: '20% OFF on cakes', subtitle: 'Order above \u20B9499', badge: 'SWEET', color: '#E91E8C' },
      { title: 'Buy 1 Get 1 Free', subtitle: 'On ice cream tubs', badge: 'B1G1', color: '#FF6EB4' },
      { title: 'Free delivery', subtitle: 'On dessert orders', badge: 'FREE', color: '#2ecc71' }
    ]
  },
  'Beverages': {
    accentColor: '#FF8C42',
    gradientStart: '#FF8C42',
    gradientEnd: '#FFB347',
    bgTint: 'rgba(255,140,66,0.06)',
    icon: 'cafe-outline',
    heroTitle: 'Refresh your day',
    heroSubtitle: 'Juices, shakes, coffee & more',
    searchPlaceholder: 'Search beverages or cafes...',
    filterChips: ['Nearest', 'Top rated', 'Fast delivery', 'Healthy', 'Cold drinks'],
    cuisines: [
      { name: 'Coffee', icon: '\u2615' },
      { name: 'Juices', icon: '\uD83E\uDDC3' },
      { name: 'Shakes', icon: '\uD83E\uDD64' },
      { name: 'Tea', icon: '\uD83C\uDF75' },
      { name: 'Smoothies', icon: '\uD83E\uDED0' },
      { name: 'Sodas', icon: '\uD83E\uDD42' }
    ],
    deals: [
      { title: 'Flat \u20B950 OFF', subtitle: 'On first beverage order', badge: 'SIP', color: '#FF8C42' },
      { title: 'Buy 2 Get 1 Free', subtitle: 'On cold coffees', badge: 'B2G1', color: '#8B4513' },
      { title: '30% OFF smoothies', subtitle: 'Fresh & healthy', badge: 'FRESH', color: '#2ecc71' }
    ]
  }
};

const defaultTheme = categoryThemes['Food'];

@Component({
  selector: 'app-home-land',
  templateUrl: './home-land.page.html',
  styleUrls: ['./home-land.page.scss'],
  standalone: false,
})
export class HomeLandPage implements OnInit, OnDestroy {

  categoryId = '';
  vendorDetails: any[] = [];
  filteredVendors: any[] = [];
  localityId = '';
  popularVendors: any[] = [];
  defaultAddress: any;
  imgBaseUrl: string = environment.imageBaseUrl;
  featuredItems: any[] = [];
  popularCuisines: any[] = [];
  deals: any[] = [];
  pageTitle = 'Food';
  cuisineFilter = '';

  isLoading = true;
  isDealsLoading = true;
  isTrendingLoading = true;
  searchTerm = '';
  activeSort = '';
  activeFilters: string[] = [];
  selectedCuisine = '';
  searchedProducts: any[] = [];

  // Cart
  cartItems: any[] = [];

  get cartTotalItems(): number {
    return this.cartItems.reduce((sum, i) => sum + (i.itemCount || 1), 0);
  }
  get cartTotalPrice(): number {
    return this.cartItems.reduce((sum, i) => sum + (i.price || 0) * (i.itemCount || 1), 0);
  }
  get cartFirstItemName(): string {
    return this.cartItems[0]?.productName || '';
  }

  private searchSubject = new Subject<string>();
  private searchSub: any;

  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private commonService: CommonService,
    private homeService: HomeMainService,
    private storageService: StorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  get theme(): CategoryTheme {
    return categoryThemes[this.pageTitle] || defaultTheme;
  }

  get displayVendors(): any[] {
    return this.filteredVendors;
  }

  get trendingVendors(): any[] {
    return this.popularVendors;
  }

  get hasActiveFilters(): boolean {
    return this.activeFilters.length > 0 || !!this.activeSort || !!this.selectedCuisine || !!this.searchTerm;
  }

  loadCart() {
    this.cartItems = this.storageService.getItem('cart-items') || [];
  }

  goToCart() {
    this.router.navigate(['/tabs/cart']);
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.isDealsLoading = true;
    this.isTrendingLoading = true;
    this.loadCart();
    const userData = this.storageService.getUser();

    this.activatedRoute.queryParams.subscribe(params => {
      this.categoryId = params['categoryId'] || '';
      this.localityId = params['localityId'] || '';
      this.cuisineFilter = params['cuisineFilter'] || '';

      if (params['title']) {
        this.pageTitle = params['title'];
      }

      if (userData?._id) {
        this.getDefaultAddressByUserId(userData._id);
      } else {
        this.isLoading = false;
        this.isDealsLoading = false;
        this.isTrendingLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getDefaultAddressByUserId(userId: string) {
    this.homeService.getDefaultAddressByUserId(userId).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          this.defaultAddress = resdata.data;
          if (!this.localityId && this.defaultAddress.locality?._id) {
            this.localityId = this.defaultAddress.locality._id;
          }
          if (this.categoryId && this.localityId) {
            this.loadCategoryLandingData();
          } else if (this.localityId && !this.categoryId) {
            this.resolveCategoryAndLoad();
          } else {
            this.isLoading = false;
            this.isDealsLoading = false;
            this.isTrendingLoading = false;
            this.cdr.detectChanges();
          }
        } else {
          this.isLoading = false;
          this.isDealsLoading = false;
          this.isTrendingLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.isLoading = false;
        this.isDealsLoading = false;
        this.isTrendingLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  resolveCategoryAndLoad() {
    this.homeService.getAllCategoriesByLocality(this.localityId).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data?.length) {
          const match = resdata.data.find((c: any) =>
            c.categoryName?.toLowerCase() === this.pageTitle.toLowerCase()
          );
          if (match) {
            this.categoryId = match._id;
            this.loadCategoryLandingData();
          } else {
            this.categoryId = resdata.data[0]._id;
            this.loadCategoryLandingData();
          }
        } else {
          this.isLoading = false;
          this.isDealsLoading = false;
          this.isTrendingLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.isLoading = false;
        this.isDealsLoading = false;
        this.isTrendingLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCategoryLandingData() {
    this.homeService.getCategoryLanding(this.localityId, this.categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          const d = resdata.data;
          this.vendorDetails = d.vendors || [];
          this.enrichVendors(this.vendorDetails);
          this.popularVendors = d.popularVendors || [];
          this.enrichVendors(this.popularVendors);
          this.popularCuisines = d.cuisines || [];
          this.featuredItems = d.featuredItems || [];
          this.deals = d.deals || [];
          this.filteredVendors = [...this.vendorDetails];

          // Apply cuisine filter if navigated from home-main cuisine click
          if (this.cuisineFilter) {
            this.selectedCuisine = this.cuisineFilter;
            this.applyFiltersAndSort();
          }
        } else {
          this.vendorDetails = [];
          this.filteredVendors = [];
          this.popularVendors = [];
          this.popularCuisines = [];
          this.featuredItems = [];
          this.deals = [];
        }
        this.isLoading = false;
        this.isDealsLoading = false;
        this.isTrendingLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.vendorDetails = [];
        this.filteredVendors = [];
        this.popularVendors = [];
        this.popularCuisines = [];
        this.featuredItems = [];
        this.deals = [];
        this.isLoading = false;
        this.isDealsLoading = false;
        this.isTrendingLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  enrichVendors(vendors: any[]) {
    if (!this.defaultAddress?.coords) return;
    const userLat = this.defaultAddress.coords.lat;
    const userLng = this.defaultAddress.coords.lng;
    vendors.forEach((vendor: any) => {
      if (vendor.latitude && vendor.longitude) {
        vendor.distance = this.commonService.calculateDistance(
          userLat, userLng, vendor.latitude, vendor.longitude
        );
        vendor.approxDeliveryTime = (Math.ceil(parseFloat(vendor.distance)) * 3) + 15;
      }
    });
  }

  handleSearchInput(ev: any) {
    const term = ev.target?.value || ev;
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  get isSearchMode(): boolean {
    return !!this.searchTerm;
  }

  private performSearch(term: string) {
    if (!term) {
      this.searchedProducts = [];
      this.applyFiltersAndSort();
      return;
    }

    if (this.localityId && this.categoryId) {
      // Search vendors
      this.vendorService.searchVendorByLocalityAndCategory(term, this.localityId, this.categoryId).subscribe({
        next: (resdata: any) => {
          if (resdata.status && resdata.data) {
            this.filteredVendors = resdata.data;
            this.enrichVendors(this.filteredVendors);
          } else {
            this.filteredVendors = [];
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.filteredVendors = [];
          this.cdr.detectChanges();
        }
      });

      // Search products
      this.vendorService.searchSpecificProductsByCategory(this.categoryId, term).subscribe({
        next: (resdata: any) => {
          if (resdata.status && resdata.data) {
            // Flatten grouped response [{vendor, products}] into flat array
            const flat: any[] = [];
            resdata.data.forEach((group: any) => {
              if (group.products?.length) {
                group.products.forEach((p: any) => {
                  flat.push({
                    ...p,
                    vendorName: group.vendor?.name || p.vendor?.name || '',
                    vendorId: group.vendor?._id || p.vendor?._id || ''
                  });
                });
              } else if (Array.isArray(resdata.data) && resdata.data.length && resdata.data[0]?.productName) {
                // Flat array of products
                resdata.data.forEach((p: any) => {
                  flat.push({
                    ...p,
                    vendorName: p.vendor?.name || '',
                    vendorId: p.vendor?._id || ''
                  });
                });
              }
            });
            this.searchedProducts = flat.length ? flat : resdata.data.map((p: any) => ({
              ...p,
              vendorName: p.vendor?.name || '',
              vendorId: p.vendor?._id || ''
            }));
          } else {
            this.searchedProducts = [];
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.searchedProducts = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      const lowerTerm = term.toLowerCase();
      this.filteredVendors = this.vendorDetails.filter((v: any) =>
        v.name.toLowerCase().includes(lowerTerm) || v.description?.toLowerCase().includes(lowerTerm)
      );
      this.searchedProducts = [];
      this.cdr.detectChanges();
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchedProducts = [];
    this.applyFiltersAndSort();
  }

  navigateToProductVendor(product: any) {
    this.router.navigate(['/items'], {
      queryParams: { vendorId: product.vendorId || product.vendor?._id }
    });
  }

  async openSortSheet() {
    const sortOptions = [
      { text: 'Relevance (Default)', role: this.activeSort === '' ? 'selected' : '', data: '' },
      { text: 'Rating: High to Low', data: 'rating_desc' },
      { text: 'Delivery Time: Fast First', data: 'delivery_asc' },
      { text: 'Distance: Nearest First', data: 'distance_asc' },
      { text: 'Cost: Low to High', data: 'cost_asc' },
      { text: 'Cancel', role: 'cancel' }
    ];

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Sort by',
      buttons: sortOptions.map(opt => ({
        text: opt.text,
        role: opt.role,
        handler: () => {
          if (opt.data !== undefined) {
            this.activeSort = opt.data;
            this.applyFiltersAndSort();
          }
        }
      }))
    });
    await actionSheet.present();
  }

  toggleFilter(filterName: string) {
    const idx = this.activeFilters.indexOf(filterName);
    if (idx > -1) {
      this.activeFilters.splice(idx, 1);
    } else {
      this.activeFilters.push(filterName);
    }
    this.applyFiltersAndSort();
  }

  isFilterActive(filterName: string): boolean {
    return this.activeFilters.includes(filterName);
  }

  selectCuisine(cuisineName: string) {
    this.selectedCuisine = this.selectedCuisine === cuisineName ? '' : cuisineName;
    this.applyFiltersAndSort();
  }

  clearFilters() {
    this.activeFilters = [];
    this.activeSort = '';
    this.selectedCuisine = '';
    this.searchTerm = '';
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    let source = [...this.vendorDetails];

    // Text search
    if (this.searchTerm) {
      const lowerTerm = this.searchTerm.toLowerCase();
      source = source.filter(v =>
        v.name.toLowerCase().includes(lowerTerm) || v.description?.toLowerCase().includes(lowerTerm)
      );
    }

    // Cuisine filter
    if (this.selectedCuisine) {
      source = source.filter(v =>
        v.cuisineType?.toLowerCase().includes(this.selectedCuisine.toLowerCase()) ||
        v.tags?.some((t: string) => t.toLowerCase().includes(this.selectedCuisine.toLowerCase()))
      );
    }

    // Chip filters
    for (const filter of this.activeFilters) {
      switch (filter) {
        case 'Top rated':
        case 'Highest rated':
          source = source.filter(v => (v.rating || 0) >= 4.0);
          break;
        case 'Fast delivery':
        case 'Express':
          source = source.filter(v => (v.approxDeliveryTime || 99) <= 20);
          break;
        case 'Offers':
        case 'Discounts':
        case 'Discount promo':
          source = source.filter(v => v.tags?.some((t: string) =>
            t.toLowerCase().includes('discount') || t.toLowerCase().includes('offer') || t.toLowerCase().includes('free')
          ));
          break;
        case 'Pure veg':
        case 'Organic':
          source = source.filter(v => v.isVeg || v.isOrganic);
          break;
        case 'Nearest':
          source.sort((a, b) => parseFloat(a.distance || '999') - parseFloat(b.distance || '999'));
          break;
        case 'Best price':
          source.sort((a, b) => (a.startPrice || 0) - (b.startPrice || 0));
          break;
      }
    }

    // Sort
    switch (this.activeSort) {
      case 'rating_desc':
        source.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'delivery_asc':
        source.sort((a, b) => (a.approxDeliveryTime || 99) - (b.approxDeliveryTime || 99));
        break;
      case 'distance_asc':
        source.sort((a, b) => parseFloat(a.distance || '999') - parseFloat(b.distance || '999'));
        break;
      case 'cost_asc':
        source.sort((a, b) => (a.startPrice || 0) - (b.startPrice || 0));
        break;
    }

    this.filteredVendors = source;
    this.cdr.detectChanges();
  }

  addToCart(item: any) {
    const cartItems = this.storageService.getItem('cart-items') || [];
    const vendor = item.vendor || {};
    const vendorId = item.vendorId || vendor._id || 'unknown';

    const existing = cartItems.find((c: any) => c._id === item._id);
    if (existing) {
      existing.itemCount = (existing.itemCount || existing.quantity || 1) + 1;
    } else {
      cartItems.push({
        _id: item._id,
        productName: item.productName || item.name || '',
        price: item.price || 0,
        basePrice: item.actualPrice || item.basePrice || undefined,
        itemCount: 1,
        imageUrl: item.imageUrl || '',
        type: item.type || '',
        vendorId,
        vendorName: item.vendorName || vendor.businessName || vendor.name || '',
        vendorImage: item.vendorImage || vendor.imageUrl || '',
        vendorCuisine: item.vendorCuisine || vendor.cuisineType || '',
      });
    }
    this.storageService.setItem('cart-items', cartItems);
    this.loadCart();
    this.commonService.presentToast('bottom', `${item.productName || 'Item'} added to cart`, 'success');
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

  getDealDiscountLabel(deal: any): string {
    if (!deal.discountValue) return '';
    if (deal.discountType === 'percentage') {
      return `${deal.discountValue}% OFF`;
    }
    return `\u20B9${deal.discountValue} OFF`;
  }

  navigateTrendingSeeAll() {
    this.router.navigate(['/popular-vendors'], {
      queryParams: {
        localityId: this.localityId,
        category: this.categoryId
      }
    });
  }

  async openModal(passData: any) {
    const modal = await this.modalCtrl.create({
      component: SpecificItemListPage,
      componentProps: { data: passData }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {}
  }

  async openFeaturedItemsMoal() {
    const modal = await this.modalCtrl.create({
      component: AllItemsPage,
      componentProps: { data: { locality: this.localityId, category: this.categoryId } }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {}
  }

  async openCouponModal() {
    const modal = await this.modalCtrl.create({
      component: CouponsPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {}
  }
}
