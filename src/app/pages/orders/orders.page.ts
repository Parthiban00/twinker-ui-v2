import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';
import { OrderService } from 'src/app/services/order.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: false,
})
export class OrdersPage implements OnInit {
  userId: string = '';
  activeOrders: any[] = [];
  groupedOrders: { label: string; orders: any[] }[] = [];
  isLoading = true;
  highlightOrderId: string = '';
  activeFilter: 'all' | 'active' | 'delivered' | 'cancelled' = 'all';
  private pollInterval: any;
  private tickerInterval: any;
  etaMap: Record<string, { minsLeft: number; pctElapsed: number; phaseLabel: string }> = {};

  readonly ACTIVE_STATUSES = ['placed', 'confirmed', 'out_for_delivery'];
  readonly STATUS_STEPS = ['placed', 'confirmed', 'out_for_delivery', 'delivered'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private orderService: OrderService,
    private commonService: CommonService,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    const user = this.storageService.getUser();
    this.userId = user?._id || '';

    this.route.queryParams.subscribe(params => {
      this.highlightOrderId = params['highlight'] || '';
      if (params['filter']) {
        this.activeFilter = params['filter'] as any;
      }
    });

    this.loadOrders();
  }

  ionViewWillLeave() {
    this.stopPolling();
    this.stopTicker();
  }

