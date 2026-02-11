import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventBusService } from '../services/event-bus.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit, OnDestroy {
  cartBadgeCount = 0;
  private cartSub!: Subscription;

  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    const list = document.querySelectorAll('.list');
    list.forEach(item => item.addEventListener('click', (e: any) => {
      list.forEach(li => li.classList.remove('active'));
      e.currentTarget.classList.add('active');
    }));

    this.updateCartBadge();
    this.cartSub = this.eventBus.on('cart:updated').subscribe(() => {
      this.updateCartBadge();
    });
  }

  ionViewWillEnter() {
    this.updateCartBadge();
  }

  updateCartBadge() {
    try {
      const raw = localStorage.getItem('cart-items');
      if (raw) {
        const items: any[] = JSON.parse(raw);
        this.cartBadgeCount = items.reduce((sum: number, item: any) => sum + (item.itemCount || 0), 0);
      } else {
        this.cartBadgeCount = 0;
      }
    } catch {
      this.cartBadgeCount = 0;
    }
  }

  ngOnDestroy() {
    this.cartSub?.unsubscribe();
  }
}
