import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { WebService } from 'src/app/services/web.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private webservice: WebService, private router: Router, private storageServie: StorageService) { }

  getLocalities(): Observable<any> {
    return this.webservice.get('locality/getAll');
  }

  saveAddress(data: any): Observable<any> {
    return this.webservice.post('address/createAddress', data);
  }

  checkServiceArea(coords: { lat: number; lng: number }): Observable<any> {
    return this.webservice.post('locality/checkServiceArea', coords);
  }
}
