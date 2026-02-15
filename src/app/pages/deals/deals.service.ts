import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebService } from 'src/app/services/web.service';

@Injectable({
  providedIn: 'root'
})
export class DealsService {

  constructor(private webservice: WebService) {}

  getDealsPage(localityId: string): Observable<any> {
    return this.webservice.get(`offer/deals/${localityId}`);
  }

  getApplicableOffers(localityId: string, vendorIds: string[], orderAmount: number, vendorSubtotals?: Record<string, number>): Observable<any> {
    // Send client's local time (HH:mm) for time-based offer filtering
    const now = new Date();
    const clientTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    let url = `offer/applicable/${localityId}?vendorIds=${vendorIds.join(',')}&orderAmount=${orderAmount}&clientTime=${clientTime}`;
    if (vendorSubtotals) {
      url += `&vendorSubtotals=${encodeURIComponent(JSON.stringify(vendorSubtotals))}`;
    }
    return this.webservice.get(url);
  }

  validateCoupon(payload: { code: string; localityId?: string; vendorId?: string; orderAmount?: number; clientTime?: string }): Observable<any> {
    return this.webservice.post('offer/validate-coupon', payload);
  }
}
