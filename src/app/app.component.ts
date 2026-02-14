import { Component } from '@angular/core';
import { StorageService } from './services/storage.service';
import { Router } from '@angular/router';
import { OtpService } from './pages/otp-verification/otp.service';
import { LocationService } from './shared/location-setup/location.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private storageService: StorageService,
    private router: Router,
    private otpService: OtpService,
    private locationService: LocationService
  ) {
    this.initApp();
  }

  private initApp() {
    const token = this.storageService.getToken();

    // Step 1: No token → login
    if (!token) {
      this.router.navigate(['/']);
      return;
    }

    // Step 2: Validate token via API
    this.otpService.validateToken().subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          // Step 3: Update local user data
          if (resdata.data.user) {
            this.storageService.saveUser(resdata.data.user);
          }

          // Step 4: Check hasDefaultAddress
          if (!resdata.data.hasDefaultAddress) {
            this.router.navigate(['/shared/location-setup']);
            return;
          }

          // Step 5: Find default address coords and check service area
          const user = resdata.data.user;
          const defaultAddr = user.addresses?.find((a: any) => a.defaultAddress);
          if (defaultAddr?.coords) {
            this.locationService.checkServiceArea(defaultAddr.coords).subscribe({
              next: (saRes: any) => {
                if (saRes.status && saRes.data?.serviceAvailable) {
                  this.router.navigate(['/tabs']);
                } else {
                  this.router.navigate(['/service-not-available']);
                }
              },
              error: () => {
                // If check fails, allow access
                this.router.navigate(['/tabs']);
              }
            });
          } else {
            this.router.navigate(['/tabs']);
          }
        } else {
          // Invalid token response
          this.storageService.clean();
          this.router.navigate(['/']);
        }
      },
      error: () => {
        // Token validation failed
        this.storageService.clean();
        this.router.navigate(['/']);
      }
    });
  }
}
