import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';
import { DeliveryLocationService } from 'src/app/services/delivery-location.service';
import { DeliveryService } from 'src/app/services/delivery.service';
import { StorageService } from 'src/app/services/storage.service';

type TabType = 'available' | 'active' | 'done';

@Component({
  selector: 'app-delivery-orders',
  templateUrl: './delivery-orders.page.html',
  styleUrls: ['./delivery-orders.page.scss'],
  standalone: false,
})
export class DeliveryOrdersPage implements OnDestroy {

  deliveryBoyId = '';
  user: any = null;

  activeTab: TabType = 'available';
  availableOrders: any[] = [];
  activeOrders: any[] = [];
  doneOrders: any[] = [];

  isLoadingAvailable = false;
  isLoadingActive = false;
  isLoadingDone = false;

  // Count badges
  tabCounts = { available: 0, active: 0, done: 0 };

  noLocalityAssigned = false;

  // Confirm delivered modal
  showDeliveredModal = false;
  pendingDeliverOrder: any = null;

  private refreshInterval: any = null;

  get isTracking(): boolean {
    return this.deliveryLocationService.isTracking;
  }

  constructor(
    private storageService: StorageService,
    private deliveryService: DeliveryService,
    private deliveryLocationService: DeliveryLocationService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
  ) {}

  ionViewWillEnter() {
    this.user = this.storageService.getUser();
    this.deliveryBoyId = this.user?._id || '';
    this.loadAll();
    this.startAutoRefresh();
  }

