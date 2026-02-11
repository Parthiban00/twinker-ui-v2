import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { VendorService } from '../home-land/vendor.service';

export interface SearchResults {
  vendors: any[];
  products: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private vendorService: VendorService) {}

  searchAll(query: string, localityId: string, categoryIds: string[]): Observable<SearchResults> {
    if (!query || !query.trim() || !categoryIds.length) {
      return of({ vendors: [], products: [] });
    }

    const trimmed = query.trim();

    const vendorSearches = categoryIds.map(catId =>
      this.vendorService.searchVendorByLocalityAndCategory(trimmed, localityId, catId).pipe(
        map((res: any) => (res.status && res.data) ? res.data : []),
        catchError(() => of([]))
      )
    );

    const productSearches = categoryIds.map(catId =>
      this.vendorService.searchSpecificProductsByCategory(catId, trimmed).pipe(
        map((res: any) => (res.status && res.data) ? res.data : []),
        catchError(() => of([]))
      )
    );

    return forkJoin([...vendorSearches, ...productSearches]).pipe(
      map((results: any[][]) => {
        const vendorArrays = results.slice(0, categoryIds.length);
        const productArrays = results.slice(categoryIds.length);

        // Flatten and deduplicate vendors by _id
        const vendorMap = new Map<string, any>();
        vendorArrays.flat().forEach(v => {
          if (v._id && !vendorMap.has(v._id)) {
            vendorMap.set(v._id, v);
          }
        });

        return {
          vendors: Array.from(vendorMap.values()),
          products: productArrays.flat()
        };
      }),
      catchError(() => of({ vendors: [], products: [] }))
    );
  }
}
