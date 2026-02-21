import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PopularVendorsService } from './popular-vendors.service';
import { StorageService } from 'src/app/services/storage.service';
import { CommonService } from 'src/app/services/common.service';
import { HomeMainService } from '../home-main/home-main.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-popular-vendors',
  templateUrl: './popular-vendors.page.html',
  styleUrls: ['./popular-vendors.page.scss'],
  standalone: false,
})
export class PopularVendorsPage {
  vendors: any[] = [];
  isLoading = true;
  isLoadingMore = false;
  currentPage = 1;
  hasMore = false;
  totalCount = 0;

  searchTerm = '';
  activeCategory = '';
  activeSort = '';
  activeFilters: string[] = [];

  localityId = '';
  vertical: 'eats' | 'mart' = 'eats';
  defaultAddress: any = null;
  imgBaseUrl = environment.imageBaseUrl;

  availableCategories: any[] = [];
  filterChips = ['Nearest', 'Fast delivery'];

  private searchSubject = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private popularVendorsService: PopularVendorsService,
    private storageService: StorageService,
    private commonService: CommonService,
    private homeService: HomeMainService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((term) => {
      this.searchTerm = term;
      this.loadVendors(true);
    });
  }

  ionViewWillEnter() {
    const params = this.route.snapshot.queryParamMap;
    this.localityId = params.get('localityId') || '';
    const routeVertical = params.get('vertical');
    this.vertical = (routeVertical === 'mart' || routeVertical === 'eats')
      ? routeVertical
      : this.storageService.getActiveVertical();
    this.storageService.saveActiveVertical(this.vertical);
    this.fetchDefaultAddress();
  }

  fetchDefaultAddress() {
    const userData = this.storageService.getUser();
    if (userData?._id) {
      this.homeService.getDefaultAddressByUserId(userData._id).subscribe({
        next: (resdata: any) => {
          if (resdata.status && resdata.data) {
            this.defaultAddress = resdata.data;
          }
          this.loadVendors(true);
        },
        error: () => {
          this.loadVendors(true);
        }
      });
    } else {
      this.loadVendors(true);
    }
  }

  loadVendors(reset: boolean) {
    if (reset) {
      this.currentPage = 1;
      this.isLoading = true;
    } else {
      this.isLoadingMore = true;
    }

    const params: any = {
      page: this.currentPage,
      limit: 20,
      vertical: this.vertical,
    };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.activeCategory) params.category = this.activeCategory;
    if (this.activeSort) params.sort = this.activeSort;

    this.popularVendorsService.getPopularVendors(this.localityId, params).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          let vendors = resdata.data.vendors || [];
          vendors = this.enrichVendors(vendors);

          if (reset) {
            this.vendors = vendors;
            this.collectCategories(vendors);
          } else {
            this.vendors = [...this.vendors, ...vendors];
          }

          this.vendors = this.applyClientFilters(this.vendors);
          this.hasMore = resdata.data.pagination?.hasMore || false;
          this.totalCount = resdata.data.pagination?.total || this.vendors.length;
        } else {
          if (reset) this.vendors = [];
          this.hasMore = false;
        }
        this.isLoading = false;
        this.isLoadingMore = false;
        this.cdr.detectChanges();
      },
      error: () => {
        if (reset) this.vendors = [];
        this.isLoading = false;
        this.isLoadingMore = false;
        this.hasMore = false;
        this.cdr.detectChanges();
      }
    });
  }

  enrichVendors(vendors: any[]): any[] {
    if (!this.defaultAddress?.coords) return vendors;
    const userLat = this.defaultAddress.coords.lat;
    const userLng = this.defaultAddress.coords.lng;

    return vendors.map(v => {
      if (v.coords?.lat && v.coords?.lng) {
        const dist = this.commonService.calculateDistance(userLat, userLng, v.coords.lat, v.coords.lng);
        v.distance = Math.round(parseFloat(dist) * 10) / 10;
        v.approxDeliveryTime = (Math.ceil(v.distance) * 3) + 15;
      } else {
        v.distance = null;
        v.approxDeliveryTime = null;
      }
      return v;
    });
  }

  applyClientFilters(vendors: any[]): any[] {
    let result = [...vendors];

    if (this.activeFilters.includes('Fast delivery')) {
      result = result.filter(v => v.approxDeliveryTime && v.approxDeliveryTime <= 30);
    }
    if (this.activeFilters.includes('Nearest')) {
      result = result.sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
    }

    return result;
  }

  collectCategories(vendors: any[]) {
    const catMap = new Map<string, any>();
    vendors.forEach(v => {
      if (v.categories?.length) {
        v.categories.forEach((cat: any) => {
          if (cat._id && !catMap.has(cat._id)) {
            catMap.set(cat._id, { _id: cat._id, categoryName: cat.categoryName });
          }
        });
      }
    });
    this.availableCategories = Array.from(catMap.values());
  }

  onSearchInput(event: any) {
    const value = event.target?.value || '';
    this.searchSubject.next(value);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  selectCategory(categoryId: string) {
    this.activeCategory = this.activeCategory === categoryId ? '' : categoryId;
    this.loadVendors(true);
  }

  toggleFilter(name: string) {
    const idx = this.activeFilters.indexOf(name);
    if (idx >= 0) {
      this.activeFilters.splice(idx, 1);
    } else {
      this.activeFilters.push(name);
    }
    this.vendors = this.applyClientFilters(this.vendors);
    this.cdr.detectChanges();
  }

  async openSortSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Sort by',
      buttons: [
        { text: 'Relevance (Default)', handler: () => { this.activeSort = ''; this.loadVendors(true); } },
        { text: 'Name: A to Z', handler: () => { this.activeSort = 'name_asc'; this.loadVendors(true); } },
        { text: 'Name: Z to A', handler: () => { this.activeSort = 'name_desc'; this.loadVendors(true); } },
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.activeCategory = '';
    this.activeSort = '';
    this.activeFilters = [];
    this.loadVendors(true);
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm || !!this.activeCategory || !!this.activeSort || this.activeFilters.length > 0;
  }

  loadMore(event: any) {
    if (!this.hasMore) {
      event.target.complete();
      return;
    }
    this.currentPage++;
    this.isLoadingMore = true;

    const params: any = { page: this.currentPage, limit: 20, vertical: this.vertical };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.activeCategory) params.category = this.activeCategory;
    if (this.activeSort) params.sort = this.activeSort;

    this.popularVendorsService.getPopularVendors(this.localityId, params).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          let vendors = resdata.data.vendors || [];
          vendors = this.enrichVendors(vendors);
          this.vendors = this.applyClientFilters([...this.vendors, ...vendors]);
          this.hasMore = resdata.data.pagination?.hasMore || false;
        } else {
          this.hasMore = false;
        }
        this.isLoadingMore = false;
        event.target.complete();
        if (!this.hasMore) event.target.disabled = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingMore = false;
        this.hasMore = false;
        event.target.complete();
        event.target.disabled = true;
        this.cdr.detectChanges();
      }
    });
  }

  navigateToVendor(vendor: any) {
    this.router.navigate(['/items'], {
      queryParams: {
        vendorId: vendor._id,
        vertical: this.vertical
      }
    });
  }

  isVendorOpen(vendor: any): boolean {
    if (!vendor?.openAt || !vendor?.closeAt) return true;
    const now = new Date();
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const hh = istNow.getUTCHours().toString().padStart(2, '0');
    const mm = istNow.getUTCMinutes().toString().padStart(2, '0');
    const current = `${hh}:${mm}`;
    return current >= vendor.openAt && current <= vendor.closeAt;
  }

  getNextOpenTime(vendor: any): string {
    if (!vendor?.openAt) return '';
    const now = new Date();
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const hh = istNow.getUTCHours().toString().padStart(2, '0');
    const mm = istNow.getUTCMinutes().toString().padStart(2, '0');
    const current = `${hh}:${mm}`;
    const [openH, openM] = vendor.openAt.split(':').map(Number);
    const ampm = openH >= 12 ? 'PM' : 'AM';
    const h12 = openH % 12 || 12;
    const timeStr = `${h12}:${openM.toString().padStart(2, '0')} ${ampm}`;
    return current < vendor.openAt ? `Opens at ${timeStr}` : `Opens tomorrow at ${timeStr}`;
  }
}
