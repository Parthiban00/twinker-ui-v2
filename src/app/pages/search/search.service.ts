import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WebService } from 'src/app/services/web.service';

export interface SearchResults {
  vendors: any[];
  products: any[];
  categories: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private webService: WebService) {}

  searchAll(query: string, localityId: string): Observable<SearchResults> {
    if (!query || !query.trim() || !localityId) {
      return of({ vendors: [], products: [], categories: [] });
    }

    const trimmed = encodeURIComponent(query.trim());

    return this.webService.get(`home/search/${localityId}?q=${trimmed}`).pipe(
      map((res: any) => {
        if (res.status && res.data) {
          return {
            vendors: res.data.vendors || [],
            products: res.data.products || [],
            categories: res.data.categories || []
          };
        }
        return { vendors: [], products: [], categories: [] };
      }),
      catchError(() => of({ vendors: [], products: [], categories: [] }))
    );
  }
}
