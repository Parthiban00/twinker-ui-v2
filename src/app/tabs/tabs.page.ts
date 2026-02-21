import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventBusService } from '../services/event-bus.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit, OnDestroy {
  cartBadgeCount = 0;
  private cartSub!: Subscription;
  private verticalSub!: Subscription;

  tabs = [
    { path: '/tabs/home-main', icon: 'home', iconOutline: 'home-outline', label: 'Home' },
    { path: '/tabs/deals', icon: 'pricetag', iconOutline: 'pricetag-outline', label: 'Deals' },
    { path: '/tabs/cart', icon: 'cart', iconOutline: 'cart-outline', label: 'Cart', badge: true },
    { path: '/tabs/orders', icon: 'receipt', iconOutline: 'receipt-outline', label: 'Orders' },
    { path: '/tabs/profile', icon: 'person', iconOutline: 'person-outline', label: 'Profile' },
  ];

  constructor(
    private eventBus: EventBusService,
    private storageService: StorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.updateCartBadge();

    // Update badge when items are added/removed from cart
    this.cartSub = this.eventBus.on('cart:updated').subscribe(() => {
      this.updateCartBadge();
      this.cdr.detectChanges();
    });

    // Update badge when the user switches vertical (eats ↔ mart)
    this.verticalSub = this.eventBus.on('vertical:changed').subscribe(() => {
      this.updateCartBadge();
      this.cdr.detectChanges();
    });
  }

  ionViewWillEnter() {
    this.updateCartBadge();
    this.cdr.detectChanges();
  }

  updateCartBadge() {
    const vertical = this.storageService.getActiveVertical();
    const items = this.storageService.getCartByVertical(vertical);
    this.cartBadgeCount = items.reduce((sum: number, item: any) => sum + (item.itemCount || 0), 0);
  }

  ngOnDestroy() {
    this.cartSub?.unsubscribe();
    this.verticalSub?.unsubscribe();
  }
}
