import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CouponsPage } from 'src/app/shared/pages/coupons/coupons.page';
import { SpecificItemListPage } from 'src/app/shared/pages/specific-item-list/specific-item-list.page';
import { VendorService } from './vendor.service';
import { CommonService } from 'src/app/services/common.service';
import { HomeMainService } from '../home-main/home-main.service';
import { StorageService } from 'src/app/services/storage.service';
import { environment } from 'src/environments/environment';
import { register } from 'swiper/element/bundle';
import { AllItemsPage } from 'src/app/shared/pages/all-items/all-items.page';

register();

@Component({
  selector: 'app-home-land',
  templateUrl: './home-land.page.html',
  styleUrls: ['./home-land.page.scss'],
  standalone: false,
})
export class HomeLandPage implements OnInit {

  categoryId = '';
  vendorDetails: any[] = [];
  localityId = '';
  popularVendors: any[] = [];
  defaultAddress: any;
  imgBaseUrl: string = environment.imageBaseUrl;
  featuredItems: any[] = [];
  popularCuisines: any[] = [];

  liveOffersSlideOptions = {
    // slidesPerView: 1.5,
    // centeredSlides: false,
    // loop: true,
    // spaceBetween: 10,
    // autoplay: true,
  };

  constructor(private modalCtrl: ModalController, private activatedRoute: ActivatedRoute,
    private vendorService: VendorService, private commonService: CommonService,
    private homeService: HomeMainService, private storageService: StorageService) { }

  ionViewWillEnter() {
    const userData = this.storageService.getUser();

    this.activatedRoute.queryParams.subscribe(params => {
      // Access individual query parameters here
      this.categoryId = params.categoryId;
      this.localityId = params.localityId;


      if (this.categoryId && this.localityId && userData) {
        // this.getAllByLocalityAndCategory(this.localityId, this.categoryId);
        // eslint-disable-next-line no-underscore-dangle
        this.getDefaultAddressByUserId(userData._id);
      }

      if (this.categoryId) {
        this.getFeaturedItemsByCategory(this.categoryId);
        this.getPopularCuisines(this.categoryId);
      }
    });
  }

  getDefaultAddressByUserId(userId: string) {

    this.homeService.getDefaultAddressByUserId(userId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.defaultAddress = resdata.data;
            this.getAllByLocalityAndCategory(this.localityId, this.categoryId);
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
      },
      complete: () => {
      },
    });
  }

  getPopularCuisines(categoryId: string) {

    this.homeService.getPopularCuisines(categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.popularCuisines = resdata.data;
          } else {
            this.popularCuisines = [];
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        // eslint-disable-next-line max-len
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching popular cuisines!', 'danger');
      },
      complete: () => {
      },
    });
  }

  getFeaturedItemsByCategory(categoryId: string) {

    this.homeService.getFeaturedItemsByCategory(categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.featuredItems = resdata.data;
          } else {
            this.featuredItems = [];
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        // eslint-disable-next-line max-len
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching featured items!', 'danger');
      },
      complete: () => {
      },
    });
  }

  getAllByLocalityAndCategory(localityId, categoryId) {

    // eslint-disable-next-line no-underscore-dangle
    this.vendorService.getAllByLocalityAndCategory(localityId, categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.vendorDetails = resdata.data;

            //calculate distance between customer and vendor
            //calculate approximate delivery time based on distance 3min p/km and 15 for prepare/pickup
            this.vendorDetails.map((vendor) => {
              // eslint-disable-next-line max-len
              vendor.distance = this.commonService.calculateDistance(this.defaultAddress.coords.lat, this.defaultAddress.coords.lng, vendor.latitude, vendor.longitude);
              vendor.approxDeliveryTime = (Math.ceil(parseFloat(vendor.distance)) * 3) + 15;
            });

            this.popularVendors = this.vendorDetails.filter(vendor => vendor.popular);
          } else {
            this.vendorDetails = [];
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        // eslint-disable-next-line max-len
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching vendor details!', 'danger');
      },
      complete: () => {
      },
    });

  }

  getPopularByLocalityAndCategory(localityId, categoryId) {

    // eslint-disable-next-line no-underscore-dangle
    this.vendorService.getPopularByLocalityAndCategory(localityId, categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.vendorDetails = resdata.data;
          } else {
            this.vendorDetails = [];
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        // eslint-disable-next-line max-len
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching vendor details!', 'danger');
      },
      complete: () => {
      },
    });

  }

  ngOnInit() {
  }

  handleSearchInput(ev: any) {
    // eslint-disable-next-line no-underscore-dangle
    this.vendorService.searchVendorByLocalityAndCategory(ev.target.value, this.localityId, this.categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.vendorDetails = resdata.data;

            //calculate distance between customer and vendor
            //calculate approximate delivery time based on distance 3min p/km and 15 for prepare/pickup
            this.vendorDetails.map((vendor) => {
              // eslint-disable-next-line max-len
              vendor.distance = this.commonService.calculateDistance(this.defaultAddress.coords.lat, this.defaultAddress.coords.lng, vendor.latitude, vendor.longitude);
              vendor.approxDeliveryTime = (Math.ceil(parseFloat(vendor.distance)) * 3) + 15;
            });

            this.popularVendors = this.vendorDetails.filter(vendor => vendor.popular);
          } else {
            this.vendorDetails = [];
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        // eslint-disable-next-line max-len
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching vendor details!', 'danger');
      },
      complete: () => {
      },
    });

  }

  onWillDismiss(ev: any) {

  }

  async openModal(passData: any) {
    const modal = await this.modalCtrl.create({
      component: SpecificItemListPage,
      componentProps: {
        // Pass data to the modal here
        data: passData
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      // this.message = `Hello, ${data}!`;
    }
  }

  async openFeaturedItemsMoal() {
    const modal = await this.modalCtrl.create({
      component: AllItemsPage,
      componentProps: {
        // Pass data to the modal here
        data: { locality: this.localityId, category: this.categoryId }
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      // this.message = `Hello, ${data}!`;
    }
  }

  async openCouponModal() {
    const modal = await this.modalCtrl.create({
      component: CouponsPage,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      // this.message = `Hello, ${data}!`;
    }
  }
}
