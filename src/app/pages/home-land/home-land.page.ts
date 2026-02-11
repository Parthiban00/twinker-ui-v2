import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
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
      { name: 'Pizza', icon: '🍕' },
      { name: 'Biryani', icon: '🍛' },
      { name: 'Chinese', icon: '🥡' },
      { name: 'Burger', icon: '🍔' },
      { name: 'South Indian', icon: '🥘' },
      { name: 'Desserts', icon: '🍰' },
      { name: 'Rolls', icon: '🌯' },
      { name: 'Thali', icon: '🍱' }
    ],
    deals: [
      { title: '50% OFF up to ₹100', subtitle: 'On your first order', badge: 'NEW USER', color: '#F85C70' },
      { title: 'Free delivery', subtitle: 'On orders above ₹199', badge: 'FREE', color: '#2ecc71' },
      { title: 'Flat ₹125 OFF', subtitle: 'Use code TASTY125', badge: 'DEAL', color: '#FF8C42' }
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
      { name: 'Fruits', icon: '🍎' },
      { name: 'Vegetables', icon: '🥬' },
      { name: 'Dairy', icon: '🥛' },
      { name: 'Snacks', icon: '🍿' },
      { name: 'Beverages', icon: '🧃' },
      { name: 'Staples', icon: '🌾' },
      { name: 'Bakery', icon: '🍞' },
      { name: 'Meat', icon: '🥩' }
    ],
    deals: [
      { title: '₹1 deals on fruits', subtitle: 'Limited time only', badge: '₹1', color: '#2ecc71' },
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
      { name: 'OTC', icon: '💊' },
      { name: 'Wellness', icon: '🧘' },
      { name: 'Personal care', icon: '🧴' },
      { name: 'Baby care', icon: '🍼' },
      { name: 'Devices', icon: '🩺' },
      { name: 'Ayurveda', icon: '🌿' }
    ],
    deals: [
      { title: '25% OFF on all orders', subtitle: 'Use code HEALTH25', badge: 'SAVE', color: '#4A5BF5' },
      { title: 'Free delivery', subtitle: 'On pharmacy orders', badge: 'FREE', color: '#2ecc71' },
      { title: 'Flat ₹50 OFF', subtitle: 'On orders above ₹500', badge: 'FLAT', color: '#6C7CFF' }
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
      { name: 'Cakes', icon: '🎂' },
      { name: 'Ice cream', icon: '🍦' },
      { name: 'Cookies', icon: '🍪' },
      { name: 'Pastries', icon: '🥐' },
      { name: 'Chocolates', icon: '🍫' },
      { name: 'Indian sweets', icon: '🍬' }
    ],
    deals: [
      { title: '20% OFF on cakes', subtitle: 'Order above ₹499', badge: 'SWEET', color: '#E91E8C' },
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
      { name: 'Coffee', icon: '☕' },
      { name: 'Juices', icon: '🧃' },
      { name: 'Shakes', icon: '🥤' },
      { name: 'Tea', icon: '🍵' },
      { name: 'Smoothies', icon: '🫐' },
      { name: 'Sodas', icon: '🥂' }
    ],
    deals: [
      { title: 'Flat ₹50 OFF', subtitle: 'On first beverage order', badge: 'SIP', color: '#FF8C42' },
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
export class HomeLandPage implements OnInit {

  categoryId = '';
  vendorDetails: any[] = [];
  filteredVendors: any[] = [];
  localityId = '';
  popularVendors: any[] = [];
  defaultAddress: any;
  imgBaseUrl: string = environment.imageBaseUrl;
  featuredItems: any[] = [];
  popularCuisines: any[] = [];
  productDetails: any[] = [];
  pageTitle = 'Food';

  isLoading = true;
  searchTerm = '';
  activeSort = '';
  activeFilters: string[] = [];
  selectedCuisine = '';

  dummyVendors: any[] = [
    {
      _id: '1',
      name: 'Bottega Restorante',
      description: 'Italian restaurant with various dishes',
      profileImgUrl: '',
      distance: '4.6',
      approxDeliveryTime: 15,
      rating: 4.6,
      ratingCount: 456,
      startPrice: 49,
      tags: ['Extra discount', 'Free delivery'],
      dummyImg: 'assets/announcement-banner.jpg',
      popular: true
    },
    {
      _id: '2',
      name: 'SOULFOOD Jakarta',
      description: 'Indonesian comfort eats served with love',
      profileImgUrl: '',
      distance: '3.2',
      approxDeliveryTime: 10,
      rating: 4.7,
      ratingCount: 346,
      startPrice: 35,
      tags: ['Extra discount'],
      dummyImg: 'assets/announcement-banner.jpg',
      popular: true
    },
    {
      _id: '3',
      name: 'Greyhound Cafe',
      description: 'Hip, industrial-style eatery with fusion menu',
      profileImgUrl: '',
      distance: '2.6',
      approxDeliveryTime: 10,
      rating: 4.2,
      ratingCount: 354,
      startPrice: 39,
      tags: ['Free delivery'],
      dummyImg: 'assets/announcement-banner.jpg'
    },
    {
      _id: '4',
      name: 'Le Quartier',
      description: 'Classic French-influenced brasserie cuisine',
      profileImgUrl: '',
      distance: '5.4',
      approxDeliveryTime: 15,
      rating: 4.6,
      ratingCount: 546,
      startPrice: 79,
      tags: ['Extra discount', 'Free delivery'],
      dummyImg: 'assets/announcement-banner.jpg',
      popular: true
    },
    {
      _id: '5',
      name: 'Sofia Gunawarman',
      description: 'Modern fusion cuisine and cocktails served fresh',
      profileImgUrl: '',
      distance: '1.8',
      approxDeliveryTime: 12,
      rating: 4.6,
      ratingCount: 456,
      startPrice: 55,
      tags: ['Recommended'],
      dummyImg: 'assets/announcement-banner.jpg'
    }
  ];

  dummyDefaultAddress: any = {
    _id: 'addr_001',
    fullAddress: '123 MG Road, Madurai, Tamil Nadu 625001',
    addressType: 'Home',
    defaultAddress: true,
    coords: { lat: 9.9252, lng: 78.1198 },
    locality: { _id: 'loc_001', name: 'Madurai Central' }
  };

  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private activatedRoute: ActivatedRoute,
    private vendorService: VendorService,
    private commonService: CommonService,
    private homeService: HomeMainService,
    private storageService: StorageService
  ) {}

  ngOnInit() {}

  get theme(): CategoryTheme {
    return categoryThemes[this.pageTitle] || defaultTheme;
  }

  get displayVendors(): any[] {
    return this.filteredVendors.length || this.vendorDetails.length
      ? this.filteredVendors
      : this.dummyVendors;
  }

  get trendingVendors(): any[] {
    if (this.popularVendors.length) return this.popularVendors;
    return this.dummyVendors.filter(v => v.popular);
  }

  get hasActiveFilters(): boolean {
    return this.activeFilters.length > 0 || !!this.activeSort || !!this.selectedCuisine || !!this.searchTerm;
  }

  ionViewWillEnter() {
    this.isLoading = true;
    const userData = this.storageService.getUser();

    this.activatedRoute.queryParams.subscribe(params => {
      this.categoryId = params.categoryId;
      this.localityId = params.localityId;

      if (params.title) {
        this.pageTitle = params.title;
      }

      if (userData?._id && (this.categoryId || this.localityId)) {
        this.getDefaultAddressByUserId(userData._id);
      } else {
        this.defaultAddress = this.dummyDefaultAddress;
        this.filteredVendors = [...this.dummyVendors];
        this.isLoading = false;
      }

      if (this.categoryId) {
        this.getFeaturedItemsByCategory(this.categoryId);
        this.getPopularCuisines(this.categoryId);
      }
    });
  }

  getDefaultAddressByUserId(userId: string) {
    this.homeService.getDefaultAddressByUserId(userId).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          this.defaultAddress = resdata.data;
          if (this.categoryId) {
            this.getAllByLocalityAndCategory(this.localityId, this.categoryId);
          }
        } else {
          this.defaultAddress = this.dummyDefaultAddress;
          this.filteredVendors = [...this.dummyVendors];
          this.isLoading = false;
        }
      },
      error: () => {
        this.defaultAddress = this.dummyDefaultAddress;
        this.filteredVendors = [...this.dummyVendors];
        this.isLoading = false;
      }
    });
  }

  getPopularCuisines(categoryId: string) {
    this.homeService.getPopularCuisines(categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          this.popularCuisines = resdata.data;
        } else {
          this.popularCuisines = [];
        }
      },
      error: () => {
        this.popularCuisines = [];
      }
    });
  }

  getFeaturedItemsByCategory(categoryId: string) {
    this.homeService.getFeaturedItemsByCategory(categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          this.featuredItems = resdata.data;
        } else {
          this.featuredItems = [];
        }
      },
      error: () => {
        this.featuredItems = [];
      }
    });
  }

  getAllByLocalityAndCategory(localityId: any, categoryId: any) {
    this.vendorService.getAllByLocalityAndCategory(localityId, categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          this.vendorDetails = resdata.data;
          this.vendorDetails.forEach((vendor) => {
            vendor.distance = this.commonService.calculateDistance(
              this.defaultAddress.coords.lat, this.defaultAddress.coords.lng,
              vendor.latitude, vendor.longitude
            );
            vendor.approxDeliveryTime = (Math.ceil(parseFloat(vendor.distance)) * 3) + 15;
          });
          this.popularVendors = this.vendorDetails.filter(vendor => vendor.popular);
          this.filteredVendors = [...this.vendorDetails];
        } else {
          this.vendorDetails = [];
          this.filteredVendors = [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.vendorDetails = [];
        this.filteredVendors = [];
        this.isLoading = false;
      }
    });
  }

  handleSearchInput(ev: any) {
    const term = ev.target?.value || ev;
    this.searchTerm = term;

    if (!term) {
      this.applyFiltersAndSort();
      return;
    }

    if (this.localityId && this.categoryId) {
      this.vendorService.searchVendorByLocalityAndCategory(term, this.localityId, this.categoryId).subscribe({
        next: (resdata: any) => {
          if (resdata.status && resdata.data) {
            this.filteredVendors = resdata.data;
            this.filteredVendors.forEach((vendor) => {
              vendor.distance = this.commonService.calculateDistance(
                this.defaultAddress.coords.lat, this.defaultAddress.coords.lng,
                vendor.latitude, vendor.longitude
              );
              vendor.approxDeliveryTime = (Math.ceil(parseFloat(vendor.distance)) * 3) + 15;
            });
          } else {
            this.filteredVendors = [];
          }
        },
        error: () => {
          this.filteredVendors = [];
        }
      });
    } else {
      // Client-side search for dummy mode
      const lowerTerm = term.toLowerCase();
      const source = this.vendorDetails.length ? this.vendorDetails : this.dummyVendors;
      this.filteredVendors = source.filter((v: any) =>
        v.name.toLowerCase().includes(lowerTerm) || v.description?.toLowerCase().includes(lowerTerm)
      );
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFiltersAndSort();
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
    let source = this.vendorDetails.length ? [...this.vendorDetails] : [...this.dummyVendors];

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
