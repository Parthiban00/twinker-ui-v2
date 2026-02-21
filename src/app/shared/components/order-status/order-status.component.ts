import { Component, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { EventBusService } from 'src/app/services/event-bus.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OrderStatusComponent implements OnInit {
  @Input() orderCode: string = '';
  @Input() vertical: 'eats' | 'mart' = 'eats';

  state: 'success' = 'success';

  constructor(
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,
    private eventBus: EventBusService,
    private storageService: StorageService,
  ) {}

  ngOnInit() {
    // Order already placed by PaymentPage — clear the vertical's cart
    this.storageService.clearCartByVertical(this.vertical);
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
