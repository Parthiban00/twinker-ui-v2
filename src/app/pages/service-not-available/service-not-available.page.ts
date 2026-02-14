import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-service-not-available',
  templateUrl: './service-not-available.page.html',
  styleUrls: ['./service-not-available.page.scss'],
  standalone: false,
})
export class ServiceNotAvailablePage {

  constructor(private router: Router, private storageService: StorageService) {}

  addDifferentAddress() {
    this.router.navigate(['/shared/location-setup']);
  }

  manageSavedAddresses() {
    this.router.navigate(['/shared/location-setup']);
  }

  logout() {
    this.storageService.clean();
    this.router.navigate(['/']);
  }
}
