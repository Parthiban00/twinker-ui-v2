import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebService } from './web.service';

@Injectable({ providedIn: 'root' })
export class VendorOrderService {

  constructor(private web: WebService) {}

  getOrdersByVendor(vendorId: string, status?: string, dateFrom?: string, dateTo?: string): Observable<any> {
    let uri = `order/vendor/${vendorId}`;
    const params: string[] = [];
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (dateFrom) params.push(`dateFrom=${encodeURIComponent(dateFrom)}`);
    if (dateTo) params.push(`dateTo=${encodeURIComponent(dateTo)}`);
    if (params.length) uri += '?' + params.join('&');
    return this.web.get(uri);
  }

  confirmVendorOrder(orderId: string, vendorId: string, payload: { items: any[]; prepTime: number }): Observable<any> {
    return this.web.patch(`order/${orderId}/vendor/${vendorId}/confirm`, payload);
  }

  updateVendorOrderStatus(orderId: string, vendorId: string, status: string): Observable<any> {
    return this.web.patch(`order/${orderId}/vendor/${vendorId}/status`, { status });
  }

  cancelVendorOrder(orderId: string, vendorId: string, reason: string): Observable<any> {
    return this.web.patch(`order/${orderId}/vendor/${vendorId}/cancel`, { reason });
  }
}
