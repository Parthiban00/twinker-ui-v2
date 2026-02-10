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
import { AllItemsPage } from 'src/app/shared/pages/all-items/all-items.page';

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
  productDetails: any[] = [];
  pageTitle = 'Near Me';

  dummyVendors: any[] = [
    {
      _id: '1',
      name: 'Bottega Restorante',
      description: 'Italian restaurant with various dishes',
      profileImgUrl: '',
      distance: '4.6',
      approxDeliveryTime: 15,
      rating: 4.6,
      ratingCount: 456,
      startPrice: 49,
      tags: ['Extra discount', 'Free delivery'],
      dummyImg: 'assets/announcement-banner.jpg'
    },
    {
      _id: '2',
      name: 'SOULFOOD Jakarta',
      description: 'Indonesian comfort eats served..',
      profileImgUrl: '',
      distance: '3.2',
      approxDeliveryTime: 10,
      rating: 4.7,
      ratingCount: 346,
      startPrice: 35,
      tags: ['Extra discount'],
      dummyImg: 'assets/announcement-banner.jpg'
    },
    {
      _id: '3',
      name: 'Greyhound Cafe',
      description: 'Hip, industrial-style eatery with..',
      profileImgUrl: '',
      distance: '2.6',
      approxDeliveryTime: 10,
      rating: 4.2,
      ratingCount: 354,
      startPrice: 39,
      tags: ['Free delivery'],
      dummyImg: 'assets/announcement-banner.jpg'
    },
    {
      _id: '4',
      name: 'Le Quartier',
      description: 'Classic French-influenced brasseri..',
      profileImgUrl: '',
      distance: '5.4',
      approxDeliveryTime: 15,
      rating: 4.6,
      ratingCount: 546,
      startPrice: 79,
      tags: ['Extra discount', 'Free delivery'],
      dummyImg: 'assets/announcement-banner.jpg'
    },
    {
      _id: '5',
      name: 'Sofia Gunawarman',
      description: 'Modern fusion cuisine and cocktails..',
      profileImgUrl: '',
      distance: '1.8',
      approxDeliveryTime: 12,
      rating: 4.6,
      ratingCount: 456,
      startPrice: 55,
      tags: ['Recommended'],
      dummyImg: 'assets/announcement-banner.jpg'
    }
  ];

  dummyDefaultAddress: any = {
    _id: 'addr_001',
    fullAddress: '123 MG Road, Madurai, Tamil Nadu 625001',
    addressType: 'Home',
    defaultAddress: true,
    coords: { lat: 9.9252, lng: 78.1198 },
    locality: { _id: 'loc_001', name: 'Madurai Central' }
  };

  filters = [
    { name: 'Filter', active: false },
    { name: 'Discount promo', active: false },
    { name: 'Recommended', active: false },
    { name: 'Highest rated', active: false }
  ];

  constructor(
    private modalCtrl: ModalController,
    private activatedRoute: ActivatedRoute,
    private vendorService: VendorService,
    private commonService: CommonService,
    private homeService: HomeMainService,
    private storageService: StorageService
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    const userData = this.storageService.getUser();

    this.activatedRoute.queryParams.subscribe(params => {
      this.categoryId = params.categoryId;
      this.localityId = params.localityId;

      if (params.title) {
        this.pageTitle = params.title;
      }

      if (userData?._id && (this.categoryId || this.localityId)) {
        this.getDefaultAddressByUserId(userData._id);
      } else {
        // Dummy mode: use fallback address so dummy vendors display
        this.defaultAddress = this.dummyDefaultAddress;
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
            if (this.categoryId) {
              this.getAllByLocalityAndCategory(this.localityId, this.categoryId);
            }
          } else {
            this.defaultAddress = this.dummyDefaultAddress;
          }
        } else {
          this.defaultAddress = this.dummyDefaultAddress;
        }
      },
      error: (_err: any) => {
        // Dummy mode fallback
        this.defaultAddress = this.dummyDefaultAddress;
      },
      complete: () => {},
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
      error: (_err: any) => {
        this.popularCuisines = [];
      },
      complete: () => {},
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
      error: (_err: any) => {
        this.featuredItems = [];
      },
      complete: () => {},
    });
  }

  getAllByLocalityAndCategory(localityId, categoryId) {
    this.vendorService.getAllByLocalityAndCategory(localityId, categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.vendorDetails = resdata.data;
            this.vendorDetails.map((vendor) => {
              vendor.distance = this.commonService.calculateDistance(
                this.defaultAddress.coords.lat, this.defaultAddress.coords.lng,
                vendor.latitude, vendor.longitude
              );
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
      error: (_err: any) => {
        this.vendorDetails = [];
      },
      complete: () => {},
    });
  }

  handleSearchInput(ev: any) {
    this.vendorService.searchVendorByLocalityAndCategory(ev.target.value, this.localityId, this.categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.vendorDetails = resdata.data;
            this.vendorDetails.map((vendor) => {
              vendor.distance = this.commonService.calculateDistance(
                this.defaultAddress.coords.lat, this.defaultAddress.coords.lng,
                vendor.latitude, vendor.longitude
              );
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
      error: (_err: any) => {
        this.vendorDetails = [];
      },
      complete: () => {},
    });
  }

  selectFilter(filter: any) {
    filter.active = !filter.active;
  }

  async openModal(passData: any) {
    const modal = await this.modalCtrl.create({
      component: SpecificItemListPage,
      componentProps: { data: passData }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {}
  }

  async openFeaturedItemsMoal() {
    const modal = await this.modalCtrl.create({
      component: AllItemsPage,
      componentProps: { data: { locality: this.localityId, category: this.categoryId } }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {}
  }

  async openCouponModal() {
    const modal = await this.modalCtrl.create({
      component: CouponsPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {}
  }
}
