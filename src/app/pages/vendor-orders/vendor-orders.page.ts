import { ChangeDetectorRef, Component } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { VendorOrderService } from 'src/app/services/vendor-order.service';

type TabType = 'new' | 'accepted' | 'ready' | 'pickedup' | 'cancelled';
type DateFilterType = 'today' | 'yesterday' | 'week';

interface OrderItem {
  product?: any;
  productName?: string;
  quantity: number;
  price: number;
  actualPrice?: number;
  totalPrice: number;
}

@Component({
  selector: 'app-vendor-orders',
  templateUrl: './vendor-orders.page.html',
  styleUrls: ['./vendor-orders.page.scss'],
  standalone: false,
})
export class VendorOrdersPage {

  vendorId = '';
  activeTab: TabType = 'new';
  dateFilter: DateFilterType = 'today';
  orders: any[] = [];
  isLoading = false;
  tabCounts: Record<TabType, number> = { new: 0, accepted: 0, ready: 0, pickedup: 0, cancelled: 0 };

  // Confirm modal
  showConfirmModal = false;
  selectedOrder: any = null;
  selectedVendorOrder: any = null;
  editableItems: OrderItem[] = [];
  selectedPrepTime = 15;
  offerWillBeRemoved = false;
  readonly PREP_TIMES = [10, 15, 20, 30, 45, 60];

  // Cancel modal
  showCancelModal = false;
  cancelReason = '';

  constructor(
    private storageService: StorageService,
    private vendorOrderService: VendorOrderService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
  ) {}

  ionViewWillEnter() {
    const user = this.storageService.getUser();
    this.vendorId = user?.vendorId || '';
    this.loadOrders();
    this.loadCounts();
  }

