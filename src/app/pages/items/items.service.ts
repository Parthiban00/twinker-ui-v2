import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { WebService } from 'src/app/services/web.service';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  constructor(private webservice: WebService, private router: Router, private storageServie: StorageService) { }

  getAllProductsByVendor(vendorId: string, queryParams: any): Observable<any> {
    return this.webservice.get(`/product/by-vendor/${vendorId}/${queryParams}`);
  }

  getVendorDetails(vendorId: string): Observable<any> {
    return this.webservice.get(`/vendor/getById/${vendorId}`);
  }

  addReview(data: any): Observable<any> {
    return this.webservice.post(`/vendor-reviews/reviews`, data);
  }

  getReviewByVendor(vendorId: string): Observable<any> {
    return this.webservice.get(`/vendor-reviews/reviews/vendor/${vendorId}`);
  }

  getDiscountedProductsByVendor(vendorId: string): Observable<any> {
    return this.webservice.get(`product/discountedByVendor/${vendorId}`);
  }

}
