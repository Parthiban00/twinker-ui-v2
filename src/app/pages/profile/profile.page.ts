import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { StorageService } from 'src/app/services/storage.service';
import { VendorOrderService } from 'src/app/services/vendor-order.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage {

  user: any = {};
  pendingOrderCount = 0;

  constructor(
    private storageService: StorageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private vendorOrderService: VendorOrderService,
  ) {}

  get isVendor(): boolean {
    return this.user?.userType === 'vendor';
  }

  ionViewWillEnter() {
    this.user = this.storageService.getUser();
    this.pendingOrderCount = 0;

    if (this.isVendor && this.user?.vendorId) {
      this.vendorOrderService.getOrdersByVendor(this.user.vendorId, 'placed').subscribe({
        next: (res: any) => {
          this.pendingOrderCount = res?.data?.length || 0;
          this.cdr.detectChanges();
        },
        error: () => { this.pendingOrderCount = 0; },
      });
    }

    this.cdr.detectChanges();
  }

  goToVendorOrders() {
    this.router.navigate(['/vendor-orders']);
  }

  goToOrders() {
    this.router.navigate(['/tabs/orders']);
  }

  logout() {
    this.storageService.clean();
    this.router.navigate(['/'], { replaceUrl: true });
  }
}
