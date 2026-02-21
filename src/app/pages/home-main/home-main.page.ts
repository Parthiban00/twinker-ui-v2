import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { CategoryListPage } from 'src/app/modals/category-list/category-list.page';
import { StorageService } from 'src/app/services/storage.service';
import { HomeMainService } from './home-main.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import { EventBusService } from 'src/app/services/event-bus.service';
import { Subscription } from 'rxjs';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-home-main',
  templateUrl: './home-main.page.html',
  styleUrls: ['./home-main.page.scss'],
  standalone: false,
})
export class HomeMainPage implements OnInit, OnDestroy {
  defaultAddress: any;
  categories: any[] = [];
  imgBaseUrl = environment.imageBaseUrl;
  eventMessage: string;
  eventSubscription: Subscription;
  cartSubscription: Subscription;
  todayDate: Date = new Date();
  greeting: string = '';
  userName: string = '';

  // Dynamic dashboard data
  deals: any[] = [];
  popularItems: any[] = [];
  cuisines: any[] = [];
  popularVendors: any[] = [];
  topRatedVendors: any[] = [];
  flashDeals: any[] = [];
  bestCoupon: any = null;
  couponCopied = false;
  isLoading = true;

  // Flash deal timer
  private flashTimerInterval: any;

  // Cart bar
  cartItems: any[] = [];
  cartTotal = 0;
  cartItemCount = 0;

  // Feature flags
  showWallet = false;
  showBuddy = true;

  constructor(
    public router: Router,
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private homeService: HomeMainService,
    private commonService: CommonService,
    private navController: NavController,
    private eventBus: EventBusService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.setGreeting();
    this.eventSubscription = this.eventBus.on('address-updated').subscribe((payload) => {
      this.ionViewWillEnter();
    });
    this.cartSubscription = this.eventBus.on('cart:updated').subscribe(() => {
      this.loadCart();
      this.cdr.detectChanges();
    });
  }

  ionViewWillEnter() {
    this.setGreeting();
    this.loadCart();
    const token = this.storageService.getToken();
    if (!token) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    const userData = this.storageService.getUser();
    if (userData?._id) {
      if (userData.addresses && userData.addresses.length) {
        this.userName = userData.name || userData.fullName || '';
        this.getDefaultAddressByUserId(userData._id);
      } else {
        this.router.navigate(['/shared/location-setup'], { replaceUrl: true });
      }
    } else {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  ngOnDestroy() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.flashTimerInterval) {
      clearInterval(this.flashTimerInterval);
    }
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good morning';
    } else if (hour < 17) {
      this.greeting = 'Good afternoon';
    } else {
      this.greeting = 'Good evening';
    }
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

  navigateToCart() {
    this.router.navigate(['/tabs/cart']);
  }

  navigateService(category: any) {
    this.router.navigate(['/home-land'], {
      queryParams: {
        title: category.categoryName,
        localityId: this.defaultAddress?.locality?._id,
        categoryId: category._id
      }
    });
  }

  navigateCuisine(cuisine: any) {
    this.router.navigate(['/search'], {
      queryParams: {
        localityId: this.defaultAddress?.locality?._id || '',
        q: cuisine.name
      }
    });
  }

  navigateRestaurant(vendor: any) {
    this.router.navigate(['/items'], {
      queryParams: { vendorId: vendor._id || '' }
    });
  }

  navigatePopularItem(item: any) {
    if (item.vendor?._id) {
      this.router.navigate(['/items'], {
        queryParams: { vendorId: item.vendor._id }
      });
    }
  }

  navigateToPopularItems() {
    this.router.navigate(['/popular-items'], {
      queryParams: { localityId: this.defaultAddress?.locality?._id || '' }
    });
  }

  navigateToPopularVendors() {
    this.router.navigate(['/popular-vendors'], {
      queryParams: { localityId: this.defaultAddress?.locality?._id || '' }
    });
  }

