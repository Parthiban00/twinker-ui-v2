import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { OrderService } from 'src/app/services/order.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-order-detail-view',
  templateUrl: './order-detail-view.page.html',
  styleUrls: ['./order-detail-view.page.scss'],
  standalone: false,
})
export class OrderDetailViewPage implements OnInit {
  orderId: string = '';
  order: any = null;
  isLoading = true;

  readonly STATUS_STEPS = ['placed', 'confirmed', 'out_for_delivery', 'delivered'];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private orderService: OrderService,
    private commonService: CommonService,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || '';
      if (this.orderId) this.loadOrder();
    });
  }

  loadOrder() {
    this.isLoading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.order = res?.data || null;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  getStatusStep(status: string): number {
    return this.STATUS_STEPS.indexOf(status);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      placed: 'Placed',
      confirmed: 'Confirmed',
      out_for_delivery: 'On the Way',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  }

  getVendorStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      placed: 'Placed',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      picked_up: 'Picked Up',
    };
    return labels[status] || status;
  }

  getVendorStatusColor(status: string): string {
    if (status === 'ready' || status === 'picked_up') return '#2ecc71';
    if (status === 'preparing') return '#f39c12';
    return '#F85C70';
  }

  getLastStatusEntry(): any {
    if (!this.order?.statusHistory?.length) return null;
    return this.order.statusHistory[this.order.statusHistory.length - 1];
  }

  getVendorImage(vendor: any): string {
    if (vendor?.profileImgUrl) return vendor.profileImgUrl;
    return 'assets/shop.jpg';
  }

  get canCancel(): boolean {
    return this.order?.status === 'placed';
  }

  get isOutForDelivery(): boolean {
    return this.order?.status === 'out_for_delivery';
  }

  get hasDeliveryBoy(): boolean {
    return !!(this.order?.deliveryBoy?.name || this.order?.deliveryBoy?.phone);
  }

  get showPayNow(): boolean {
    return this.order?.paymentMethod === 'cod'
      && this.order?.status !== 'delivered'
      && this.order?.status !== 'cancelled';
  }

  openTracking() {
    this.router.navigate(['/order-tracking'], { queryParams: { orderId: this.orderId } });
  }

  callDeliveryBoy() {
    const phone = this.order?.deliveryBoy?.phone;
    if (phone) window.open(`tel:${phone}`);
  }

  openDirections() {
    const loc = this.order?.deliveryBoy?.location;
    if (loc?.latitude && loc?.longitude) {
      window.open(`https://maps.google.com/?q=${loc.latitude},${loc.longitude}`);
    }
  }

  async cancelOrder() {
    const alert = await this.alertCtrl.create({
      header: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes, Cancel',
          role: 'destructive',
          handler: () => {
            this.orderService.cancelOrder(this.orderId).subscribe({
              next: () => {
                this.commonService.presentToast('bottom', 'Order cancelled', 'success');
                this.loadOrder();
              },
              error: () => {
                this.commonService.presentToast('bottom', 'Failed to cancel order', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  goBack() {
    this.location.back();
  }
}
