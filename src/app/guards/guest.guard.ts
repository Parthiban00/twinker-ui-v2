import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.storageService.isLoggedIn()) {
      return this.router.createUrlTree(['/startup']);
    }
    return true;
  }
}
