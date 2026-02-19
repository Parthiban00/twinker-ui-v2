import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ModalController, NavController, PopoverController } from '@ionic/angular';
import { CommonService } from 'src/app/services/common.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { StorageService } from 'src/app/services/storage.service';
import { ItemsService } from './items.service';
import { environment } from 'src/environments/environment';
import { ItemCustomisePage } from 'src/app/shared/pages/item-customise/item-customise.page';
import { DealsService } from '../deals/deals.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
  standalone: false,
})
export class ItemsPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('menuAnchor', { read: ElementRef }) menuAnchorRef!: ElementRef;

  userData: any;
  vendorId: string = '';
  imgBaseUrl: string = environment.imageBaseUrl;
  productDetails: any[] = [];
  customerReviews: any;
  selectedCategory = '';
  vendorDetails: any;
  specialOfferItems: any[] = [];
  categoryTabs: any[] = [];
  mostPopularItems: any[] = [];
  displayProducts: any[] = [];
  vegOnly = false;
  searchTerm = '';
  starRating = 3;
  averageRating = 3;
  comments = '';
  activeSegment = 'items';

  // Sticky header state
  stickyHeader = false;
  menuThreshold = 0;

  // Menu bottom sheet
  showMenuSheet = false;

  // Cart
  cartItems: any[] = [];

  // Offers
  vendorOffers: any[] = [];
  offersLoading = true;
  copiedCode: string = '';

  dummyVendor: any = {
    name: 'Bottega Ristorante',
    address: 'Fatmagustu, 92180, Jakarta',
    description: 'Italian restaurant serving a variety of pasta, pizza, and continental dishes',
    rating: 4.6,
    distance: '4.2km',
    deliveryTime: '30 min',
    priceRange: '200 for two',
    cuisine: 'Chicagostyle',
    tags: ['Free delivery', 'Take away', 'Chicagostyle'],
    profileImgUrl: '',
    dummyImg: 'assets/shop.jpg'
  };

  dummyDiscounts: any[] = [
    { label: '1 Mln discount 17%', icon: 'pricetag-outline', color: '#2DBCB6' },
    { label: 'Shopping discount 10%', icon: 'cart-outline', color: '#4A5BF5' }
  ];

  dummyProducts: any[] = [
    {
      category: { _id: 'popular', categoryName: 'Popular' },
      products: []
    },
    {
      category: { _id: 'main-courses', categoryName: 'Main Courses' },
      products: [
        {
          _id: 'm1', productName: "Bottega's Fried Rice", description: 'Orange beans, chicken, tomato, lemon, mushroom, peas pilaf', price: 9.50, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'popular', dummyImg: 'assets/fried-rice.jpg', customizable: [], itemCount: 0,
          customizationGroups: [
            {
              _id: 'cg-m1-size', groupName: 'Choose Size', type: 'single', required: true,
              options: [
                { _id: 'cg-m1-s1', name: 'Regular', price: 0, isDefault: true },
                { _id: 'cg-m1-s2', name: 'Medium', price: 2.00 },
                { _id: 'cg-m1-s3', name: 'Large', price: 4.00 },
              ]
            },
            {
              _id: 'cg-m1-extras', groupName: 'Add Extras', type: 'multi', required: false, maxSelect: 3,
              options: [
                { _id: 'cg-m1-e1', name: 'Extra Egg', price: 1.50 },
                { _id: 'cg-m1-e2', name: 'Extra Chicken', price: 2.50 },
                { _id: 'cg-m1-e3', name: 'Mushrooms', price: 1.00 },
                { _id: 'cg-m1-e4', name: 'Spicy Sauce', price: 0 },
              ]
            }
          ]
        },
        { _id: 'm2', productName: 'Salmon with Bacon', description: 'Fresh salmon fillet wrapped in crispy bacon with herbs', price: 12.50, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'popular', dummyImg: 'assets/fish.jpg', customizable: [], itemCount: 0 },
        { _id: 'm3', productName: 'Saut\u00e9 Olio With Sambal Matah', description: 'Tuna fish mixed, olive oil, garlic, ginger, chili, rice', price: 8.50, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'none', dummyImg: 'assets/biriyani.jpg', customizable: [], itemCount: 0 },
        { _id: 'm4', productName: 'Chicken Parmigiana', description: 'Breaded chicken cutlet with marinara and mozzarella', price: 10.50, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'popular', dummyImg: 'assets/chicken.jpg', customizable: [], itemCount: 0 },
      ]
    },
    {
      category: { _id: 'appetizer', categoryName: 'Appetizer' },
      products: [
        { _id: 'a1', productName: 'Chicken Lollipop', description: 'Crispy chicken drumettes with sweet chili sauce', price: 6.50, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'none', dummyImg: 'assets/chicken.jpg', customizable: [], itemCount: 0 },
        { _id: 'a2', productName: 'Calamari', description: 'Deep fried calamari rings with tartar sauce', price: 7.00, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'popular', dummyImg: 'assets/sea-foods.jpg', customizable: [], itemCount: 0 },
        {
          _id: 'a3', productName: 'French Fries with Grated Parmesan', description: 'Crispy fries topped with grated parmesan cheese', price: 5.50, imageUrl: '', isAvailable: true, type: 'veg', tag: 'none', dummyImg: 'assets/meals.jpg', customizable: [], itemCount: 0,
          customizationGroups: [
            {
              _id: 'cg-a3-portion', groupName: 'Choose Portion', type: 'single', required: true,
              options: [
                { _id: 'cg-a3-p1', name: 'Small', price: 0, isDefault: true },
                { _id: 'cg-a3-p2', name: 'Regular', price: 1.50 },
                { _id: 'cg-a3-p3', name: 'Large', price: 3.00 },
              ]
            }
          ]
        },
        { _id: 'a4', productName: 'Nachos Chili Con Carne', description: 'Tortilla chips with spiced beef, cheese, jalapenos', price: 8.00, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'none', dummyImg: 'assets/beaf.jpeg', customizable: [], itemCount: 0 },
      ]
    },
    {
      category: { _id: 'pizza-pasta', categoryName: 'Pizza & Pasta' },
      products: [
        { _id: 'p1', productName: 'Spaghetti Aglio Olio with Chili', description: 'Spaghetti with garlic, olive oil, chili flakes and grilled chicken', price: 9.00, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'none', dummyImg: 'assets/parotta.jpeg', customizable: [], itemCount: 0 },
        {
          _id: 'p2', productName: 'Beef Pepperoni Pizza', description: 'Classic pizza with beef pepperoni and mozzarella', price: 11.00, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'none', dummyImg: 'assets/beaf.jpeg', customizable: [], itemCount: 0,
          customizationGroups: [
            {
              _id: 'cg-p2-crust', groupName: 'Choose Crust', type: 'single', required: true,
              options: [
                { _id: 'cg-p2-c1', name: 'Classic Hand Tossed', price: 0, isDefault: true },
                { _id: 'cg-p2-c2', name: 'Thin Crust', price: 0 },
                { _id: 'cg-p2-c3', name: 'Cheese Burst', price: 3.00 },
              ]
            },
            {
              _id: 'cg-p2-toppings', groupName: 'Extra Toppings', type: 'multi', required: false, maxSelect: 4,
              options: [
                { _id: 'cg-p2-t1', name: 'Extra Cheese', price: 2.00 },
                { _id: 'cg-p2-t2', name: 'Jalapenos', price: 1.00 },
                { _id: 'cg-p2-t3', name: 'Olives', price: 1.00 },
                { _id: 'cg-p2-t4', name: 'Onions', price: 0.50 },
              ]
            }
          ]
        },
        { _id: 'p3', productName: 'Sauce Mac & Cheese', description: 'Creamy macaroni and cheese baked to perfection', price: 7.50, imageUrl: '', isAvailable: true, type: 'veg', tag: 'none', dummyImg: 'assets/meals.jpg', customizable: [], itemCount: 0 },
      ]
    }
  ];

  constructor(
    public popoverController: PopoverController,
    public router: Router,
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private commonService: CommonService,
    private navController: NavController,
    private eventBus: EventBusService,
    private activatedRoute: ActivatedRoute,
    private itemService: ItemsService,
    private dealsService: DealsService
  ) {}

  ngOnInit() {
    this.initDummyPopularItems();
    this.updateDisplayData();
    this.loadCartFromStorage();
  }

  ionViewWillEnter() {
    this.userData = this.storageService.getUser();
    this.activatedRoute.queryParams.subscribe(params => {
      this.vendorId = params['vendorId'];
      if (this.vendorId) {
        this.getAllProductsByVendor(this.vendorId);
        this.getDiscountedItemsByVendor(this.vendorId);
        this.getVendorDetails(this.vendorId);
        this.getReviewsByVendor(this.vendorId);
        this.loadVendorOffers();
      }
    });
  }

  async ionViewDidEnter() {
    // Calculate the scroll threshold for sticky header
    setTimeout(async () => {
      if (this.menuAnchorRef && this.content) {
        const el = this.menuAnchorRef.nativeElement as HTMLElement;
        const rect = el.getBoundingClientRect();
        const scrollEl = await this.content.getScrollElement();
        this.menuThreshold = rect.top + scrollEl.scrollTop - 56;
      }
    }, 300);
  }

  // --- Scroll & Sticky Header ---

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    const threshold = this.menuThreshold || 400;
    const shouldStick = scrollTop > threshold;
    if (shouldStick !== this.stickyHeader) {
      this.stickyHeader = shouldStick;
    }
  }

  // --- Search ---

  handleSearchInput(event: any) {
    this.searchTerm = event.detail.value || '';
  }

  onInlineSearch(event: any) {
    this.searchTerm = (event.target as HTMLInputElement).value || '';
  }

  clearSearch() {
    this.searchTerm = '';
  }

  get filteredPopularItems(): any[] {
    if (!this.searchTerm) return this.mostPopularItems;
    const term = this.searchTerm.toLowerCase();
    return this.mostPopularItems.filter((p: any) =>
      p.productName?.toLowerCase().includes(term)
    );
  }

  getFilteredProducts(products: any[]): any[] {
    let filtered = products;
    if (this.vegOnly) {
      filtered = filtered.filter((p: any) => p.type === 'veg');
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((p: any) =>
        p.productName?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }
    return filtered;
  }

  hasSearchResults(): boolean {
    if (this.filteredPopularItems.length) return true;
    for (const section of this.displayProducts) {
      if (section.category._id === 'popular') continue;
      if (this.getFilteredProducts(section.products).length) return true;
    }
    return false;
  }

  // --- Data helpers ---

  initDummyPopularItems() {
    const allProducts = this.dummyProducts
      .filter((p: any) => p.category._id !== 'popular')
      .flatMap((p: any) => p.products);
    const popular = allProducts.filter((p: any) => p.tag === 'popular');
    this.dummyProducts[0].products = popular.length ? popular : allProducts.slice(0, 4);
  }

  updateDisplayData() {
    const products = this.productDetails.length ? this.productDetails : this.dummyProducts;
    this.displayProducts = products;
    this.categoryTabs = products.map((p: any) => ({ id: p.category._id, name: p.category.categoryName }));
    if (this.categoryTabs.length && !this.selectedCategory) {
      this.selectedCategory = this.categoryTabs[0].id;
    }
    const allProducts = products.flatMap((p: any) => p.products);
    this.mostPopularItems = allProducts
      .filter((p: any) => p.tag === 'popular' || p.tag === 'bestseller')
      .slice(0, 6);
    if (!this.mostPopularItems.length) {
      this.mostPopularItems = allProducts.slice(0, 6);
    }
  }

  get displayVendor(): any {
    return this.vendorDetails || this.dummyVendor;
  }

  get displayDiscounts(): any[] {
    return this.dummyDiscounts;
  }

  isCustomizable(product: any): boolean {
    return product.customizationGroups?.length > 0;
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    const el = document.getElementById('section-' + categoryId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getItemImage(product: any): string {
    if (product.imageUrl) {
      return this.imgBaseUrl + product.imageUrl;
    }
    return product.dummyImg || 'assets/announcement-banner.jpg';
  }

  getCoverImage(): string {
    if (this.vendorDetails?.profileImgUrl) {
      return this.imgBaseUrl + this.vendorDetails.profileImgUrl;
    }
    return this.dummyVendor.dummyImg;
  }

  addItem(product: any) {
    if (this.isCustomizable(product)) {
      this.openModal(product);
    } else {
      product.itemCount = (product.itemCount || 0) + 1;
      this.syncCart();
    }
  }

  removeItem(product: any) {
    if (this.isCustomizable(product)) {
      // Remove last customized cart entry for this product
      const idx = this.cartItems.map(c => c._id).lastIndexOf(product._id);
      if (idx > -1) {
        this.cartItems.splice(idx, 1);
        this.saveCartToStorage();
      }
    } else {
      if (product.itemCount > 0) {
        product.itemCount--;
        this.syncCart();
      }
    }
  }

  getCustomizedItemCount(productId: string): number {
    return this.cartItems.filter(c => c._id === productId && c.cartItemId).reduce((sum, c) => sum + c.itemCount, 0);
  }

  getDisplayCount(product: any): number {
    if (this.isCustomizable(product)) {
      return this.getCustomizedItemCount(product._id);
    }
    return product.itemCount || 0;
  }

  // --- Cart ---

  syncCart() {
    const allProducts = this.displayProducts.flatMap((s: any) => s.products);
    // Deduplicate by _id — popular section shares object refs with category sections
    const seen = new Set<string>();
    const simpleItems = allProducts.filter((p: any) => {
      if (p.itemCount > 0 && !this.isCustomizable(p) && !seen.has(p._id)) {
        seen.add(p._id);
        return true;
      }
      return false;
    });
    // Keep customized entries and other-vendor items
    const customizedItems = this.cartItems.filter(c => c.cartItemId);
    const otherVendorItems = this.cartItems.filter(c => !c.cartItemId && c.vendorId && c.vendorId !== this.vendorId);
    this.cartItems = [...simpleItems, ...customizedItems, ...otherVendorItems];
    this.saveCartToStorage();
  }

  get cartTotalItems(): number {
    return this.cartItems.reduce((sum: number, p: any) => sum + p.itemCount, 0);
  }

  get cartTotalPrice(): number {
    return this.cartItems.reduce((sum: number, p: any) => sum + (p.price * p.itemCount), 0);
  }

  get cartFirstItemName(): string {
    return this.cartItems.length ? this.cartItems[0].productName : '';
  }

  saveCartToStorage() {
    const vendor = this.displayVendor;
    const data = this.cartItems.map((p: any) => ({
      _id: p._id,
      cartItemId: p.cartItemId || null,
      productName: p.productName,
      price: p.price,
      basePrice: p.basePrice || p.price,
      itemCount: p.itemCount,
      imageUrl: p.imageUrl,
      dummyImg: p.dummyImg,
      type: p.type,
      customizations: p.customizations || null,
      customizationSummary: p.customizationSummary || null,
      vendorId: p.vendorId || this.vendorId,
      vendorName: p.vendorName || vendor.name,
      vendorImage: p.vendorImage || vendor.profileImgUrl || vendor.dummyImg,
      vendorCuisine: p.vendorCuisine || vendor.cuisine || vendor.slogan
    }));
    localStorage.setItem('cart-items', JSON.stringify(data));
    this.eventBus.emit('cart:updated', data.length);
  }

  loadCartFromStorage() {
    const raw = localStorage.getItem('cart-items');
    if (!raw) return;
    try {
      const saved: any[] = JSON.parse(raw);
      const allProducts = this.displayProducts.flatMap((s: any) => s.products);
      const currentProductIds = new Set(allProducts.map((p: any) => p._id));

      // Restore simple item counts for products on this vendor's page
      saved.filter(item => !item.cartItemId).forEach((item: any) => {
        const match = allProducts.find((p: any) => p._id === item._id);
        if (match) {
          match.itemCount = item.itemCount;
        }
      });

      // Customized items (from any vendor)
      const customizedItems = saved.filter(item => item.cartItemId);

      // Other-vendor simple items (not in this vendor's product list)
      const otherVendorItems = saved.filter(item => !item.cartItemId && !currentProductIds.has(item._id));

      // Deduplicate current vendor simple items (popular section shares refs)
      const seen = new Set<string>();
      const simpleItems = allProducts.filter((p: any) => {
        if (p.itemCount > 0 && !this.isCustomizable(p) && !seen.has(p._id)) {
          seen.add(p._id);
          return true;
        }
        return false;
      });

      this.cartItems = [...simpleItems, ...customizedItems, ...otherVendorItems];
    } catch (_) {}
  }

  onToggleChange(event: any) {
    this.vegOnly = event.detail.checked;
  }

  onRatingUpdated(rating: number) {
    this.starRating = rating;
  }

  segmentChange(event: any) {
    this.activeSegment = event.detail.value;
  }

  goBack() {
    this.navController.back();
  }

  // --- Menu Bottom Sheet ---

  toggleMenuSheet() {
    this.showMenuSheet = !this.showMenuSheet;
  }

  navigateToCategory(categoryId: string) {
    this.showMenuSheet = false;
    this.selectedCategory = categoryId;
    setTimeout(() => {
      const el = document.getElementById('section-' + categoryId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  }

  // --- API Methods ---

  getAllProductsByVendor(vendorId: string) {
    const queryParams = this.vegOnly ? '?vegOnly=true' : '' + this.searchTerm ? `?search=${this.searchTerm}` : '';
    this.itemService.getAllProductsByVendor(vendorId, queryParams).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.productDetails = resdata.data;
            if (this.productDetails) {
              const productsWithTags = this.productDetails
                .map((category: any) => category.products || [])
                .reduce((acc: any[], products: any[]) => acc.concat(products), [])
                .filter((product: any) => product.tag && product.tag !== 'none');
              if (productsWithTags.length > 0) {
                const featuredItems = {
                  category: {
                    categoryName: 'Popular',
                    closeTime: '',
                    status: true,
                    vendor: productsWithTags[0]?.vendor,
                    _id: 'featured-items',
                  },
                  products: productsWithTags,
                };
                this.productDetails.unshift(featuredItems);
              }
            }
            this.selectedCategory = '';
            this.updateDisplayData();
            this.loadCartFromStorage(); // re-run now that real product IDs are available
          } else {
            this.productDetails = [];
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching products!', 'danger');
      },
    });
  }

  getVendorDetails(vendorId: string) {
    this.itemService.getVendorDetails(vendorId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.vendorDetails = resdata.data;
          } else {
            this.vendorDetails = null;
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching vendor details!', 'danger');
      },
    });
  }

  getDiscountedItemsByVendor(vendorId: string) {
    this.itemService.getDiscountedProductsByVendor(vendorId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.specialOfferItems = resdata.data;
          } else {
            this.specialOfferItems = [];
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching special offer items!', 'danger');
      },
    });
  }

  getReviewsByVendor(vendorId: string) {
    this.itemService.getReviewByVendor(vendorId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.customerReviews = resdata.data;
            this.averageRating = resdata.data.averageRating;
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching reviews!', 'danger');
      },
    });
  }

  submitReview() {
    const reqData = {
      userId: this.userData._id,
      vendorId: this.vendorId,
      starCount: this.starRating,
      comments: this.comments
    };
    this.itemService.addReview(reqData).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          this.getReviewsByVendor(this.vendorId);
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while add review', 'danger');
      },
    });
  }

  async openModal(product: any) {
    const modal = await this.modalCtrl.create({
      component: ItemCustomisePage,
      componentProps: { data: product },
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: 'item-customise-sheet',
      handle: true
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.handleModalData(data);
    }
  }

  handleModalData(modalData: any) {
    const product = modalData.product;
    const vendor = this.displayVendor;
    const cartEntry = {
      _id: product._id,
      cartItemId: `${product._id}_${Date.now()}`,
      productName: product.productName,
      basePrice: product.price,
      price: modalData.totalPrice,
      itemCount: 1,
      imageUrl: product.imageUrl,
      dummyImg: product.dummyImg,
      type: product.type,
      customizations: modalData.customizations,
      customizationSummary: modalData.customizationSummary,
      vendorId: this.vendorId,
      vendorName: vendor.name,
      vendorImage: vendor.profileImgUrl || vendor.dummyImg,
      vendorCuisine: vendor.cuisine || vendor.slogan
    };
    this.cartItems.push(cartEntry);
    this.saveCartToStorage();
  }

  // --- Vendor Offers ---

  loadVendorOffers() {
    this.offersLoading = true;
    const user = this.storageService.getUser();
    const addr = user?.addresses?.find((a: any) => a.isDefault) || user?.addresses?.[0];
    const localityId = addr?.locality?._id || addr?.locality || '';
    if (!localityId) {
      this.offersLoading = false;
      return;
    }
    this.dealsService.getDealsPage(localityId).subscribe({
      next: (res: any) => {
        if (res.status && res.data) {
          const restaurantOffers = (res.data.restaurantOffers || [])
            .filter((o: any) => o.vendor?._id === this.vendorId);
          const platformCoupons = res.data.platformCoupons || [];
          const firstOrderOffers = res.data.firstOrderOffers || [];
          const generalOffers = res.data.generalOffers || [];
          const seen = new Set<string>();
          const combined = [...restaurantOffers, ...firstOrderOffers, ...platformCoupons, ...generalOffers];
          this.vendorOffers = combined.filter((o: any) => {
            if (seen.has(o._id)) return false;
            seen.add(o._id);
            return true;
          });
        }
        this.offersLoading = false;
      },
      error: () => {
        this.offersLoading = false;
      }
    });
  }

  getOfferValue(offer: any): string {
    if (offer.discountType === 'percentage') return `${offer.discountValue}% OFF`;
    return `\u20B9${offer.discountValue} OFF`;
  }

  getOfferSubtitle(offer: any): string {
    const parts: string[] = [];
    if (offer.maxDiscount) parts.push(`Upto \u20B9${offer.maxDiscount}`);
    if (offer.minOrderAmount) parts.push(`Min order \u20B9${offer.minOrderAmount}`);
    return parts.join(' \u2022 ');
  }

  getOfferIcon(offer: any): string {
    switch (offer.type) {
      case 'restaurant': return 'restaurant-outline';
      case 'platform_coupon': return 'ticket-outline';
      case 'first_order': return 'gift-outline';
      case 'locality_based': return 'location-outline';
      default: return 'pricetag-outline';
    }
  }

  getOfferAccent(offer: any): string {
    switch (offer.type) {
      case 'restaurant': return '#F85C70';
      case 'platform_coupon': return '#4A5BF5';
      case 'first_order': return '#2ecc71';
      case 'locality_based': return '#2DBCB6';
      default: return '#FF8C42';
    }
  }

  copyOfferCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCode = code;
      this.commonService.presentToast('bottom', `Code "${code}" copied!`, 'success');
      setTimeout(() => { this.copiedCode = ''; }, 2000);
    });
  }

  getDiscountLabel(item: any): string {
    if (!item.discount) return '';
    if (item.discountType === 'in-percentage') {
      return `${item.discount}% OFF`;
    } else if (item.discountType === 'in-price') {
      return `\u20B9${item.discount} OFF`;
    }
    return '';
  }

  goToCart() {
    this.router.navigate(['/tabs/cart']);
  }
}
