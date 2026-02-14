import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { WebService } from 'src/app/services/web.service';

@Injectable({
  providedIn: 'root'
})
export class LocationSetupService {

  constructor(private webservice: WebService, private router: Router, private storageServie: StorageService) { }

  getAllAddressByUserId(userId: string): Observable<any> {
    return this.webservice.get(`address/getAllAddressesByUserId/${userId}`);
  }

  updateAddressStatusById(id: string, data: any): Observable<any> {
    return this.webservice.patch(`address/updateAddressStatusById/${id}`, data);
  }

  deleteAddressById(id: string, data: any): Observable<any> {
    return this.webservice.post(`address/deleteAddressById/${id}`, data);
  }

  checkServiceArea(coords: { lat: number; lng: number }): Observable<any> {
    return this.webservice.post('locality/checkServiceArea', coords);
  }

}
