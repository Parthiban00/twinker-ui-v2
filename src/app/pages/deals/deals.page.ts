import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { HomeMainService } from '../home-main/home-main.service';
import { DealsService } from './deals.service';
import { CommonService } from 'src/app/services/common.service';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-deals',
  templateUrl: './deals.page.html',
  styleUrls: ['./deals.page.scss'],
  standalone: false,
})
export class DealsPage {
  isLoading = true;
  localityId: string = '';

  // Data sections
  featured: any[] = [];
  platformCoupons: any[] = [];
  restaurantOffers: any[] = [];
  firstOrderOffers: any[] = [];
  localityOffers: any[] = [];
  generalOffers: any[] = [];
  userSpecificOffers: any[] = [];

  // Search
  isSearching = false;
  searchQuery = '';

  // Filter
  activeFilter = 'all';
  filterChips = [
    { key: 'all', label: 'All Offers', icon: 'grid-outline' },
    { key: 'restaurant', label: 'Restaurant', icon: 'restaurant-outline' },
    { key: 'platform_coupon', label: 'Coupons', icon: 'ticket-outline' },
    { key: 'first_order', label: 'New User', icon: 'gift-outline' },
    { key: 'locality_based', label: 'Local Deals', icon: 'location-outline' },
  ];

  constructor(
    private router: Router,
    private storageService: StorageService,
    private homeService: HomeMainService,
    private dealsService: DealsService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) {}

  ionViewWillEnter() {
    const userData = this.storageService.getUser();
    if (userData?._id) {
      this.loadDefaultAddress(userData._id);
    } else {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadDefaultAddress(userId: string) {
    this.homeService.getDefaultAddressByUserId(userId).subscribe({
      next: (res: any) => {
        if (res.status && res.data?.locality?._id) {
          this.localityId = res.data.locality._id;
          this.loadDeals();
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadDeals() {
    this.isLoading = true;
    this.dealsService.getDealsPage(this.localityId).subscribe({
      next: (res: any) => {
        if (res.status && res.data) {
          this.featured = res.data.featured || [];
          this.platformCoupons = res.data.platformCoupons || [];
          this.restaurantOffers = res.data.restaurantOffers || [];
          this.firstOrderOffers = res.data.firstOrderOffers || [];
          this.localityOffers = res.data.localityOffers || [];
          this.generalOffers = res.data.generalOffers || [];
          this.userSpecificOffers = res.data.userSpecificOffers || [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Search ──────────────────────────────────────────

  toggleSearch() {
    if (!this.isSearching) {
      this.isSearching = true;
      this.cdr.detectChanges();
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.isSearching = false;
    this.cdr.detectChanges();
  }

  onSearchInput() {
    this.cdr.detectChanges();
  }

  private matchesSearch(offer: any): boolean {
    if (!this.searchQuery) return true;
    const q = this.searchQuery.toLowerCase();
    return (offer.title || '').toLowerCase().includes(q)
      || (offer.description || '').toLowerCase().includes(q)
      || (offer.code || '').toLowerCase().includes(q)
      || (offer.vendor?.name || '').toLowerCase().includes(q);
  }

  // ─── Filter & Display ────────────────────────────────

  setFilter(key: string) {
    this.activeFilter = key;
    this.cdr.detectChanges();
  }

  get totalOfferCount(): number {
    const all = this.getAllOffersList();
    const seen = new Set<string>();
    return all.filter(o => {
      if (seen.has(o._id)) return false;
      seen.add(o._id);
      return true;
    }).length;
  }

  getFilterCount(key: string): number {
    switch (key) {
      case 'all': return this.totalOfferCount;
      case 'restaurant': return this.restaurantOffers.length;
      case 'platform_coupon': return this.platformCoupons.length;
      case 'first_order': return this.firstOrderOffers.length;
      case 'locality_based': return this.localityOffers.length;
      default: return 0;
    }
  }

  private getAllOffersList(): any[] {
    return [
      ...this.restaurantOffers,
      ...this.platformCoupons,
      ...this.firstOrderOffers,
      ...this.localityOffers,
      ...this.generalOffers,
      ...this.userSpecificOffers,
    ];
  }

  get filteredOffers(): any[] {
    let all: any[] = [];

    if (this.activeFilter === 'all' || this.activeFilter === 'restaurant') {
      all = all.concat(this.restaurantOffers);
    }
    if (this.activeFilter === 'all' || this.activeFilter === 'platform_coupon') {
      all = all.concat(this.platformCoupons);
    }
    if (this.activeFilter === 'all' || this.activeFilter === 'first_order') {
      all = all.concat(this.firstOrderOffers);
    }
    if (this.activeFilter === 'all' || this.activeFilter === 'locality_based') {
      all = all.concat(this.localityOffers);
    }
    if (this.activeFilter === 'all') {
      all = all.concat(this.generalOffers);
      all = all.concat(this.userSpecificOffers);
    }

    // Deduplicate by _id
    const seen = new Set<string>();
    return all.filter(o => {
      if (seen.has(o._id)) return false;
      seen.add(o._id);
      return true;
    }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  get displayOffers(): any[] {
    if (this.isSearching && this.searchQuery) {
      // Search across ALL offers regardless of filter
      const all = this.getAllOffersList();
      const seen = new Set<string>();
      return all.filter(o => {
        if (seen.has(o._id)) return false;
        seen.add(o._id);
        return this.matchesSearch(o);
      }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
    return this.filteredOffers;
  }

  get displayCoupons(): any[] {
    if (this.isSearching && this.searchQuery) {
      return this.platformCoupons.filter(c => this.matchesSearch(c));
    }
    return this.platformCoupons;
  }

  get hasAnyOffers(): boolean {
    return this.featured.length > 0
      || this.platformCoupons.length > 0
      || this.restaurantOffers.length > 0
      || this.firstOrderOffers.length > 0
      || this.localityOffers.length > 0
      || this.generalOffers.length > 0
      || this.userSpecificOffers.length > 0;
  }

  // ─── Actions ─────────────────────────────────────────

  copyCode(code: string) {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.commonService.presentToast('bottom', `Code ${code} copied!`, 'success');
    }).catch(() => {
      this.commonService.presentToast('bottom', 'Failed to copy code', 'danger');
    });
  }

  getDiscountLabel(offer: any): string {
    if (!offer.discountValue) return '';
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    }
    return `\u20B9${offer.discountValue} OFF`;
  }

  getExpiryText(offer: any): string {
    if (!offer.endDate) return '';
    const end = new Date(offer.endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'Expires today';
    if (diffDays <= 3) return `${diffDays} days left`;
    if (diffDays <= 7) return `${diffDays} days left`;
    return `Valid till ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
  }

  navigateToVendor(offer: any) {
    if (offer.vendor?._id) {
      this.router.navigate(['/items'], { queryParams: { vendorId: offer.vendor._id } });
    }
  }

  navigateToNotifications() {
    // Placeholder for future notifications page
  }
}
