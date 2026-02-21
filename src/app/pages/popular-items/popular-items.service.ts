import { Injectable } from '@angular/core';
import { WebService } from 'src/app/services/web.service';

@Injectable()
export class PopularItemsService {

  constructor(private webService: WebService) {}

  getPopularItems(localityId: string, params: any) {
    const queryParts: string[] = [];
    if (params.vertical) queryParts.push(`vertical=${encodeURIComponent(params.vertical)}`);
    if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.tag) queryParts.push(`tag=${encodeURIComponent(params.tag)}`);
    if (params.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
    if (params.sort) queryParts.push(`sort=${encodeURIComponent(params.sort)}`);
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);
    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    return this.webService.get(`home/popular-items/${localityId}${queryString}`);
  }
}
