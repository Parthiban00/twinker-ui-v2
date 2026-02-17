import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebService } from 'src/app/services/web.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(private webservice: WebService) {}

  calculateFees(payload: {
    localityId: string;
    vendorIds: string[];
    userLat: number;
    userLng: number;
    orderSubtotal: number;
  }): Observable<any> {
    return this.webservice.post('locality/calculateFees', payload);
  }
}
