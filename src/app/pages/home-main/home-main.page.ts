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

  deals = [
    {
      title: "Today's Best Deals",
      subtitle: 'Off up to 75%',
      overlayColor: 'rgba(248, 92, 112, 0.85)',
      image: 'assets/announcement-banner.jpg'
    },
    {
      title: 'Weekly Best Deals',
      subtitle: 'Off up to 50%',
      overlayColor: 'rgba(255, 140, 66, 0.85)',
      image: 'assets/announcement-banner.jpg'
    },
    {
      title: 'Special Offers',
      subtitle: 'Off up to 60%',
      overlayColor: 'rgba(74, 91, 245, 0.85)',
      image: 'assets/announcement-banner.jpg'
    },
    {
      title: 'Flash Sale',
      subtitle: 'Off up to 40%',
      overlayColor: 'rgba(45, 188, 182, 0.85)',
      image: 'assets/announcement-banner.jpg'
    }
  ];

  quickCategories = [
    { name: 'Near Me', icon: 'location-outline', bgColor: '#FFF0F0', iconColor: '#F85C70' },
    { name: 'Popular', icon: 'star-outline', bgColor: '#FFF0F0', iconColor: '#F85C70' },
    { name: 'Discount', icon: 'pricetag-outline', bgColor: '#FFF5F0', iconColor: '#FC5C7D' },
    { name: '24 Hours', icon: 'time-outline', bgColor: '#FFF0F5', iconColor: '#FC5C7D' },
    { name: 'Quick Delivery', icon: 'bicycle-outline', bgColor: '#FFF0F0', iconColor: '#F85C70' }
  ];

  categoryCards = [
    { name: 'Customer Top Picks', count: 321, color: '#F85C70' },
    { name: 'Beverages', count: 189, color: '#FF8C42' },
    { name: 'Fast Food', count: 526, color: '#4A5BF5' },
    { name: 'Desserts', count: 891, color: '#2DBCB6' }
  ];

  dummyDefaultAddress: any = {
    _id: 'addr_001',
    fullAddress: '123 MG Road, Madurai, Tamil Nadu 625001',
    addressType: 'Home',
    defaultAddress: true,
    coords: { lat: 9.9252, lng: 78.1198 },
    locality: { _id: 'loc_001', name: 'Madurai Central' }
  };

  dummyCategories: any[] = [
    { _id: 'cat_01', categoryName: 'Restaurants', imageUrl: '' },
    { _id: 'cat_02', categoryName: 'Groceries', imageUrl: '' },
    { _id: 'cat_03', categoryName: 'Sea Foods', imageUrl: '' },
    { _id: 'cat_04', categoryName: 'Bakery', imageUrl: '' },
    { _id: 'cat_05', categoryName: 'Fruits & Veggies', imageUrl: '' },
    { _id: 'cat_06', categoryName: 'Pharmacy', imageUrl: '' }
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
    this.eventSubscription = this.eventBus.on('address-updated').subscribe((payload) => {
      this.ionViewWillEnter();
    });
  }

  ionViewWillEnter() {
    const userData = this.storageService.getUser();
    if (userData.mobileNo) {
      if (userData.addresses.length) {
        this.router.navigate(['/tabs']);
        // eslint-disable-next-line no-underscore-dangle
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

  getDefaultAddressByUserId(userId: string) {
    this.homeService.getDefaultAddressByUserId(userId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.defaultAddress = resdata.data;
            this.getAllCategoriesByLocality();
          } else {
            this.defaultAddress = null;
          }
        } else {
          this.useDummyData();
        }
      },
      error: (_err: any) => {
        // Dummy mode fallback
        this.useDummyData();
      },
      complete: () => {},
    });
  }

  private useDummyData() {
    this.defaultAddress = this.dummyDefaultAddress;
    this.categories = this.dummyCategories;
  }

  getAllCategoriesByLocality() {
    if (this.defaultAddress) {
      // eslint-disable-next-line no-underscore-dangle
      this.homeService.getAllCategoriesByLocality(this.defaultAddress.locality._id).subscribe({
        next: (resdata: any) => {
          if (resdata.status) {
            if (resdata.data) {
              this.categories = resdata.data;
            } else {
              this.categories = null;
            }
          } else {
            this.commonService.presentToast('bottom', resdata.message, 'danger');
          }
        },
        error: (_err: any) => {
          // Dummy mode fallback
          this.categories = this.dummyCategories;
        },
        complete: () => {},
      });
    } else {
      this.categories = this.dummyCategories;
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
