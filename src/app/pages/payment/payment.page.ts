import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
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

  // Error dialog state
  showErrorDialog = false;
  errorType: 'vendor_closed' | 'active_order' | 'generic' = 'generic';
  errorTitle = '';
  errorMessage = '';
  errorClosedVendors: string[] = [];

  get errorIcon(): string {
    const map: Record<string, string> = {
      vendor_closed: 'storefront-outline',
      active_order: 'hourglass-outline',
      generic: 'warning-outline',
    };
    return map[this.errorType] || 'warning-outline';
  }

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
    private cdr: ChangeDetectorRef,
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

  confirmOrder(force = false) {
    if (this.isPlacing || !this.orderPayload) return;

    this.isPlacing = true;
    this.showErrorDialog = false;

    const payload = {
      ...this.orderPayload,
      paymentMethod: this.selectedPayment === 'COD' ? 'cod' : 'online',
      ...(force ? { forcePlace: true } : {}),
    };

    this.orderService.placeOrder(payload).subscribe({
      next: (res: any) => {
        if (res?.status && res?.data) {
          this.modalCtrl.dismiss(
            { orderId: res.data.orderId, _id: res.data._id },
            'confirm'
          );
        } else {
          // Backend may return HTTP 200 with status:false and a code field
          this.handleErrorByCode(res?.code, res?.message, res?.closedVendors);
          this.isPlacing = false;
        }
      },
      error: (err: any) => {
        const errBody = err?.error || err;
        this.handleErrorByCode(errBody?.code, errBody?.message, errBody?.closedVendors);
        this.isPlacing = false;
      }
    });
  }

  private handleErrorByCode(code: string, message: string, closedVendors?: string[]) {
    if (code === 'VENDOR_UNAVAILABLE') {
      this.openErrorDialog(
        'vendor_closed',
        'Store Unavailable',
        'The following store(s) are currently closed and cannot accept new orders right now.',
        closedVendors || []
      );
    } else if (code === 'ACTIVE_ORDER_EXISTS') {
      this.openErrorDialog(
        'active_order',
        'Active Order in Progress',
        'You already have an order being prepared. You can still place this new order alongside it.'
      );
    } else {
      this.openErrorDialog(
        'generic',
        'Order Failed',
        message || 'Something went wrong. Please try again in a moment.'
      );
    }
  }

  private openErrorDialog(
    type: 'vendor_closed' | 'active_order' | 'generic',
    title: string,
    message: string,
    closedVendors: string[] = []
  ) {
    this.errorType = type;
    this.errorTitle = title;
    this.errorMessage = message;
    this.errorClosedVendors = closedVendors;
    this.showErrorDialog = true;
    this.cdr.detectChanges();
  }

  closeErrorDialog() {
    this.showErrorDialog = false;
  }

  placeOrderForced() {
    this.confirmOrder(true);
  }

  dismissToCart() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
