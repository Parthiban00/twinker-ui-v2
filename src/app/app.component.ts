import { Component } from '@angular/core';
import { StorageService } from './services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private storageService: StorageService, private router: Router) {
    const userData = this.storageService.getUser();
    if (userData.mobileNo) {
      if (userData.addresses.length) {
        this.router.navigate(['/tabs']);
      } else {
        this.router.navigate(['/shared/location-setup']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }
}
