import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PopularItemsService } from './popular-items.service';
import { StorageService } from 'src/app/services/storage.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import { EventBusService } from 'src/app/services/event-bus.service';

@Component({
  selector: 'app-popular-items',
  templateUrl: './popular-items.page.html',
  styleUrls: ['./popular-items.page.scss'],
  standalone: false,
})
export class PopularItemsPage {
  items: any[] = [];
  isLoading = true;
  isLoadingMore = false;
  currentPage = 1;
  hasMore = false;
  totalCount = 0;

  searchTerm = '';
  activeTag = '';
  vegOnly = false;
  activeSort = '';

  cartItems: any[] = [];
  cartTotal = 0;
  cartItemCount = 0;

  localityId = '';
  imgBaseUrl = environment.imageBaseUrl;

  tagOptions = ['All', 'Best Selling', 'Trending', 'Recommended', 'Featured'];
  private searchSubject = new Subject<string>();
  private cartSub: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private popularItemsService: PopularItemsService,
    private storageService: StorageService,
    private commonService: CommonService,
    private eventBus: EventBusService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((term) => {
      this.searchTerm = term;
      this.loadItems(true);
    });
    this.cartSub = this.eventBus.on('cart:updated').subscribe(() => {
      this.loadCart();
      this.cdr.detectChanges();
    });
  }

  ionViewWillEnter() {
    this.localityId = this.route.snapshot.queryParamMap.get('localityId') || '';
    this.loadCart();
    this.loadItems(true);
  }

  ngOnDestroy() {
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
  }

  loadItems(reset: boolean) {
    if (reset) {
      this.currentPage = 1;
      this.isLoading = true;
    } else {
      this.isLoadingMore = true;
    }

    const params: any = {
      page: this.currentPage,
      limit: 20
    };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.activeTag && this.activeTag !== 'All') params.tag = this.activeTag;
    if (this.vegOnly) params.type = 'veg';
    if (this.activeSort) params.sort = this.activeSort;

    this.popularItemsService.getPopularItems(this.localityId, params).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          const products = resdata.data.products || [];
          if (reset) {
            this.items = products;
          } else {
            this.items = [...this.items, ...products];
          }
          this.hasMore = resdata.data.pagination?.hasMore || false;
          this.totalCount = resdata.data.pagination?.total || this.items.length;
        } else {
          if (reset) this.items = [];
          this.hasMore = false;
        }
        this.isLoading = false;
        this.isLoadingMore = false;
        this.cdr.detectChanges();
      },
      error: () => {
        if (reset) this.items = [];
        this.isLoading = false;
        this.isLoadingMore = false;
        this.hasMore = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchInput(event: any) {
    const value = event.target?.value || '';
    this.searchSubject.next(value);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  selectTag(tag: string) {
    this.activeTag = this.activeTag === tag ? '' : tag;
    this.loadItems(true);
  }

  toggleVegOnly() {
    this.vegOnly = !this.vegOnly;
    this.loadItems(true);
  }

  async openSortSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Sort by',
      buttons: [
        { text: 'Relevance (Default)', handler: () => { this.activeSort = ''; this.loadItems(true); } },
        { text: 'Price: Low to High', handler: () => { this.activeSort = 'price_asc'; this.loadItems(true); } },
        { text: 'Price: High to Low', handler: () => { this.activeSort = 'price_desc'; this.loadItems(true); } },
        { text: 'Best Discount', handler: () => { this.activeSort = 'discount'; this.loadItems(true); } },
        { text: 'Cancel', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.activeTag = '';
    this.vegOnly = false;
    this.activeSort = '';
    this.loadItems(true);
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm || (!!this.activeTag && this.activeTag !== 'All') || this.vegOnly || !!this.activeSort;
  }

  loadMore(event: any) {
    if (!this.hasMore) {
      event.target.complete();
      return;
    }
    this.currentPage++;
    this.isLoadingMore = true;

    const params: any = { page: this.currentPage, limit: 20 };
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.activeTag && this.activeTag !== 'All') params.tag = this.activeTag;
    if (this.vegOnly) params.type = 'veg';
    if (this.activeSort) params.sort = this.activeSort;

    this.popularItemsService.getPopularItems(this.localityId, params).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          const products = resdata.data.products || [];
          this.items = [...this.items, ...products];
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

  addToCart(item: any) {
    const cartItems = this.storageService.getItem('cart-items') || [];
    const vendor = item.vendor || {};
    const vendorId = item.vendorId || vendor._id || 'unknown';

    const existing = cartItems.find((c: any) => (c._id === item._id) && ((c.vendorId || 'unknown') === vendorId) && !c.cartItemId);
    if (existing) {
      existing.itemCount = (existing.itemCount || existing.quantity || 1) + 1;
    } else {
      cartItems.push({
        _id: item._id,
        productName: item.productName || item.name || '',
        price: item.price || 0,
        basePrice: item.actualPrice || item.basePrice || undefined,
        itemCount: 1,
        imageUrl: item.imageUrl || '',
        type: item.type || '',
        vendorId,
        vendorName: item.vendorName || vendor.businessName || vendor.name || '',
        vendorImage: item.vendorImage || vendor.imageUrl || '',
        vendorCuisine: item.vendorCuisine || vendor.cuisineType || '',
      });
    }
    this.storageService.setItem('cart-items', cartItems);
    const totalCount = cartItems.reduce((sum: number, ci: any) => sum + (ci.itemCount || ci.quantity || 1), 0);
    this.eventBus.emit('cart:updated', totalCount);
    this.loadCart();
    this.commonService.presentToast('bottom', `${item.productName || item.name || 'Item'} added to cart`, 'success');
  }

  loadCart() {
    const cartItems = this.storageService.getItem('cart-items');
    if (cartItems && cartItems.length > 0) {
      this.cartItems = cartItems;
      this.cartItemCount = cartItems.reduce((sum: number, item: any) => sum + (item.itemCount || item.quantity || 1), 0);
      this.cartTotal = cartItems.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.itemCount || item.quantity || 1)), 0);
    } else {
      this.cartItems = [];
      this.cartItemCount = 0;
      this.cartTotal = 0;
    }
  }

  navigateToVendor(item: any) {
    if (item.vendor?._id) {
      this.router.navigate(['/items'], { queryParams: { vendorId: item.vendor._id } });
    }
  }

  navigateToCart() {
    this.router.navigate(['/tabs/cart']);
  }

  getDiscountLabel(item: any): string {
    if (!item.discount) return '';
    if (item.discountType === 'in-percentage') {
      return `${item.discount}% OFF`;
    } else if (item.discountType === 'in-price') {
      return `\u20B9${item.discount} OFF`;
    }
    return '';
  }

  getVegTypeColor(type: string): string {
    switch (type) {
      case 'veg': return '#2ecc71';
      case 'non-veg': return '#e74c3c';
      case 'egg': return '#f1c40f';
      default: return 'transparent';
    }
  }
}
