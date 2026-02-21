import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.storageService.isLoggedIn()) {
      return true;
    }
    return this.router.createUrlTree(['/login']);
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> | Promise<boolean> {
    if (this.storageService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
}
