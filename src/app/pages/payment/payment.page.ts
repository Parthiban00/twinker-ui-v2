import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OrderService } from 'src/app/services/order.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: false,
})
export class PaymentPage implements OnInit {
  @Input() totalAmount: number = 0;
  @Input() totalItems: number = 0;
  @Input() totalSaved: number = 0;
  @Input() deliveryAddress: string = '';
  @Input() deliveryFee: number = 0;
  @Input() platformFee: number = 0;
  @Input() taxAmount: number = 0;
  @Input() feeBreakdown: any = null;
  @Input() appliedOffer: any = null;
  @Input() couponDiscount: number = 0;
  @Input() orderPayload: any = null;

  selectedPayment: string = 'COD';
  isPlacing = false;
  placeError: string = '';

  paymentOptions = [
    {
      id: 'COD',
      name: 'Cash on Delivery',
      description: 'Pay when your order arrives',
      icon: 'cash-outline',
      enabled: true
    },
    {
      id: 'PG',
      name: 'Payment Gateway',
      description: 'Coming soon',
      icon: 'card-outline',
      enabled: false
    }
  ];

  constructor(
    private modalCtrl: ModalController,
    private orderService: OrderService,
    private commonService: CommonService,
  ) {}

  ngOnInit() {}

  selectPayment(id: string) {
    const option = this.paymentOptions.find(o => o.id === id);
    if (option?.enabled) {
      this.selectedPayment = id;
    }
  }

  cancel() {
    if (this.isPlacing) return;
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirmOrder() {
    if (this.isPlacing || !this.orderPayload) return;

    this.isPlacing = true;
    this.placeError = '';

    const payload = {
      ...this.orderPayload,
      paymentMethod: this.selectedPayment === 'COD' ? 'cod' : 'online',
    };

    this.orderService.placeOrder(payload).subscribe({
      next: (res: any) => {
        if (res?.status && res?.data) {
          this.modalCtrl.dismiss(
            { orderId: res.data.orderId, _id: res.data._id },
            'confirm'
          );
        } else {
          this.placeError = res?.message || 'Failed to place order. Please try again.';
          this.isPlacing = false;
        }
      },
      error: (err: any) => {
        const errBody = err?.error;
        if (errBody?.code === 'VENDOR_UNAVAILABLE') {
          const names = (errBody.closedVendors || []).join(', ');
          this.placeError = `Some vendors are currently closed: ${names}. Please remove them or try again later.`;
        } else if (errBody?.code === 'ACTIVE_ORDER_EXISTS') {
          this.placeError = 'You already have an active order. Go back to cart and choose "Place anyway".';
        } else {
          this.placeError = errBody?.message || 'Failed to place order. Please try again.';
        }
        this.isPlacing = false;
      }
    });
  }
}
