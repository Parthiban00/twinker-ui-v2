import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { PaymentPage } from '../payment/payment.page';
import { OrderStatusComponent } from 'src/app/shared/components/order-status/order-status.component';
import { environment } from 'src/environments/environment';
import { EventBusService } from 'src/app/services/event-bus.service';

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

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private navController: NavController,
    private eventBus: EventBusService
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
      this.cartItems = JSON.parse(raw) || [];
    } catch (_) {
      this.cartItems = [];
    }
    this.buildVendorGroups();
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

  get totalPayment(): number {
    return this.totalDiscountedPrice;
  }

  get totalSaved(): number {
    return this.totalOriginalPrice - this.totalDiscountedPrice;
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
    this.eventBus.emit('cart:updated', 0);
  }

  browsRestaurants() {
    this.router.navigate(['/home-land']);
  }

  async openPaymentModal() {
    const modal = await this.modalCtrl.create({
      component: PaymentPage,
      componentProps: {
        totalAmount: this.totalPayment,
        totalItems: this.totalItems,
        totalSaved: this.totalSaved
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
    if (data?.action === 'track') {
      this.router.navigate(['/orders']);
    } else {
      this.router.navigate(['/tabs/home-main']);
    }
  }
}
