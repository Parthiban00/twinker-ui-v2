import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ModalController, NavController, PopoverController } from '@ionic/angular';
import { CommonService } from 'src/app/services/common.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { StorageService } from 'src/app/services/storage.service';
import { ItemsService } from './items.service';
import { environment } from 'src/environments/environment';
import { ItemCustomisePage } from 'src/app/shared/pages/item-customise/item-customise.page';

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
        { _id: 'm1', productName: "Bottega's Fried Rice", description: 'Orange beans, chicken, tomato, lemon, mushroom, peas pilaf', price: 9.50, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'popular', dummyImg: 'assets/fried-rice.jpg', customizable: [], itemCount: 0 },
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
        { _id: 'a3', productName: 'French Fries with Grated Parmesan', description: 'Crispy fries topped with grated parmesan cheese', price: 5.50, imageUrl: '', isAvailable: true, type: 'veg', tag: 'none', dummyImg: 'assets/meals.jpg', customizable: [], itemCount: 0 },
        { _id: 'a4', productName: 'Nachos Chili Con Carne', description: 'Tortilla chips with spiced beef, cheese, jalapenos', price: 8.00, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'none', dummyImg: 'assets/beaf.jpeg', customizable: [], itemCount: 0 },
      ]
    },
    {
      category: { _id: 'pizza-pasta', categoryName: 'Pizza & Pasta' },
      products: [
        { _id: 'p1', productName: 'Spaghetti Aglio Olio with Chili', description: 'Spaghetti with garlic, olive oil, chili flakes and grilled chicken', price: 9.00, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'none', dummyImg: 'assets/parotta.jpeg', customizable: [], itemCount: 0 },
        { _id: 'p2', productName: 'Beef Pepperoni Pizza', description: 'Classic pizza with beef pepperoni and mozzarella', price: 11.00, imageUrl: '', isAvailable: true, type: 'non-veg', tag: 'none', dummyImg: 'assets/beaf.jpeg', customizable: [], itemCount: 0 },
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
    private itemService: ItemsService
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
    if (product.customizable?.length) {
      this.openModal(product);
    } else {
      product.itemCount = (product.itemCount || 0) + 1;
      this.syncCart();
    }
  }

  removeItem(product: any) {
    if (product.itemCount > 0) {
      product.itemCount--;
      this.syncCart();
    }
  }

  // --- Cart ---

  syncCart() {
    const allProducts = this.displayProducts.flatMap((s: any) => s.products);
    this.cartItems = allProducts.filter((p: any) => p.itemCount > 0);
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
    const data = this.cartItems.map((p: any) => ({
      _id: p._id,
      productName: p.productName,
      price: p.price,
      itemCount: p.itemCount,
      imageUrl: p.imageUrl,
      dummyImg: p.dummyImg,
      type: p.type
    }));
    localStorage.setItem('cart-items', JSON.stringify(data));
  }

  loadCartFromStorage() {
    const raw = localStorage.getItem('cart-items');
    if (!raw) return;
    try {
      const saved: any[] = JSON.parse(raw);
      const allProducts = this.displayProducts.flatMap((s: any) => s.products);
      saved.forEach((item: any) => {
        const match = allProducts.find((p: any) => p._id === item._id);
        if (match) {
          match.itemCount = item.itemCount;
        }
      });
      this.cartItems = allProducts.filter((p: any) => p.itemCount > 0);
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
      componentProps: { data: product }
    });
    modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.role === 'confirm' && data?.data) {
      this.handleModalData(data.data);
    }
  }

  handleModalData(productData: any) {
    console.log('Product data:', productData);
  }
}
