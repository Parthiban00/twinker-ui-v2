import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebService } from './web.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private web: WebService) {}

  placeOrder(payload: any): Observable<any> {
    return this.web.post('order', payload);
  }

  getOrdersByUser(userId: string): Observable<any> {
    return this.web.get(`order/user/${userId}`);
  }

  getActiveOrder(userId: string): Observable<any> {
    return this.web.get(`order/active/${userId}`);
  }

  getOrderById(orderId: string): Observable<any> {
    return this.web.get(`order/${orderId}`);
  }

  cancelOrder(orderId: string, reason: string = ''): Observable<any> {
    return this.web.patch(`order/${orderId}/cancel`, { reason });
  }

  updateDeliveryLocation(orderId: string, payload: {
    latitude: number;
    longitude: number;
    deliveryBoyName?: string;
    phone?: string;
    vehicleNo?: string;
  }): Observable<any> {
    return this.web.patch(`order/${orderId}/location`, payload);
  }
}
