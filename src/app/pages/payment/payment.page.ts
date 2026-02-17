import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

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

  selectedPayment: string = 'COD';
  isPlacing = false;

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

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  selectPayment(id: string) {
    const option = this.paymentOptions.find(o => o.id === id);
    if (option?.enabled) {
      this.selectedPayment = id;
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirmOrder() {
    this.isPlacing = true;
    // Brief visual feedback then dismiss to order status screen
    setTimeout(() => {
      this.modalCtrl.dismiss(
        { paymentMethod: this.selectedPayment, totalAmount: this.totalAmount },
        'confirm'
      );
    }, 400);
  }
}
