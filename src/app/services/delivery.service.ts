import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebService } from './web.service';

@Injectable({ providedIn: 'root' })
export class DeliveryService {

  constructor(private web: WebService) {}

  /** Orders ready for pickup in delivery boy's assigned locality */
  getAvailableOrders(deliveryBoyId: string): Observable<any> {
    return this.web.get(`order/available/${deliveryBoyId}`);
  }

  /** Orders assigned to this delivery boy */
  getMyOrders(deliveryBoyId: string, filter?: 'active' | 'done'): Observable<any> {
    const qs = filter ? `?filter=${filter}` : '';
    return this.web.get(`order/delivery/${deliveryBoyId}${qs}`);
  }

  /** Self-assign to an available order */
  acceptOrder(orderId: string, deliveryBoyId: string): Observable<any> {
    return this.web.patch(`order/${orderId}/assign`, { deliveryBoyId });
  }

  /** Mark all vendors picked up → sets order out_for_delivery */
  markPickedUp(orderId: string, deliveryBoyId: string): Observable<any> {
    return this.web.patch(`order/${orderId}/delivery/pickup`, { deliveryBoyId });
  }

  /** Mark order delivered to customer */
  markDelivered(orderId: string, deliveryBoyId: string): Observable<any> {
    return this.web.patch(`order/${orderId}/delivery/delivered`, { deliveryBoyId });
  }
}
