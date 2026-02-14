import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class HomeMainPage implements OnInit {
  defaultAddress: any;
  categories: any[] = [];
  imgBaseUrl = environment.imageBaseUrl;
  eventMessage: string;
  eventSubscription: Subscription;
  todayDate: Date = new Date();
  greeting: string = '';
  userName: string = '';

  // Dynamic dashboard data
  deals: any[] = [];
  popularItems: any[] = [];
  cuisines: any[] = [];
  popularVendors: any[] = [];
  isLoading = true;

  // Cart bar
  cartItems: any[] = [];
  cartTotal = 0;
  cartItemCount = 0;

  // Feature flags
  showWallet = false;
  showBuddy = false;

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
  }

  ionViewWillEnter() {
    this.setGreeting();
    this.loadCart();
    const userData = this.storageService.getUser();
    if (userData.mobileNo) {
      if (userData.addresses && userData.addresses.length) {
        this.userName = userData.name || userData.fullName || '';
        this.getDefaultAddressByUserId(userData._id);
      } else {
        this.router.navigate(['/shared/location-setup']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
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
      this.cartItemCount = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      this.cartTotal = cartItems.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    } else {
      this.cartItems = [];
      this.cartItemCount = 0;
      this.cartTotal = 0;
    }
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }

  navigateService(category: any) {
    const route = this.getCategoryRoute(category.categoryName);
    this.router.navigate([route], {
      queryParams: { title: category.categoryName, localityId: this.defaultAddress?.locality?._id }
    });
  }

  getCategoryRoute(categoryName: string): string {
    const lower = categoryName?.toLowerCase() || '';
    if (lower === 'groceries') return '/groceries-home';
    return '/home-land';
  }

  navigateCuisine(cuisine: any) {
    this.router.navigate(['/home-land'], {
      queryParams: { title: cuisine.name, localityId: this.defaultAddress?.locality?._id }
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
    if (type === 'groceries') {
      this.router.navigate(['/home-land'], {
        queryParams: { title: 'Groceries', localityId: this.defaultAddress?.locality?._id }
      });
    } else if (type === 'medicine') {
      this.router.navigate(['/home-land'], {
        queryParams: { title: 'Medicine', localityId: this.defaultAddress?.locality?._id }
      });
    }
  }

  addToCart(item: any) {
    const cartItems = this.storageService.getItem('cart-items') || [];
    const existing = cartItems.find((c: any) => c._id === item._id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cartItems.push({ ...item, quantity: 1 });
    }
    this.storageService.setItem('cart-items', cartItems);
    this.loadCart();
    this.commonService.presentToast('bottom', `${item.productName || item.name} added to cart`, 'success');
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
        } else {
          this.categories = [];
          this.deals = [];
          this.popularItems = [];
          this.cuisines = [];
          this.popularVendors = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (_err: any) => {
        this.categories = [];
        this.deals = [];
        this.popularItems = [];
        this.cuisines = [];
        this.popularVendors = [];
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
      componentProps: { categories: this.categories }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      // handle confirmation
    }
  }
}
