import { Injectable } from '@angular/core';
import { WebService } from 'src/app/services/web.service';

@Injectable()
export class PopularVendorsService {

  constructor(private webService: WebService) {}

  getPopularVendors(localityId: string, params: any) {
    const queryParts: string[] = [];
    if (params.vertical) queryParts.push(`vertical=${encodeURIComponent(params.vertical)}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.category) queryParts.push(`category=${encodeURIComponent(params.category)}`);
    if (params.sort) queryParts.push(`sort=${encodeURIComponent(params.sort)}`);
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    return this.webService.get(`home/popular-vendors/${localityId}${queryString}`);
  }
}
