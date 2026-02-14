import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { WebService } from 'src/app/services/web.service';

@Injectable({
  providedIn: 'root'
})
export class HomeMainService {

  constructor(private webservice: WebService, private router: Router, private storageServie: StorageService) { }

  getDefaultAddressByUserId(userId: string): Observable<any> {
    return this.webservice.get(`address/getDefaultAddressByUserId/${userId}`);
  }

  getAllCategoriesByLocality(localityId: string): Observable<any> {
    return this.webservice.get(`category/getAllCategoriesByLocalityId/${localityId}`);
  }

  getFeaturedItemsByCategory(categoryId: string): Observable<any> {
    return this.webservice.get(`product/discounted/${categoryId}`);
  }

  getPopularCuisines(categoryId: string): Observable<any> {
    return this.webservice.get(`product/popularCuisines/${categoryId}`);
  }

  checkServiceArea(coords: { lat: number; lng: number }): Observable<any> {
    return this.webservice.post('locality/checkServiceArea', coords);
  }

  getDashboard(localityId: string): Observable<any> {
    return this.webservice.get(`home/dashboard/${localityId}`);
  }
}