  ionViewWillLeave() {
    this.stopAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  private startAutoRefresh() {
    this.stopAutoRefresh();
    // Refresh available + active orders every 20s automatically
    this.refreshInterval = setInterval(() => {
      this.loadAvailable(false);
      this.loadActive(false);
    }, 20000);
  }

  private stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  loadAll() {
    this.loadAvailable(true);
    this.loadActive(true);
    this.loadDone(true);
  }

  loadAvailable(showLoader = true) {
    if (!this.deliveryBoyId) return;
    if (showLoader) this.isLoadingAvailable = true;
    this.deliveryService.getAvailableOrders(this.deliveryBoyId).subscribe({
      next: (res: any) => {
        this.noLocalityAssigned = false;
        this.availableOrders = res?.data || [];
        this.tabCounts.available = this.availableOrders.length;
        this.isLoadingAvailable = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoadingAvailable = false;
        if (err?.error?.code === 'NO_LOCALITY') {
          this.noLocalityAssigned = true;
          this.availableOrders = [];
        }
        this.cdr.detectChanges();
      },
    });
  }

  loadActive(showLoader = true) {
    if (!this.deliveryBoyId) return;
    if (showLoader) this.isLoadingActive = true;
    this.deliveryService.getMyOrders(this.deliveryBoyId, 'active').pipe(catchError(() => of({ data: [] }))).subscribe((res: any) => {
      this.activeOrders = res?.data || [];
      this.tabCounts.active = this.activeOrders.length;
      this.isLoadingActive = false;
      this.cdr.detectChanges();
    });
  }

  loadDone(showLoader = true) {
    if (!this.deliveryBoyId) return;
    if (showLoader) this.isLoadingDone = true;
    this.deliveryService.getMyOrders(this.deliveryBoyId, 'done').pipe(catchError(() => of({ data: [] }))).subscribe((res: any) => {
      this.doneOrders = res?.data || [];
      this.tabCounts.done = this.doneOrders.length;
      this.isLoadingDone = false;
      this.cdr.detectChanges();
    });
  }

  setTab(tab: TabType) {
    this.activeTab = tab;
  }

  // ─── Order State Helpers ──────────────────────────────────────────────────

  /** Returns which action state this active order is in */
  getActiveOrderState(order: any): 'waiting' | 'go_pickup' | 'out_for_delivery' {
    if (order.status === 'out_for_delivery') return 'out_for_delivery';
    // All non-cancelled vendorOrders must be 'ready'
    const activeVOs = (order.vendorOrders || []).filter((vo: any) => vo.status !== 'cancelled');
    const allReady = activeVOs.length > 0 && activeVOs.every((vo: any) => vo.status === 'ready');
    return allReady ? 'go_pickup' : 'waiting';
  }

  getVendorNames(order: any): string {
    return (order.vendorOrders || [])
      .filter((vo: any) => vo.status !== 'cancelled')
      .map((vo: any) => vo.vendorName || vo.vendor?.name || 'Vendor')
      .join(', ');
  }

  getItemCount(order: any): number {
    return (order.vendorOrders || [])
      .filter((vo: any) => vo.status !== 'cancelled')
      .reduce((sum: number, vo: any) => sum + (vo.items?.length || 0), 0);
  }

  getCustomerName(order: any): string {
    return order.userId?.fullName || 'Customer';
  }

  getCustomerArea(order: any): string {
    // Only show locality label for available orders (privacy until accepted)
    return order.deliveryAddress?.label || order.deliveryAddress?.fullAddress || '';
  }

  getDeliveryAddress(order: any): string {
    return order.deliveryAddress?.fullAddress || '';
  }

  getVerticalIcon(order: any): string {
    return (order.vertical === 'mart') ? 'bag-handle-outline' : 'restaurant-outline';
  }

  getTimeSince(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  isUrgent(order: any): boolean {
    return (Date.now() - new Date(order.createdAt).getTime()) / 60000 > 15;
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  acceptOrder(order: any) {
    this.deliveryService.acceptOrder(order.orderId, this.deliveryBoyId).subscribe({
      next: () => {
        this.commonService.presentToast('bottom', 'Order accepted! Head to the vendor.', 'success');
        this.loadAvailable(false);
        this.loadActive(false);
      },
      error: (err: any) => {
        const code = err?.error?.code;
        if (code === 'ALREADY_ASSIGNED') {
          this.commonService.presentToast('bottom', 'Another partner just accepted this order.', 'danger');
          this.loadAvailable(false);
        } else {
          this.commonService.presentToast('bottom', err?.error?.message || 'Failed to accept order', 'danger');
        }
      },
    });
  }

  markPickedUp(order: any) {
    this.deliveryService.markPickedUp(order.orderId, this.deliveryBoyId).subscribe({
      next: () => {
        this.commonService.presentToast('bottom', "You're on the way! Navigate to customer.", 'success');
        this.deliveryLocationService.startTracking(order.orderId);
        this.loadActive(false);
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err?.error?.message || 'Failed to update status', 'danger');
      },
    });
  }

  openDeliveredModal(order: any) {
    this.pendingDeliverOrder = order;
    this.showDeliveredModal = true;
  }

  closeDeliveredModal() {
    this.showDeliveredModal = false;
    this.pendingDeliverOrder = null;
  }

  confirmDelivered() {
    if (!this.pendingDeliverOrder) return;
    const order = this.pendingDeliverOrder;
    this.deliveryService.markDelivered(order.orderId, this.deliveryBoyId).subscribe({
      next: () => {
        this.showDeliveredModal = false;
        this.pendingDeliverOrder = null;
        this.deliveryLocationService.stopTracking();
        this.commonService.presentToast('bottom', 'Order delivered successfully!', 'success');
        this.loadActive(false);
        this.loadDone(false);
      },
      error: (err: any) => {
        this.commonService.presentToast('bottom', err?.error?.message || 'Failed to mark delivered', 'danger');
      },
    });
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  navigateToVendor(order: any) {
    const vo = (order.vendorOrders || []).find((v: any) => v.status !== 'cancelled');
    const vendor = vo?.vendor;
    const lat = vendor?.latitude || vendor?.coords?.lat;
    const lng = vendor?.longitude || vendor?.coords?.lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
    } else if (vo?.vendorAddress) {
      window.open(`https://www.google.com/maps/search/?q=${encodeURIComponent(vo.vendorAddress)}`, '_blank');
    } else {
      this.commonService.presentToast('bottom', 'Vendor location not available', 'danger');
    }
  }

  navigateToCustomer(order: any) {
    const coords = order.deliveryAddress?.coords;
    if (coords?.lat && coords?.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving`, '_blank');
    } else if (order.deliveryAddress?.fullAddress) {
      window.open(`https://www.google.com/maps/search/?q=${encodeURIComponent(order.deliveryAddress.fullAddress)}`, '_blank');
    } else {
      this.commonService.presentToast('bottom', 'Customer location not available', 'danger');
    }
  }

  callCustomer(order: any) {
    const phone = order.userId?.mobileNo;
    if (phone) window.open('tel:' + phone);
  }
}
