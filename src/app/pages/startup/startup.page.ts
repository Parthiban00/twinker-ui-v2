import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService } from 'src/app/shared/location-setup/location.service';
import { OtpService } from '../otp-verification/otp.service';
import { StorageService } from 'src/app/services/storage.service';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-startup',
  templateUrl: './startup.page.html',
  styleUrls: ['./startup.page.scss'],
  standalone: false,
})
export class StartupPage {
  statusText = 'Hi! We are getting things ready for you...';
  private resolved = false;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private otpService: OtpService,
    private locationService: LocationService,
    private orderService: OrderService,
  ) {}

  ionViewWillEnter() {
    this.resolveStartupRoute();
  }

  private resolveStartupRoute() {
    if (this.resolved) return;
    this.resolved = true;

    const token = this.storageService.getToken();
    if (!token) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.statusText = 'Restoring your session...';
    this.otpService.validateToken().subscribe({
      next: (resdata: any) => {
        if (!(resdata?.status && resdata?.data)) {
          this.handleAuthFailure();
          return;
        }

        const user = resdata.data.user;
        if (user) {
          this.storageService.saveUser(user);
        }

        if (!resdata.data.hasDefaultAddress) {
          this.router.navigate(['/shared/location-setup'], { replaceUrl: true });
          return;
        }

        const addresses = user?.addresses || [];
        const defaultAddr = addresses.find((a: any) => a.defaultAddress || a.isDefault) || addresses[0];
        const coords = defaultAddr?.coords;

        if (coords?.lat && coords?.lng) {
          this.statusText = 'Checking service availability...';
          this.locationService.checkServiceArea(coords).subscribe({
            next: (saRes: any) => {
              if (saRes?.status && saRes?.data?.serviceAvailable) {
                this.navigateAfterServiceCheck(user._id);
              } else {
                this.router.navigate(['/service-not-available'], { replaceUrl: true });
              }
            },
            error: () => {
              this.router.navigate(['/tabs/home-main'], { replaceUrl: true });
            }
          });
          return;
        }

        this.navigateAfterServiceCheck(user._id);
      },
      error: () => {
        this.handleAuthFailure();
      }
    });
  }

  private navigateAfterServiceCheck(userId: string) {
    this.statusText = 'Almost ready...';
    this.orderService.getActiveOrder(userId).subscribe({
      next: (res: any) => {
        if (res?.data?.length > 0) {
          this.router.navigate(['/tabs/orders'], { replaceUrl: true });
        } else {
          this.router.navigate(['/tabs/home-main'], { replaceUrl: true });
        }
      },
      error: () => {
        this.router.navigate(['/tabs/home-main'], { replaceUrl: true });
      }
    });
  }

  private handleAuthFailure() {
    this.storageService.clean();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
