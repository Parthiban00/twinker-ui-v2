import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { forkJoin, of, Subscription } from 'rxjs';
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
import { OrderService } from 'src/app/services/order.service';

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
export class CartPage implements OnInit, OnDestroy {
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
  private backButtonSub?: Subscription;

  // Vertical
  activeVertical: 'eats' | 'mart' = 'eats';

  get eatsCartCount(): number {
    return this.storageService.getEatsCart()
      .reduce((s: number, i: any) => s + (i.itemCount || i.quantity || 1), 0);
  }

  get martCartCount(): number {
    return this.storageService.getMartCart()
      .reduce((s: number, i: any) => s + (i.itemCount || i.quantity || 1), 0);
  }

  get hasBothCarts(): boolean {
    return this.eatsCartCount > 0 && this.martCartCount > 0;
  }

  // Active order banner
  activeOrders: any[] = [];
  forcePlace: boolean = false;

  // Debounce handle for fee/offer API calls on qty change
  private refreshDebounce: any = null;

  get activeOrder(): any {
    return this.activeOrders[0] || null;
  }

  get activeOrderCount(): number {
    return this.activeOrders.length;
  }

  constructor(
    private modalCtrl: ModalController,
    public router: Router,
    private eventBus: EventBusService,
    private dealsService: DealsService,
    private homeMainService: HomeMainService,
    private storageService: StorageService,
    private commonService: CommonService,
    private cartService: CartService,
    private orderService: OrderService,
    private platform: Platform,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.activeVertical = this.storageService.getActiveVertical();
    this.loadCart();
  }

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.goBack();
    });
  }

  ionViewWillLeave() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
      this.backButtonSub = undefined;
    }
  }

  ngOnDestroy() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
      this.backButtonSub = undefined;
    }
  }

  loadCart() {
    const rawItems: any[] = this.storageService.getCartByVertical(this.activeVertical);
    if (!rawItems.length) {
      this.cartItems = [];
      this.vendorGroups = [];
      return;
    }
    try {
      // Normalize: flatten nested vendor object and standardize quantity field name
      this.cartItems = rawItems.map((item: any) => {
        const vendor = item.vendor || {};
        return {
          ...item,
          itemCount: item.itemCount || item.quantity || 1,
          vendorId: item.vendorId || vendor._id || 'unknown',
          vendorName: item.vendorName || vendor.businessName || vendor.name || (this.activeVertical === 'mart' ? 'Unknown Store' : 'Unknown Restaurant'),
          vendorImage: item.vendorImage || vendor.imageUrl || '',
          vendorCuisine: item.vendorCuisine || vendor.cuisineType || '',
        };
      });
      // Persist the normalized form so future reads are already clean
      this.storageService.saveCartByVertical(this.activeVertical, this.cartItems);
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

    // Check for active orders in the same vertical (for banner)
    this.orderService.getActiveOrder(user._id, this.activeVertical).subscribe({
      next: (res: any) => {
        this.activeOrders = res?.data || [];
        this.cdr.detectChanges();
      },
      error: () => { this.activeOrders = []; }
    });

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

  setForcePlace() {
    this.forcePlace = true;
    this.cdr.detectChanges();
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

  get isCheckoutLoading(): boolean {
    if (this.isCartEmpty) return false;
    return this.isLoadingOffers || this.isLoadingFees || !this.userAddress || !this.feeBreakdown;
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
    this.storageService.saveCartByVertical(this.activeVertical, this.cartItems);
    this.eventBus.emit('cart:updated', this.totalItems);
    this.buildVendorGroups();
    this.cdr.detectChanges();

    // Debounce API calls (offers + fees) by 400ms to avoid hammering server on rapid taps
    if (this.refreshDebounce) clearTimeout(this.refreshDebounce);
    this.refreshDebounce = setTimeout(() => {
      if (this.localityId) {
        this.fetchOffers();
        this.calculateCartFees();
      }
    }, 400);
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
        } else if (!this.feeBreakdown) {
          // Keep checkout unblocked even if live fee API returns empty payload.
          this.feeBreakdown = this.createFallbackFeeBreakdown();
        }
        this.isLoadingFees = false;
        this.cdr.detectChanges();
      },
      error: () => {
        if (!this.feeBreakdown) {
          // Keep checkout unblocked even if live fee API fails.
          this.feeBreakdown = this.createFallbackFeeBreakdown();
        }
        this.isLoadingFees = false;
        this.cdr.detectChanges();
      }
    });
  }

  private createFallbackFeeBreakdown(): FeeBreakdown {
    return {
      delivery: {
        fee: 0,
        originalFee: 0,
        freeDeliveryApplied: false,
        freeDeliveryThreshold: 0,
        baseDistanceKm: 0,
        baseFee: 0,
        perKmCharge: 0,
        maxDistanceKm: 0,
        storeCount: 0,
        multiStoreSurchargePercent: 0,
        vendorDistances: [],
      },
      platformFee: 0,
      tax: {
        amount: 0,
        type: 'flat',
        value: 0,
        label: 'Tax',
      },
      totalFees: 0,
    };
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
      this.router.navigate(['/items'], {
        queryParams: {
          vendorId,
          vertical: this.activeVertical
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/tabs/home-main']);
  }

  clearCart() {
    this.storageService.clearCartByVertical(this.activeVertical);
    this.cartItems = [];
    this.vendorGroups = [];
    this.appliedOffer = null;
    this.couponDiscount = 0;
    this.applicableOffers = [];
    this.feeBreakdown = null;
    this.eventBus.emit('cart:updated', 0);
  }

  switchVertical(v: 'eats' | 'mart') {
    if (this.activeVertical === v) return;
    this.activeVertical = v;
    this.storageService.saveActiveVertical(v);
    this.eventBus.emit('vertical:changed', v);
    // Reset all state for the new vertical
    this.cartItems = [];
    this.vendorGroups = [];
    this.appliedOffer = null;
    this.couponDiscount = 0;
    this.feeBreakdown = null;
    this.applicableOffers = [];
    this.vendorAllOffers = {};
    this.activeOrders = [];
    this.forcePlace = false;
    this.showOfferSheet = false;
    this.couponCode = '';
    this.cdr.detectChanges();
    this.loadCart();
  }

  browsRestaurants() {
    this.storageService.saveActiveVertical(this.activeVertical);
    this.router.navigate(['/tabs/home-main']);
  }

  goToDeals() {
    this.router.navigate(['/tabs/deals']);
  }

  changeLocation() {
    this.router.navigate(['/location-setup']);
  }

  async openPaymentModal() {
    if (this.isCheckoutLoading) return;

    const user = this.storageService.getUser();

    // Build the full order payload to send to the backend
    const orderPayload = {
      userId: user._id,
      localityId: this.localityId,
      vertical: this.activeVertical,
      vendorOrders: this.vendorGroups.map(group => ({
        vendor: group.vendorId,
        vendorName: group.vendorName,
        vendorAddress: '',
        items: group.items.map(item => ({
          product: item._id,
          productName: item.productName,
          quantity: item.itemCount,
          price: item.price,
          actualPrice: item.basePrice || item.price,
          totalPrice: item.price * item.itemCount,
        })),
        subtotal: group.subtotal,
        offerDiscount: group.offerDiscount || 0,
        appliedOffer: group.appliedOffer ? {
          offerId: group.appliedOffer._id,
          offerTitle: group.appliedOffer.title,
          offerCode: group.appliedOffer.code || '',
          offerType: group.appliedOffer.type || group.appliedOffer.offerType || 'restaurant',
          discountType: group.appliedOffer.discountType || 'percentage',
          discountValue: group.appliedOffer.discountValue || 0,
          maxDiscountCap: group.appliedOffer.maxDiscountCap ?? null,
          minOrderAmount: group.appliedOffer.minOrderAmount || 0,
          discountAmount: group.offerDiscount || 0,
        } : undefined,
        status: 'placed',
      })),
      deliveryAddress: {
        addressId: this.userAddress?._id,
        label: this.userAddress?.addressType || 'Home',
        fullAddress: this.userAddress?.fullAddress || this.userAddress?.addressLine1 || '',
        landmark: this.userAddress?.landmark || '',
        coords: this.userAddress?.coords || { lat: 0, lng: 0 },
      },
      itemTotal: this.totalDiscountedPrice,
      vendorDiscounts: this.vendorDiscountTotal,
      couponDiscount: this.couponDiscount,
      appliedCoupon: this.appliedOffer ? {
        code: this.appliedOffer.code || '',
        offerId: this.appliedOffer._id,
        offerTitle: this.appliedOffer.title || '',
        offerType: this.appliedOffer.type || this.appliedOffer.offerType || 'platform_coupon',
        discountType: this.appliedOffer.discountType || 'percentage',
        discountValue: this.appliedOffer.discountValue || 0,
        maxDiscountCap: this.appliedOffer.maxDiscountCap ?? null,
        minOrderAmount: this.appliedOffer.minOrderAmount || 0,
        discountAmount: this.couponDiscount,
      } : undefined,
      deliveryFee: this.deliveryFee,
      platformFee: this.platformFee,
      taxAmount: this.taxAmount,
      totalAmount: this.totalPayment,
      forcePlace: this.forcePlace,
    };

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
        deliveryAddress: this.userAddress?.fullAddress || '',
        orderPayload,
      },
      cssClass: 'payment-confirm-modal'
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      // data = { orderId: 'TW-...', _id: '...' }
      await this.openOrderStatus(data?.orderId);
    }
  }

  private async openOrderStatus(orderCode: string = '') {
    const modal = await this.modalCtrl.create({
      component: OrderStatusComponent,
      componentProps: { orderCode, vertical: this.activeVertical },
      cssClass: 'order-status-modal',
      backdropDismiss: false,
      showBackdrop: false
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'cancel') {
      // User dismissed — stay on cart page
      return;
    }
    // Cart already cleared by OrderStatusComponent
    this.cartItems = [];
    this.vendorGroups = [];
    this.appliedOffer = null;
    this.couponDiscount = 0;
    if (data?.action === 'track') {
      this.router.navigate(['/tabs/orders'], { queryParams: { highlight: orderCode } });
    } else {
      this.router.navigate(['/tabs/home-main']);
    }
  }
}
