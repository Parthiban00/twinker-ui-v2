import { Component, OnInit } from '@angular/core';
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

  // Service Pillars
  servicePillars = [
    { name: 'Food', icon: 'restaurant-outline', deliveryTime: '30 min', bgColor: '#FFF0F0', accentColor: '#F85C70', route: '/home-land', queryTitle: 'Food' },
    { name: 'Groceries', icon: 'cart-outline', deliveryTime: '45 min', bgColor: '#F0FFF4', accentColor: '#2ecc71', route: '/groceries-home', queryTitle: 'Groceries' },
    { name: 'Medicine', icon: 'medkit-outline', deliveryTime: '20 min', bgColor: '#F0F4FF', accentColor: '#4A5BF5', route: '/home-land', queryTitle: 'Medicine' },
    { name: 'Desserts', icon: 'ice-cream-outline', deliveryTime: '25 min', bgColor: '#FFF0F8', accentColor: '#FC5C7D', route: '/home-land', queryTitle: 'Desserts' },
    { name: 'Beverages', icon: 'cafe-outline', deliveryTime: '15 min', bgColor: '#FFF5F0', accentColor: '#FF8C42', route: '/home-land', queryTitle: 'Beverages' }
  ];

  // Promo Banner Deals
  deals = [
    {
      title: "Today's Best Deals",
      subtitle: 'Off up to 75%',
      tag: 'Food',
      overlayColor: 'rgba(248, 92, 112, 0.85)',
      image: 'assets/announcement-banner.jpg'
    },
    {
      title: 'Flat 50% on Groceries',
      subtitle: 'Fresh produce & essentials',
      tag: 'Grocery',
      overlayColor: 'rgba(46, 204, 113, 0.85)',
      image: 'assets/announcement-banner.jpg'
    },
    {
      title: 'Free Delivery on Medicines',
      subtitle: 'Order above $10',
      tag: 'Medicine',
      overlayColor: 'rgba(74, 91, 245, 0.85)',
      image: 'assets/announcement-banner.jpg'
    },
    {
      title: 'Buy 1 Get 1 Desserts',
      subtitle: 'Weekend special!',
      tag: 'Desserts',
      overlayColor: 'rgba(252, 92, 125, 0.85)',
      image: 'assets/announcement-banner.jpg'
    }
  ];

  // Order Again / Popular in your area
  orderAgainItems: any[] = [];
  hasOrderHistory = false;

  // What's on your mind - Cuisine/Category Grid
  cuisineGrid = [
    { name: 'Pizza', icon: 'pizza-outline', bgColor: '#FFF0F0', accentColor: '#F85C70' },
    { name: 'Burger', icon: 'fast-food-outline', bgColor: '#FFF5F0', accentColor: '#FF8C42' },
    { name: 'Salad', icon: 'leaf-outline', bgColor: '#F0FFF4', accentColor: '#2ecc71' },
    { name: 'Noodles', icon: 'restaurant-outline', bgColor: '#FFF0F8', accentColor: '#FC5C7D' },
    { name: 'Cakes', icon: 'ice-cream-outline', bgColor: '#FFF0F5', accentColor: '#E91E8C' },
    { name: 'Juice', icon: 'cafe-outline', bgColor: '#FFF5F0', accentColor: '#FF8C42' },
    { name: 'Pharma', icon: 'medkit-outline', bgColor: '#F0F4FF', accentColor: '#4A5BF5' },
    { name: 'Veggies', icon: 'nutrition-outline', bgColor: '#F0FFF4', accentColor: '#2DBCB6' }
  ];

  // Popular Restaurants
  popularRestaurants = [
    {
      name: 'Bottega Ristorante',
      cuisine: 'Italian',
      rating: 4.6,
      distance: '4.2 km',
      deliveryTime: '30 min',
      promoTag: 'Free delivery',
      image: 'assets/announcement-banner.jpg'
    },
    {
      name: 'SOULFOOD Kitchen',
      cuisine: 'Indian',
      rating: 4.3,
      distance: '2.1 km',
      deliveryTime: '25 min',
      promoTag: '20% off',
      image: 'assets/announcement-banner.jpg'
    },
    {
      name: 'Dragon Palace',
      cuisine: 'Chinese',
      rating: 4.5,
      distance: '3.8 km',
      deliveryTime: '35 min',
      promoTag: 'Free delivery',
      image: 'assets/announcement-banner.jpg'
    },
    {
      name: 'Le Quartier',
      cuisine: 'French',
      rating: 4.8,
      distance: '5.0 km',
      deliveryTime: '40 min',
      promoTag: '',
      image: 'assets/announcement-banner.jpg'
    }
  ];

  // Popular items (shown when no order history)
  popularItems = [
    { name: 'Chicken Biryani', vendor: 'Spice Garden', price: 12.50, image: 'assets/announcement-banner.jpg' },
    { name: 'Margherita Pizza', vendor: 'Pizza Hub', price: 9.99, image: 'assets/announcement-banner.jpg' },
    { name: 'Fresh Milk 1L', vendor: 'FreshMart', price: 1.50, image: 'assets/announcement-banner.jpg' },
    { name: 'Paracetamol', vendor: 'MedPlus', price: 2.00, image: 'assets/announcement-banner.jpg' },
    { name: 'Chocolate Cake', vendor: 'Sweet Bites', price: 15.00, image: 'assets/announcement-banner.jpg' }
  ];

  constructor(
    public router: Router,
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private homeService: HomeMainService,
    private commonService: CommonService,
    private navController: NavController,
    private eventBus: EventBusService
  ) {}

  ngOnInit() {
    this.setGreeting();
    this.loadOrderHistory();
    this.eventSubscription = this.eventBus.on('address-updated').subscribe((payload) => {
      this.ionViewWillEnter();
    });
  }

  ionViewWillEnter() {
    this.setGreeting();
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

  loadOrderHistory() {
    const cartItems = this.storageService.getItem('cart-items');
    if (cartItems && cartItems.length > 0) {
      this.hasOrderHistory = true;
      this.orderAgainItems = cartItems.slice(0, 6);
    } else {
      this.hasOrderHistory = false;
      this.orderAgainItems = this.popularItems;
    }
  }

  navigateService(pillar: any) {
    this.router.navigate([pillar.route], {
      queryParams: { title: pillar.queryTitle, localityId: this.defaultAddress?.locality?._id }
    });
  }

  navigateCuisine(cuisine: any) {
    this.router.navigate(['/home-land'], {
      queryParams: { title: cuisine.name, localityId: this.defaultAddress?.locality?._id }
    });
  }

  navigateRestaurant(restaurant: any) {
    this.router.navigate(['/items'], {
      queryParams: { vendorId: restaurant._id || '' }
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
    const existing = cartItems.find((c: any) => c.name === item.name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cartItems.push({ ...item, quantity: 1 });
    }
    this.storageService.setItem('cart-items', cartItems);
    this.commonService.presentToast('bottom', `${item.name} added to cart`, 'success');
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
            // Check service area for default address
            if (this.defaultAddress.coords) {
              this.homeService.checkServiceArea(this.defaultAddress.coords).subscribe({
                next: (saRes: any) => {
                  if (saRes.status && saRes.data && !saRes.data.serviceAvailable) {
                    this.router.navigate(['/service-not-available']);
                  } else {
                    this.getAllCategoriesByLocality();
                  }
                },
                error: () => {
                  this.getAllCategoriesByLocality();
                }
              });
            } else {
              this.getAllCategoriesByLocality();
            }
          } else {
            this.defaultAddress = null;
          }
        }
      },
      error: (_err: any) => {},
      complete: () => {},
    });
  }

  getAllCategoriesByLocality() {
    if (this.defaultAddress) {
      this.homeService.getAllCategoriesByLocality(this.defaultAddress.locality._id).subscribe({
        next: (resdata: any) => {
          if (resdata.status) {
            if (resdata.data) {
              this.categories = resdata.data;
            } else {
              this.categories = [];
            }
          } else {
            this.commonService.presentToast('bottom', resdata.message, 'danger');
          }
        },
        error: (_err: any) => {
          this.categories = [];
        },
        complete: () => {},
      });
    } else {
      this.categories = [];
    }
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
