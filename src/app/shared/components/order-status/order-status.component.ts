import { Component, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { EventBusService } from 'src/app/services/event-bus.service';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OrderStatusComponent implements OnInit {
  @Input() orderCode: string = '';

  state: 'success' = 'success';

  constructor(
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,
    private eventBus: EventBusService,
  ) {}

  ngOnInit() {
    // Order already placed by PaymentPage — clear cart immediately
    localStorage.removeItem('cart-items');
    this.eventBus.emit('cart:updated', 0);
    this.cdr.detectChanges();
  }

  trackOrder() {
    this.modalCtrl.dismiss({ action: 'track' }, 'confirm');
  }

  goHome() {
    this.modalCtrl.dismiss({ action: 'home' }, 'confirm');
  }
}
