import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PaymentPage } from '../payment/payment.page';
import { OrderStatusComponent } from 'src/app/shared/components/order-status/order-status.component';
import { environment } from 'src/environments/environment';
import { EventBusService } from 'src/app/services/event-bus.service';
import { DealsService } from '../deals/deals.service';
import { HomeMainService } from '../home-main/home-main.service';
import { StorageService } from 'src/app/services/storage.service';
import { CommonService } from 'src/app/services/common.service';
import { CartService } from './cart.service';

interface CartItem {
  _id: string;
  cartItemId?: string;
  productName: string;
  price: number;
  basePrice?: number;
  itemCount: number;
  imageUrl?: string;
  dummyImg?: string;
  type?: string;
  customizations?: any;
  customizationSummary?: string;
  vendorId?: string;
  vendorName?: string;
  vendorImage?: string;
  vendorCuisine?: string;
}

interface VendorGroup {
  vendorId: string;
  vendorName: string;
  vendorImage: string;
  vendorCuisine: string;
  items: CartItem[];
  subtotal: number;
  appliedOffer?: any;
  offerDiscount?: number;
}

interface FeeBreakdown {
  delivery: {
    fee: number;
    originalFee: number;
    freeDeliveryApplied: boolean;
    freeDeliveryThreshold: number;
    baseDistanceKm: number;
    baseFee: number;
    perKmCharge: number;
    maxDistanceKm: number;
    storeCount: number;
    multiStoreSurchargePercent: number;
    vendorDistances: { vendorId: string; vendorName: string; distanceKm: number }[];
  };
  platformFee: number;
  tax: {
    amount: number;
    type: string;
    value: number;
    label: string;
  };
  totalFees: number;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage implements OnInit {
  cartItems: CartItem[] = [];
  vendorGroups: VendorGroup[] = [];
  imgBaseUrl: string = environment.imageBaseUrl;

  // Coupon state
  applicableOffers: any[] = [];
  appliedOffer: any = null;
  couponDiscount: number = 0;
  showOfferSheet: boolean = false;
  couponCode: string = '';
  isLoadingOffers: boolean = false;
  localityId: string = '';
  // All vendor restaurant offers (including those below min-order threshold — for nudge display)
  vendorAllOffers: Record<string, any[]> = {};

  // Fee state
  feeBreakdown: FeeBreakdown | null = null;
  isLoadingFees: boolean = false;
  showFeeDetails: boolean = false;
  userAddress: any = null;

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private navController: NavController,
    private eventBus: EventBusService,
    private dealsService: DealsService,
    private homeMainService: HomeMainService,
    private storageService: StorageService,
    private commonService: CommonService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadCart();
  }

  loadCart() {
    const raw = localStorage.getItem('cart-items');
    if (!raw) {
      this.cartItems = [];
      this.vendorGroups = [];
      return;
    }
    try {
      const rawItems: any[] = JSON.parse(raw) || [];
      // Normalize: flatten nested vendor object and standardize quantity field name
      this.cartItems = rawItems.map((item: any) => {
        const vendor = item.vendor || {};
        return {
          ...item,
          itemCount: item.itemCount || item.quantity || 1,
          vendorId: item.vendorId || vendor._id || 'unknown',
          vendorName: item.vendorName || vendor.businessName || vendor.name || 'Unknown Restaurant',
          vendorImage: item.vendorImage || vendor.imageUrl || '',
          vendorCuisine: item.vendorCuisine || vendor.cuisineType || '',
        };
      });
      // Persist the normalized form so future reads are already clean
      localStorage.setItem('cart-items', JSON.stringify(this.cartItems));
    } catch (_) {
      this.cartItems = [];
    }
    this.buildVendorGroups();
    this.loadApplicableOffers();
  }

  buildVendorGroups() {
    const groupMap = new Map<string, VendorGroup>();

    for (const item of this.cartItems) {
      const vid = item.vendorId || 'unknown';
      if (!groupMap.has(vid)) {
        groupMap.set(vid, {
          vendorId: vid,
          vendorName: item.vendorName || 'Unknown Restaurant',
          vendorImage: item.vendorImage || '',
          vendorCuisine: item.vendorCuisine || '',
          items: [],
          subtotal: 0
        });
      }
      const group = groupMap.get(vid)!;
      group.items.push(item);
      group.subtotal += item.price * item.itemCount;
    }

    this.vendorGroups = Array.from(groupMap.values());
  }