  loadOrders() {
    if (!this.vendorId) return;
    this.isLoading = true;
    this.orders = [];

    const { dateFrom, dateTo } = this.buildDateRange();
    const statusMap: Record<TabType, string> = {
      new: 'placed',
      accepted: 'confirmed',
      ready: 'ready',
      pickedup: 'picked_up',
      cancelled: 'cancelled',
    };
    const statusFilter = statusMap[this.activeTab];

    this.vendorOrderService.getOrdersByVendor(this.vendorId, statusFilter, dateFrom, dateTo).subscribe({
      next: (res: any) => {
        this.orders = res?.data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadCounts() {
    if (!this.vendorId) return;
    const { dateFrom, dateTo } = this.buildDateRange();
    const statusMap: Record<TabType, string> = {
      new: 'placed',
      accepted: 'confirmed',
      ready: 'ready',
      pickedup: 'picked_up',
      cancelled: 'cancelled',
    };
    forkJoin({
      new: this.vendorOrderService.getOrdersByVendor(this.vendorId, statusMap.new, dateFrom, dateTo).pipe(catchError(() => of({ data: [] }))),
      accepted: this.vendorOrderService.getOrdersByVendor(this.vendorId, statusMap.accepted, dateFrom, dateTo).pipe(catchError(() => of({ data: [] }))),
      ready: this.vendorOrderService.getOrdersByVendor(this.vendorId, statusMap.ready, dateFrom, dateTo).pipe(catchError(() => of({ data: [] }))),
      pickedup: this.vendorOrderService.getOrdersByVendor(this.vendorId, statusMap.pickedup, dateFrom, dateTo).pipe(catchError(() => of({ data: [] }))),
      cancelled: this.vendorOrderService.getOrdersByVendor(this.vendorId, statusMap.cancelled, dateFrom, dateTo).pipe(catchError(() => of({ data: [] }))),
    }).subscribe((results) => {
      this.tabCounts.new = results.new?.data?.length || 0;
      this.tabCounts.accepted = results.accepted?.data?.length || 0;
      this.tabCounts.ready = results.ready?.data?.length || 0;
      this.tabCounts.pickedup = results.pickedup?.data?.length || 0;
      this.tabCounts.cancelled = results.cancelled?.data?.length || 0;
      this.cdr.detectChanges();
    });
  }

  setTab(tab: TabType) {
    this.activeTab = tab;
    this.loadOrders();
  }

  setDateFilter(f: DateFilterType) {
    this.dateFilter = f;
    this.loadOrders();
    this.loadCounts();
  }

  private buildDateRange(): { dateFrom: string; dateTo: string } {
    const now = new Date();
    let fromDate: Date;
    let toDate: Date;

    if (this.dateFilter === 'yesterday') {
      fromDate = new Date(now);
      fromDate.setDate(fromDate.getDate() - 1);
      fromDate.setUTCHours(0, 0, 0, 0);
      toDate = new Date(fromDate);
      toDate.setUTCHours(23, 59, 59, 999);
    } else if (this.dateFilter === 'week') {
      fromDate = new Date(now);
      fromDate.setDate(fromDate.getDate() - 6);
      fromDate.setUTCHours(0, 0, 0, 0);
      toDate = new Date(now);
      toDate.setUTCHours(23, 59, 59, 999);
    } else {
      // today
      fromDate = new Date(now);
      fromDate.setUTCHours(0, 0, 0, 0);
      toDate = new Date(now);
      toDate.setUTCHours(23, 59, 59, 999);
    }

    return { dateFrom: fromDate.toISOString(), dateTo: toDate.toISOString() };
  }

  getMyVendorOrder(order: any): any {
    return order.vendorOrders?.find((vo: any) =>
      vo.vendor === this.vendorId ||
      vo.vendor?._id === this.vendorId ||
      vo.vendor?.toString() === this.vendorId
    );
  }

  openConfirmModal(order: any) {
    this.selectedOrder = order;
    this.selectedVendorOrder = this.getMyVendorOrder(order);
    // Deep copy items
    this.editableItems = (this.selectedVendorOrder?.items || []).map((item: any) => ({ ...item }));
    this.selectedPrepTime = 15;
    this.checkOfferWillBeRemoved();
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.selectedOrder = null;
    this.selectedVendorOrder = null;
    this.editableItems = [];
  }

  adjustQty(item: any, delta: number) {
    item.quantity = Math.max(1, (item.quantity || 1) + delta);
    item.totalPrice = (item.price || 0) * item.quantity;
    this.checkOfferWillBeRemoved();
  }

  removeItem(item: any) {
    const idx = this.editableItems.indexOf(item);
    if (idx !== -1) this.editableItems.splice(idx, 1);
    this.checkOfferWillBeRemoved();
  }

  getEditableSubtotal(): number {
    return this.editableItems.reduce((s, i) => s + (i.totalPrice || 0), 0);
  }

  checkOfferWillBeRemoved() {
    const minAmt = this.selectedVendorOrder?.appliedOffer?.minOrderAmount;
    this.offerWillBeRemoved = !!(minAmt && this.getEditableSubtotal() < minAmt);
  }

  confirmOrder() {
    if (!this.selectedOrder || this.editableItems.length === 0) return;
    const orderId = this.selectedOrder.orderId;
    this.vendorOrderService.confirmVendorOrder(orderId, this.vendorId, {
      items: this.editableItems,
      prepTime: this.selectedPrepTime,
    }).subscribe({
      next: () => {
        this.closeConfirmModal();
        this.commonService.presentToast('bottom', 'Order confirmed!', 'success');
        this.loadOrders();
        this.loadCounts();
      },
      error: (err: any) => {
        if (err?.error?.code === 'ORDER_CANCELLED_BY_CUSTOMER') {
          // Customer cancelled while vendor had confirm modal open — close and refresh
          this.closeConfirmModal();
          this.loadOrders();
          this.commonService.presentToast('bottom', 'Order was cancelled by the customer', 'danger');
        } else {
          this.commonService.presentToast('bottom', err?.error?.message || 'Failed to confirm order', 'danger');
        }
      },
    });
  }

  markReady(order: any) {
    this.vendorOrderService.updateVendorOrderStatus(order.orderId, this.vendorId, 'ready').subscribe({
      next: () => {
        this.commonService.presentToast('bottom', 'Order marked as ready!', 'success');
        this.loadOrders();
        this.loadCounts();
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err?.error?.message || 'Failed to update status', 'danger');
      },
    });
  }

  openCancelModal(order: any) {
    this.selectedOrder = order;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.selectedOrder = null;
    this.cancelReason = '';
  }

  submitCancel() {
    if (!this.selectedOrder) return;
    this.vendorOrderService.cancelVendorOrder(this.selectedOrder.orderId, this.vendorId, this.cancelReason).subscribe({
      next: () => {
        this.closeCancelModal();
        this.commonService.presentToast('bottom', 'Order cancelled.', 'danger');
        this.loadOrders();
        this.loadCounts();
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err?.error?.message || 'Failed to cancel order', 'danger');
      },
    });
  }

  callCustomer(order: any) {
    const phone = order.userId?.mobileNo;
    if (phone) window.open('tel:' + phone);
  }

  getTimeSince(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  isUrgent(dateStr: string): boolean {
    const diffMin = (Date.now() - new Date(dateStr).getTime()) / 60000;
    return diffMin > 10;
  }

  // Vertical-aware labels
  getOrderVertical(order: any): 'eats' | 'mart' {
    return order?.vertical || 'eats';
  }

  getReadyLabel(order: any): string {
    return this.getOrderVertical(order) === 'mart' ? 'Packed' : 'Ready';
  }

  getMarkReadyLabel(order: any): string {
    return this.getOrderVertical(order) === 'mart' ? 'Mark Packed' : 'Mark Ready';
  }

  getPickedUpLabel(order: any): string {
    return this.getOrderVertical(order) === 'mart' ? 'Picked Up' : 'Picked Up';
  }

  getVerticalIcon(order: any): string {
    return this.getOrderVertical(order) === 'mart' ? 'bag-handle-outline' : 'restaurant-outline';
  }
}