  navigateEssential(type: string) {
    const titleMap: Record<string, string> = { groceries: 'Groceries', medicine: 'Medicine' };
    const title = titleMap[type] || type;
    const cat = this.categories.find((c: any) => c.categoryName?.toLowerCase() === title.toLowerCase());
    this.router.navigate(['/home-land'], {
      queryParams: {
        title,
        localityId: this.defaultAddress?.locality?._id,
        categoryId: cat?._id || ''
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

  getDiscountLabel(deal: any): string {
    if (!deal.discount) return '';
    if (deal.discountType === 'in-percentage') {
      return `${deal.discount}% OFF`;
    } else if (deal.discountType === 'in-price') {
      return `\u20B9${deal.discount} OFF`;
    }
    return '';
  }

  getRatingStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getDefaultAddressByUserId(userId: string) {
    this.homeService.getDefaultAddressByUserId(userId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.defaultAddress = resdata.data;
            if (this.defaultAddress.coords) {
              this.homeService.checkServiceArea(this.defaultAddress.coords).subscribe({
                next: (saRes: any) => {
                  if (saRes.status && saRes.data && !saRes.data.serviceAvailable) {
                    this.router.navigate(['/service-not-available']);
                  } else {
                    this.loadDashboard();
                  }
                },
                error: () => {
                  this.loadDashboard();
                }
              });
            } else {
              this.loadDashboard();
            }
          } else {
            this.defaultAddress = null;
          }
        }
        this.cdr.detectChanges();
      },
      error: (_err: any) => {
        this.cdr.detectChanges();
      },
      complete: () => {},
    });
  }

  loadDashboard() {
    if (!this.defaultAddress?.locality?._id) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    const localityId = this.defaultAddress.locality._id;

    this.homeService.getDashboard(localityId).subscribe({
      next: (resdata: any) => {
        if (resdata.status && resdata.data) {
          this.categories = resdata.data.categories || [];
          this.deals = resdata.data.deals || [];
          this.popularItems = resdata.data.popularItems || [];
          this.cuisines = resdata.data.cuisines || [];
          this.popularVendors = resdata.data.popularVendors || [];
          this.topRatedVendors = resdata.data.topRatedVendors || [];
          this.flashDeals = (resdata.data.flashDeals || []).map((d: any) => ({ ...d, timeLeft: this.calcTimeLeft(d.endDate) }));
          this.bestCoupon = resdata.data.bestCoupon || null;
          this.enrichVendors(this.popularVendors);
          this.enrichVendors(this.topRatedVendors);
          this.startFlashTimer();
        } else {
          this.resetDashboard();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (_err: any) => {
        this.resetDashboard();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getImageSource(addressType: string): string {
    switch (addressType) {
      case 'Home':
        return 'assets/home.png';
      case 'officeWork':
        return 'assets/office.png';
      case 'others':
        return 'assets/others.png';
      default:
        return 'assets/default.png';
    }
  }

  navigateToSearch() {
    this.router.navigate(['/search'], {
      queryParams: { localityId: this.defaultAddress?.locality?._id || '' }
    });
  }

  goToHome(category: string) {
    this.router.navigate(['/home'], { queryParams: { category } });
  }

  async exploreCategories() {
    const modal = await this.modalCtrl.create({
      component: CategoryListPage,
      componentProps: {
        categories: this.categories,
        localityId: this.defaultAddress?.locality?._id || '',
        deals: this.deals,
        bestCoupon: this.bestCoupon
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'navigate' && data) {
      this.navigateService(data);
    }
  }

  private resetDashboard() {
    this.categories = [];
    this.deals = [];
    this.popularItems = [];
    this.cuisines = [];
    this.popularVendors = [];
    this.topRatedVendors = [];
    this.flashDeals = [];
    this.bestCoupon = null;
  }

  enrichVendors(vendors: any[]) {
    if (!this.defaultAddress?.coords) return;
    const userLat = this.defaultAddress.coords.lat;
    const userLng = this.defaultAddress.coords.lng;
    vendors.forEach((v: any) => {
      if (v.latitude && v.longitude) {
        v.distance = this.commonService.calculateDistance(userLat, userLng, v.latitude, v.longitude);
        v.approxDeliveryTime = (Math.ceil(parseFloat(v.distance)) * 3) + 15;
      }
    });
  }

  calcTimeLeft(endDate: string): string {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  }

  startFlashTimer() {
    if (this.flashTimerInterval) clearInterval(this.flashTimerInterval);
    if (!this.flashDeals.length) return;
    this.flashTimerInterval = setInterval(() => {
      this.flashDeals = this.flashDeals
        .map((d: any) => ({ ...d, timeLeft: this.calcTimeLeft(d.endDate) }))
        .filter((d: any) => d.timeLeft !== 'Expired');
      this.cdr.detectChanges();
    }, 60000);
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.couponCopied = true;
      this.commonService.presentToast('bottom', `Code ${code} copied!`, 'success');
      setTimeout(() => { this.couponCopied = false; this.cdr.detectChanges(); }, 2000);
    });
  }

  navigateFlashDeal(deal: any) {
    if (deal.vendor?._id) {
      this.router.navigate(['/items'], { queryParams: { vendorId: deal.vendor._id } });
    }
  }
}