  loadApplicableOffers() {
    if (this.isCartEmpty) return;

    const user = this.storageService.getUser();
    if (!user?._id) return;

    this.isLoadingOffers = true;

    this.homeMainService.getDefaultAddressByUserId(user._id).subscribe({
      next: (res: any) => {
        if (res?.status && res?.data?.locality) {
          this.localityId = res.data.locality._id;
          this.userAddress = res.data;
          this.fetchOffers();
          this.calculateCartFees();
        } else {
          this.isLoadingOffers = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.isLoadingOffers = false;
        this.cdr.detectChanges();
      }
    });
  }

  private fetchOffers() {
    const vendorIds = this.vendorGroups.map(g => g.vendorId).filter(id => id !== 'unknown');
    if (vendorIds.length === 0) { this.isLoadingOffers = false; return; }

    const orderAmount = this.totalDiscountedPrice;
    const vendorSubtotals: Record<string, number> = {};
    this.vendorGroups.forEach(g => {
      if (g.vendorId !== 'unknown') vendorSubtotals[g.vendorId] = g.subtotal;
    });

    // Run both calls in parallel:
    // 1. getApplicableOffers → offers that actually meet min-order (for auto-apply + discount calc)
    // 2. getDealsPage → ALL vendor offers regardless of min-order (for nudge display)
    forkJoin({
      applicable: this.dealsService
        .getApplicableOffers(this.localityId, vendorIds, orderAmount, vendorSubtotals)
        .pipe(catchError(() => of(null))),
      allDeals: this.dealsService
        .getDealsPage(this.localityId)
        .pipe(catchError(() => of(null)))
    }).subscribe(({ applicable, allDeals }) => {

      // Build vendorAllOffers map: vendorId → all their restaurant offers (any min-order)
      const allRestaurantOffers: any[] = allDeals?.data?.restaurantOffers || [];
      this.vendorAllOffers = {};
      for (const offer of allRestaurantOffers) {
        const vid = offer.vendor?._id;
        if (vid) {
          if (!this.vendorAllOffers[vid]) this.vendorAllOffers[vid] = [];
          this.vendorAllOffers[vid].push(offer);
        }
      }

      // Auto-apply best restaurant offer per vendor (only ones that meet min-order)
      const allApplicable: any[] = applicable?.status && applicable?.data ? applicable.data : [];
      for (const group of this.vendorGroups) {
        const best = allApplicable
          .filter(o => o.type === 'restaurant' && o.vendor?._id === group.vendorId)
          .sort((a, b) => (b.calculatedDiscount || 0) - (a.calculatedDiscount || 0))[0];
        group.appliedOffer = best || undefined;
        group.offerDiscount = best ? (best.calculatedDiscount || 0) : 0;
      }

      // Coupon section: show only platform/general offers (not already-auto-applied restaurant ones)
      const autoAppliedIds = new Set(
        this.vendorGroups.filter(g => g.appliedOffer).map(g => g.appliedOffer!._id)
      );
      this.applicableOffers = allApplicable.filter(o => !autoAppliedIds.has(o._id));

      this.isLoadingOffers = false;
      if (this.appliedOffer) this.revalidateAppliedOffer();
      this.cdr.detectChanges();
    });
  }

  private revalidateAppliedOffer() {
    if (!this.appliedOffer) return;
    const stillValid = this.applicableOffers.some(o => o._id === this.appliedOffer._id);
    if (!stillValid) {
      const offerCode = this.appliedOffer.code || this.appliedOffer.title;
      this.appliedOffer = null;
      this.couponDiscount = 0;
      this.commonService.presentToast('bottom', `Offer "${offerCode}" removed — order no longer meets requirements`, 'danger');
      this.cdr.detectChanges();
    } else {
      // Recalculate discount with new amounts
      const match = this.applicableOffers.find(o => o._id === this.appliedOffer._id);
      if (match) {
        this.couponDiscount = match.calculatedDiscount;
        this.appliedOffer = match;
      }
    }
  }

  applyOffer(offer: any) {
    this.appliedOffer = offer;
    this.couponDiscount = offer.calculatedDiscount || 0;
    this.showOfferSheet = false;
    this.couponCode = '';
    const name = offer.code || offer.title;
    this.commonService.presentToast('bottom', `${name} applied — you save ₹${this.couponDiscount}`, 'success');
    this.cdr.detectChanges();
  }

  removeOffer() {
    this.appliedOffer = null;
    this.couponDiscount = 0;
    this.cdr.detectChanges();
  }

  removeVendorOffer(group: VendorGroup) {
    group.appliedOffer = undefined;
    group.offerDiscount = 0;
    this.cdr.detectChanges();
  }

  // Returns the best unmet offer for a vendor (for nudge — within ₹300 of threshold)
  getVendorBestNudgeOffer(group: VendorGroup): any {
    if (group.appliedOffer) return null;
    const offers: any[] = this.vendorAllOffers[group.vendorId] || [];
    return offers
      .filter(o => o.minOrderAmount > 0 && o.minOrderAmount > group.subtotal
                   && (o.minOrderAmount - group.subtotal) <= 300)
      .sort((a, b) => (a.minOrderAmount - group.subtotal) - (b.minOrderAmount - group.subtotal))[0] || null;
  }

  getVendorNudgeAmount(group: VendorGroup): number {
    const offer = this.getVendorBestNudgeOffer(group);
    return offer ? Math.ceil(offer.minOrderAmount - group.subtotal) : 0;
  }

  getVendorNudgeLabel(offer: any): string {
    if (!offer) return '';
    if (offer.discountType === 'percentage') return `${offer.discountValue}% OFF`;
    return `₹${offer.discountValue} OFF`;
  }

  applyCouponCode() {
    if (!this.couponCode.trim()) return;

    const now = new Date();
    const clientTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    this.dealsService.validateCoupon({
      code: this.couponCode.trim(),
      localityId: this.localityId,
      orderAmount: this.totalDiscountedPrice,
      clientTime
    }).subscribe({
      next: (res: any) => {
        if (res?.status && res?.data) {
          this.appliedOffer = res.data.offer;
          this.couponDiscount = res.data.discountAmount;
          this.showOfferSheet = false;
          this.couponCode = '';
          this.commonService.presentToast('bottom', `${res.data.offer.code || res.data.offer.title} applied — you save ₹${this.couponDiscount}`, 'success');
        } else {
          this.commonService.presentToast('bottom', res?.message || 'Invalid coupon code', 'danger');
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Invalid or expired coupon code';
        this.commonService.presentToast('bottom', msg, 'danger');
        this.cdr.detectChanges();
      }
    });
  }

  toggleOfferSheet() {
    this.showOfferSheet = !this.showOfferSheet;
  }

  getOfferSavings(offer: any): number {
    return offer.calculatedDiscount || 0;
  }

  getBestOffer(): any {
    if (this.applicableOffers.length === 0) return null;
    return this.applicableOffers[0]; // Already sorted by highest savings
  }

  getOfferLabel(offer: any): string {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    }
    return `₹${offer.discountValue} OFF`;
  }

  get isCartEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  get hasMultipleVendors(): boolean {
    return this.vendorGroups.length > 1;
  }

  get totalOriginalPrice(): number {
    return this.cartItems.reduce((sum, item) => {
      const base = item.basePrice || item.price;
      return sum + (base * item.itemCount);
    }, 0);
  }

  get totalDiscountedPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.itemCount), 0);
  }

  get deliveryFee(): number {
    return this.feeBreakdown?.delivery?.fee ?? 0;
  }

  get platformFee(): number {
    return this.feeBreakdown?.platformFee ?? 0;
  }

  get taxAmount(): number {
    return this.feeBreakdown?.tax?.amount ?? 0;
  }

  get vendorDiscountTotal(): number {
    return this.vendorGroups.reduce((sum, g) => sum + (g.offerDiscount || 0), 0);
  }

  get totalPayment(): number {
    return Math.max(0, this.totalDiscountedPrice - this.vendorDiscountTotal - this.couponDiscount + this.deliveryFee + this.platformFee + this.taxAmount);
  }

  get totalSaved(): number {
    return (this.totalOriginalPrice - this.totalDiscountedPrice) + this.vendorDiscountTotal + this.couponDiscount;
  }

  get totalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.itemCount, 0);
  }

  incrementItem(item: CartItem) {
    item.itemCount++;
    this.saveAndRefresh();
  }

  decrementItem(item: CartItem) {
    item.itemCount--;
    if (item.itemCount <= 0) {
      this.cartItems = this.cartItems.filter(c => c !== item);
    }
    this.saveAndRefresh();
  }

  private saveAndRefresh() {
    localStorage.setItem('cart-items', JSON.stringify(this.cartItems));
    this.eventBus.emit('cart:updated', this.cartItems.length);
    this.buildVendorGroups();
    // Re-fetch offers and fees (order amount may have changed)
    if (this.localityId) {
      this.fetchOffers();
      this.calculateCartFees();
    }
  }

  calculateCartFees() {
    if (this.isCartEmpty || !this.localityId || !this.userAddress) return;

    const vendorIds = this.vendorGroups.map(g => g.vendorId).filter(id => id !== 'unknown');
    if (vendorIds.length === 0) return;

    const coords = this.userAddress.coords;
    if (!coords?.lat || !coords?.lng) return;

    this.isLoadingFees = true;

    this.cartService.calculateFees({
      localityId: this.localityId,
      vendorIds,
      userLat: coords.lat,
      userLng: coords.lng,
      orderSubtotal: this.totalDiscountedPrice
    }).subscribe({
      next: (res: any) => {
        if (res?.status && res?.data) {
          this.feeBreakdown = res.data;
        }
        this.isLoadingFees = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingFees = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleFeeDetails() {
    this.showFeeDetails = !this.showFeeDetails;
  }

  getItemImage(item: CartItem): string {
    if (item.imageUrl) {
      return this.imgBaseUrl + item.imageUrl;
    }
    return item.dummyImg || 'assets/announcement-banner.jpg';
  }

  getVendorImage(group: VendorGroup): string {
    if (group.vendorImage) {
      if (group.vendorImage.startsWith('http') || group.vendorImage.startsWith('assets/')) {
        return group.vendorImage;
      }
      return this.imgBaseUrl + group.vendorImage;
    }
    return 'assets/shop.jpg';
  }

  goToVendor(vendorId: string) {
    if (vendorId && vendorId !== 'unknown') {
      this.router.navigate(['/items'], { queryParams: { vendorId } });
    }
  }

  goBack() {
    this.navController.back();
  }

  clearCart() {
    localStorage.removeItem('cart-items');
    this.cartItems = [];
    this.vendorGroups = [];
    this.appliedOffer = null;
    this.couponDiscount = 0;
    this.applicableOffers = [];
    this.feeBreakdown = null;
    this.eventBus.emit('cart:updated', 0);
  }

  browsRestaurants() {
    this.router.navigate(['/home-land']);
  }

  goToDeals() {
    this.router.navigate(['/tabs/deals']);
  }

  changeLocation() {
    this.router.navigate(['/location-setup']);
  }

  async openPaymentModal() {
    const modal = await this.modalCtrl.create({
      component: PaymentPage,
      componentProps: {
        totalAmount: this.totalPayment,
        totalItems: this.totalItems,
        totalSaved: this.totalSaved,
        appliedOffer: this.appliedOffer,
        couponDiscount: this.couponDiscount,
        deliveryFee: this.deliveryFee,
        platformFee: this.platformFee,
        taxAmount: this.taxAmount,
        feeBreakdown: this.feeBreakdown,
        deliveryAddress: this.userAddress?.fullAddress || ''
      },
      cssClass: 'payment-confirm-modal'
    });
    await modal.present();

    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.openOrderStatus();
    }
  }

  private async openOrderStatus() {
    const modal = await this.modalCtrl.create({
      component: OrderStatusComponent,
      cssClass: 'order-status-modal',
      backdropDismiss: false,
      showBackdrop: false
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'cancel') {
      // User cancelled — cart is still intact, stay on cart page
      return;
    }
    // Order placed successfully — cart already cleared by component
    this.cartItems = [];
    this.vendorGroups = [];
    this.appliedOffer = null;
    this.couponDiscount = 0;
    if (data?.action === 'track') {
      this.router.navigate(['/orders']);
    } else {
      this.router.navigate(['/tabs/home-main']);
    }
  }
}
