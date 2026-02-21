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

  // Vertical
  activeVertical: 'eats' | 'mart' = 'eats';

  // Feature flags
  showWallet = false;
  showBuddy = false;

  // Category gradient palette (cycles by index)
  private categoryGradients = [
    'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    'linear-gradient(135deg, #FFA726, #EF6C00)',
    'linear-gradient(135deg, #AB47BC, #6A1B9A)',
    'linear-gradient(135deg, #EC407A, #C2185B)',
    'linear-gradient(135deg, #26C6DA, #0097A7)',
    'linear-gradient(135deg, #66BB6A, #2E7D32)',
    'linear-gradient(135deg, #42A5F5, #1565C0)',
    'linear-gradient(135deg, #5C6BC0, #283593)',
  ];

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
    this.activeVertical = this.storageService.getActiveVertical();
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

  switchVertical(v: 'eats' | 'mart') {
    if (this.activeVertical === v) return;
    this.activeVertical = v;
    this.storageService.saveActiveVertical(v);
    this.eventBus.emit('vertical:changed', v);
    this.loadCart();
    this.loadDashboard();
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
    // Show combined cart count across both verticals in the bar; but navigate to cart with active vertical
    const eatsCart = this.storageService.getEatsCart();
    const martCart = this.storageService.getMartCart();
    const activeCart = this.activeVertical === 'mart' ? martCart : eatsCart;
    this.cartItems = activeCart;
    this.cartItemCount = activeCart.reduce((sum: number, item: any) => sum + (item.itemCount || item.quantity || 1), 0);
    this.cartTotal = activeCart.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.itemCount || item.quantity || 1)), 0);
  }

  navigateToCart() {
    this.router.navigate(['/tabs/cart']);
  }

  navigateService(category: any) {
    this.router.navigate(['/home-land'], {
      queryParams: {
        title: category.categoryName,
        localityId: this.defaultAddress?.locality?._id,
        categoryId: category._id,
        vertical: this.activeVertical,
      }
    });
  }

  navigateCuisine(cuisine: any) {
    this.router.navigate(['/search'], {
      queryParams: {
        localityId: this.defaultAddress?.locality?._id || '',
        q: cuisine.name,
        vertical: this.activeVertical,
      }
    });
  }

  navigateRestaurant(vendor: any) {
    this.router.navigate(['/items'], {
      queryParams: {
        vendorId: vendor._id || '',
        vertical: this.activeVertical
      }
    });
  }

  navigatePopularItem(item: any) {
    if (item.vendor?._id) {
      this.router.navigate(['/items'], {
        queryParams: {
          vendorId: item.vendor._id,
          vertical: this.activeVertical
        }
      });
    }
  }

  navigateToPopularItems() {
    this.router.navigate(['/popular-items'], {
      queryParams: { localityId: this.defaultAddress?.locality?._id || '', vertical: this.activeVertical }
    });
  }

  navigateToPopularVendors() {
    this.router.navigate(['/popular-vendors'], {
      queryParams: { localityId: this.defaultAddress?.locality?._id || '', vertical: this.activeVertical }
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
        categoryId: cat?._id || '',
        vertical: this.activeVertical
      }
    });
  }

  addToCart(item: any) {
    const cartItems = this.storageService.getCartByVertical(this.activeVertical);
    const vendor = item.vendor || {};
    const vendorId = item.vendorId || vendor._id || 'unknown';

    const existing = cartItems.find((c: any) => (c._id === item._id) && ((c.vendorId || 'unknown') === vendorId));
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
        vertical: this.activeVertical,
      });
    }
    this.storageService.saveCartByVertical(this.activeVertical, cartItems);
    const totalCount = cartItems.reduce((sum: number, ci: any) => sum + (ci.itemCount || ci.quantity || 1), 0);
    this.eventBus.emit('cart:updated', totalCount);
    this.loadCart();
    this.commonService.presentToast('bottom', `${item.productName || item.name || 'Item'} added to cart`, 'success');
  }

  getDiscountLabel(deal: any): string {
    if (!deal.discount) return '';
    if (deal.discountType === 'in-percentage') return `${deal.discount}% OFF`;
    if (deal.discountType === 'in-price') return `₹${deal.discount} OFF`;
    // Fallback: discount exists but type unrecognised — assume percentage
    return `${deal.discount}% OFF`;
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

    this.homeService.getDashboard(localityId, this.activeVertical).subscribe({
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
      queryParams: { localityId: this.defaultAddress?.locality?._id || '', vertical: this.activeVertical }
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
      this.router.navigate(['/items'], {
        queryParams: {
          vendorId: deal.vendor._id,
          vertical: this.activeVertical
        }
      });
    }
  }

  getCategoryGradient(index: number): string {
    return this.categoryGradients[index % this.categoryGradients.length];
  }

  getCategoryImageUrl(cat: any): string {
    if (!cat?.imageUrl) return '';
    if (cat.imageUrl.startsWith('http')) return cat.imageUrl;
    return this.imgBaseUrl + cat.imageUrl;
  }

  isVendorOpen(vendor: any): boolean {
    if (!vendor?.openAt || !vendor?.closeAt) return true;
    const now = new Date();
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const hh = istNow.getUTCHours().toString().padStart(2, '0');
    const mm = istNow.getUTCMinutes().toString().padStart(2, '0');
    const current = `${hh}:${mm}`;

    console.log(`Checking open status for ${vendor.name}: current time ${current}, openAt ${vendor.openAt}, closeAt ${vendor.closeAt}`);
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
