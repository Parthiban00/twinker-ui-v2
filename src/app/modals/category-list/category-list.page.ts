import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController, NavParams, Platform } from '@ionic/angular';
import { CommonService } from 'src/app/services/common.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { StorageService } from 'src/app/services/storage.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.page.html',
  styleUrls: ['./category-list.page.scss'],
  standalone: false,
})
export class CategoryListPage implements OnInit, OnDestroy {
  categories: any[] = [];
  filteredCategories: any[] = [];
  localityId = '';
  imgBaseUrl: string = environment.imageBaseUrl;
  searchTerm = '';

  // Deals & offers
  deals: any[] = [];
  bestCoupon: any = null;
  dealCountMap: Record<string, number> = {};
  private backButtonSub?: Subscription;

  private iconMap: Record<string, string> = {
    'food': 'restaurant-outline',
    'groceries': 'cart-outline',
    'medicine': 'medkit-outline',
    'desserts': 'ice-cream-outline',
    'beverages': 'cafe-outline'
  };

  private colorMap: Record<string, { bg: string; accent: string }> = {
    'food': { bg: '#FFF0F0', accent: '#F85C70' },
    'groceries': { bg: '#F0FFF4', accent: '#2ecc71' },
    'medicine': { bg: '#F0F4FF', accent: '#4A5BF5' },
    'desserts': { bg: '#FFF0F8', accent: '#E91E8C' },
    'beverages': { bg: '#FFF5F0', accent: '#FF8C42' }
  };

  private defaultColors = [
    { bg: '#F5F0FF', accent: '#7C4DFF' },
    { bg: '#FFF8E1', accent: '#FFB300' },
    { bg: '#E0F7FA', accent: '#00ACC1' },
    { bg: '#FBE9E7', accent: '#FF5722' },
    { bg: '#E8F5E9', accent: '#43A047' }
  ];

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private storageService: StorageService,
    private commonService: CommonService,
    private eventBus: EventBusService,
    private platform: Platform
  ) {}

  ngOnInit(): void {
    this.categories = this.navParams.get('categories') || [];
    this.localityId = this.navParams.get('localityId') || '';
    this.deals = this.navParams.get('deals') || [];
    this.bestCoupon = this.navParams.get('bestCoupon') || null;
    this.filteredCategories = [...this.categories];
    this.buildDealCountMap();
  }

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(10001, () => {
      this.cancel();
    });
  }

  ngOnDestroy(): void {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
      this.backButtonSub = undefined;
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  handleSearch(ev: any) {
    const term = (ev.target?.value || ev || '').toLowerCase().trim();
    this.searchTerm = term;
    if (!term) {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(
        c => c.categoryName?.toLowerCase().includes(term)
      );
    }
  }

  selectCategory(cat: any) {
    this.modalCtrl.dismiss(cat, 'navigate');
  }

  getIcon(name: string): string {
    return this.iconMap[name?.toLowerCase()] || 'grid-outline';
  }

  getBgColor(name: string, index: number): string {
    const mapped = this.colorMap[name?.toLowerCase()];
    if (mapped) return mapped.bg;
    return this.defaultColors[index % this.defaultColors.length].bg;
  }

  getAccentColor(name: string, index: number): string {
    const mapped = this.colorMap[name?.toLowerCase()];
    if (mapped) return mapped.accent;
    return this.defaultColors[index % this.defaultColors.length].accent;
  }

  getDiscountLabel(deal: any): string {
    if (!deal.discount) return '';
    if (deal.discountType === 'in-percentage') {
      return `${deal.discount}% OFF`;
    } else if (deal.discountType === 'in-price') {
      return `\u20B9${deal.discount} OFF`;
    }
    return `${deal.discount}% OFF`;
  }

  getCouponLabel(): string {
    if (!this.bestCoupon) return '';
    if (this.bestCoupon.discountType === 'percentage') {
      return `${this.bestCoupon.discountValue}% OFF`;
    }
    return `\u20B9${this.bestCoupon.discountValue} OFF`;
  }

  getDealCount(categoryId: string): number {
    return this.dealCountMap[categoryId] || 0;
  }

  addToCart(item: any) {
    const vertical = this.storageService.getActiveVertical();
    const cartItems = this.storageService.getCartByVertical(vertical);
    const vendor = item.vendor || {};
    const vendorId = item.vendorId || vendor._id || 'unknown';

    const existing = cartItems.find((c: any) => (c._id === item._id) && ((c.vendorId || 'unknown') === vendorId));
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
        vertical,
      });
    }

    this.storageService.saveCartByVertical(vertical, cartItems);
    const totalCount = cartItems.reduce((sum: number, ci: any) => sum + (ci.itemCount || ci.quantity || 1), 0);
    this.eventBus.emit('cart:updated', totalCount);
    this.commonService.presentToast('bottom', `${item.productName || item.name || 'Item'} added to cart`, 'success');
  }

  private buildDealCountMap() {
    this.dealCountMap = {};
    this.deals.forEach((deal: any) => {
      const catId = deal.category?._id || deal.category;
      if (catId) {
        this.dealCountMap[catId] = (this.dealCountMap[catId] || 0) + 1;
      }
    });
  }
}