  loadOrders() {
    if (!this.userId) { this.isLoading = false; return; }
    this.isLoading = true;

    this.orderService.getOrdersByUser(this.userId).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          const allOrders: any[] = res?.data || [];
          this.activeOrders = allOrders.filter(o => this.ACTIVE_STATUSES.includes(o.status));
          const historyOrders = allOrders.filter(o => !this.ACTIVE_STATUSES.includes(o.status));
          this.groupedOrders = this.groupByDate(historyOrders);
          this.isLoading = false;
          this.refreshEtaMap();
          if (this.activeOrders.length > 0) { this.startPolling(); this.startTicker(); }
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

  private startPolling() {
    this.stopPolling();
    // Poll entire order list — handles multiple active orders and state transitions
    this.pollInterval = setInterval(() => this.refreshActiveOrders(), 15000);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private refreshActiveOrders() {
    if (!this.activeOrders.length) return;
    this.orderService.getOrdersByUser(this.userId).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          const allOrders: any[] = res?.data || [];
          const newActive = allOrders.filter(o => this.ACTIVE_STATUSES.includes(o.status));

          // If an order moved out of active, reload everything
          if (newActive.length !== this.activeOrders.length) {
            const historyOrders = allOrders.filter(o => !this.ACTIVE_STATUSES.includes(o.status));
            this.groupedOrders = this.groupByDate(historyOrders);
          }

          this.activeOrders = newActive;
          this.refreshEtaMap();
          if (this.activeOrders.length === 0) { this.stopPolling(); this.stopTicker(); }
          this.cdr.detectChanges();
        });
      }
    });
  }

  private groupByDate(orders: any[]): { label: string; orders: any[] }[] {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);

    const groups: Record<string, any[]> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Earlier: [],
    };

    for (const order of orders) {
      const d = new Date(order.createdAt); d.setHours(0, 0, 0, 0);
      if (d.getTime() === today.getTime()) groups['Today'].push(order);
      else if (d.getTime() === yesterday.getTime()) groups['Yesterday'].push(order);
      else if (d >= weekAgo) groups['This Week'].push(order);
      else groups['Earlier'].push(order);
    }

    return Object.entries(groups)
      .filter(([, arr]) => arr.length > 0)
      .map(([label, orders]) => ({ label, orders }));
  }

  setFilter(filter: 'all' | 'active' | 'delivered' | 'cancelled') {
    this.activeFilter = filter;
    this.cdr.detectChanges();
  }

  get showActiveCards(): boolean {
    return this.activeOrders.length > 0 && (this.activeFilter === 'all' || this.activeFilter === 'active');
  }

  get filteredGroupedOrders(): { label: string; orders: any[] }[] {
    if (this.activeFilter === 'all') return this.groupedOrders;
    return this.groupedOrders
      .map(g => ({
        label: g.label,
        orders: g.orders.filter(o => {
          if (this.activeFilter === 'delivered') return o.status === 'delivered';
          if (this.activeFilter === 'cancelled') return o.status === 'cancelled';
          return true;
        })
      }))
      .filter(g => g.orders.length > 0);
  }

  get isEmpty(): boolean {
    return !this.showActiveCards && this.filteredGroupedOrders.length === 0;
  }

  orderHasDeliveryBoy(order: any): boolean {
    return !!(order?.deliveryBoy?.name || order?.deliveryBoy?.phone);
  }

  getStatusStep(status: string): number {
    return this.STATUS_STEPS.indexOf(status);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      placed: 'Order Placed',
      confirmed: 'Confirmed',
      out_for_delivery: 'On the Way',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      placed: 'receipt-outline',
      confirmed: 'checkmark-circle-outline',
      out_for_delivery: 'bicycle-outline',
      delivered: 'checkmark-done-circle-outline',
      cancelled: 'close-circle-outline',
    };
    return icons[status] || 'ellipse-outline';
  }

  getStatusColor(status: string): string {
    if (status === 'delivered') return '#2ecc71';
    if (status === 'cancelled') return '#e74c3c';
    return '#F85C70';
  }

  getVendorNames(order: any): string {
    if (!order?.vendorOrders?.length) return '';
    return order.vendorOrders.map((v: any) => v.vendorName).join(' + ');
  }

  getItemCount(order: any): number {
    if (!order?.vendorOrders?.length) return 0;
    return order.vendorOrders.reduce((sum: number, v: any) =>
      sum + v.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0), 0);
  }

  getEstimatedMinutes(order: any): number {
    if (!order?.estimatedDeliveryTime) return 30;
    const diff = new Date(order.estimatedDeliveryTime).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 60000));
  }

  navigateToDetail(orderId: string) {
    this.router.navigate(['/order-detail'], { queryParams: { orderId } });
  }

  openTracking(order: any) {
    if (order?.orderId) {
      this.router.navigate(['/order-tracking'], { queryParams: { orderId: order.orderId } });
    }
  }

  callDeliveryBoy(order: any) {
    const phone = order?.deliveryBoy?.phone;
    if (phone) window.open(`tel:${phone}`);
  }

  async cancelOrder(order: any) {
    if (!order || order.status !== 'placed') return;
    const alert = await this.alertCtrl.create({
      header: 'Cancel Order',
      message: `Cancel order ${order.orderId}?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes, Cancel',
          role: 'destructive',
          handler: () => {
            this.orderService.cancelOrder(order.orderId).subscribe({
              next: () => {
                this.commonService.presentToast('bottom', 'Order cancelled', 'success');
                this.loadOrders();
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

  // ── ETA ticker ─────────────────────────────────────────────

  private startTicker() {
    this.stopTicker();
    this.tickerInterval = setInterval(() => {
      this.ngZone.run(() => {
        this.refreshEtaMap();
        this.cdr.detectChanges();
      });
    }, 60000); // refresh every minute
  }

  private stopTicker() {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
  }

  private refreshEtaMap() {
    const map: typeof this.etaMap = {};
    for (const order of this.activeOrders) {
      map[order.orderId] = this.computeEta(order);
    }
    this.etaMap = map;
  }

  computeEta(order: any): { minsLeft: number; pctElapsed: number; phaseLabel: string } {
    const now = Date.now();
    const etaMins: number = order.etaMinutes || 30;
    const etaTime = order.estimatedDeliveryTime
      ? new Date(order.estimatedDeliveryTime).getTime()
      : now + etaMins * 60000;
    const confirmedAt = etaTime - etaMins * 60000;
    const elapsed = now - confirmedAt;
    const pctElapsed = Math.min(100, Math.max(2, Math.round((elapsed / (etaMins * 60000)) * 100)));
    const minsLeft = Math.max(0, Math.ceil((etaTime - now) / 60000));

    let phaseLabel = '';
    if (order.status === 'placed') {
      phaseLabel = 'Waiting for restaurant';
    } else if (order.status === 'confirmed') {
      phaseLabel = minsLeft > 15 ? 'Preparing your order' : 'Getting ready for pickup';
    } else if (order.status === 'out_for_delivery') {
      phaseLabel = 'On the way to you';
    }

    return { minsLeft, pctElapsed, phaseLabel };
  }

  getEtaArrivalTime(order: any): string {
    if (!order?.estimatedDeliveryTime) return '';
    const d = new Date(order.estimatedDeliveryTime);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }

  goHome() {
    this.router.navigate(['/tabs/home-main']);
  }
}
