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

@Component({
  selector: 'app-home-main',
  templateUrl: './home-main.page.html',
  styleUrls: ['./home-main.page.scss'],
  standalone: false,
})
export class HomeMainPage implements OnInit {
  defaultAddress: any;
  categories: any;
  imgBaseUrl = environment.imageBaseUrl;
  eventMessage: string;
  eventSubscription: Subscription;
  todayDate: Date = new Date();

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    autoplay: true,
  };


  liveOffersSlideOptions = {
    slidesPerView: 1.5,
    centeredSlides: true,
    loop: true,
    spaceBetween: 10,
    autoplay: true,
  };

  dailyGroceries = [
    { name: 'Chicken', image: 'assets/chicken_vector.jpg' },
    { name: 'Mutton', image: 'assets/mutton_vector.jpg' },
    { name: 'Fish', image: 'assets/fish.jpg' },
    { name: 'Sea Foods', image: 'assets/prawn.jpg' },
    // { name: 'Grab', image: 'assets/grab.jpg' }
  ];

  constructor(public router: Router, private modalCtrl: ModalController,
    private storageService: StorageService, private homeService: HomeMainService,
    private commonService: CommonService, private navController: NavController, private eventBus: EventBusService) { }

  ngOnInit() {
    this.startBannerRotation();

    const list = document.querySelectorAll('.list');
    const nav = document.querySelector('.navigation');
    list.forEach(item => item.addEventListener('click', (e: any) => {
      list.forEach(li => li.classList.remove('active'));
      e.currentTarget.classList.add('active');
      // e.currentTarget.

    }));

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
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        // eslint-disable-next-line max-len
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching default address!', 'danger');

        if (err.error.message && err.error.message === 'Address not found') {
          this.router.navigate(['/shared/location-setup']);
        }
      },
      complete: () => {
      },
    });
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
        error: (err: any) => {
          // eslint-disable-next-line max-len
          this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching default address!', 'danger');
        },
        complete: () => {
        },
      });
    } else {
      this.commonService.presentToast('bottom', 'Delivery address not found!', 'danger');
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
        return 'assets/default.png'; // Optional: a default image if none matches
    }
  }

  goToHome(category: string) {
    this.router.navigate(['/home'], { queryParams: { category } });
  }

  handleInput(ev: any) {
    console.log(ev);
  }

  async exploreCategories() {
    const modal = await this.modalCtrl.create({
      component: CategoryListPage,
      componentProps: { categories: this.categories }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      // this.message = `Hello, ${data}!`;
    }
  }

  startBannerRotation() {
    const banners = document.querySelectorAll('.banner-image');
    let currentIndex = 0;

    setInterval(() => {
      banners[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % banners.length;
      banners[currentIndex].classList.add('active');
    }, 3000); // Change the image every 3 seconds
  }
}
