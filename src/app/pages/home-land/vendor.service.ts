import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { WebService } from 'src/app/services/web.service';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  constructor(private webservice: WebService, private router: Router, private storageServie: StorageService) { }

  getById(vendorId: string): Observable<any> {
    return this.webservice.get(`vendor/getById/${vendorId}`);
  }

  getAllByLocalityAndCategory(localityId: string, categoryId: string): Observable<any> {
    return this.webservice.get(`vendor/getAllByLocalityAndCategory/${localityId}/${categoryId}`);
  }


  searchVendorByLocalityAndCategory(vendorName: string, localityId: string, categoryId: string): Observable<any> {
    return this.webservice.get(`vendor/search?vendorName=${vendorName}&localityId=${localityId}&categoryId=${categoryId}`);
  }

  getPopularByLocalityAndCategory(localityId: string, categoryId: string): Observable<any> {
    return this.webservice.get(`vendor/getPopularByLocalityAndCategory/${localityId}/${categoryId}`);
  }

  searchSpecificProductsByCategory(categoryId: string, productName: string): Observable<any> {
    return this.webservice.get(`product/search/${categoryId}?productName=${productName}`);
  }
}
