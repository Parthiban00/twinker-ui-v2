import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonAccordion, ModalController, NavController, PopoverController } from '@ionic/angular';
import { CommonService } from 'src/app/services/common.service';
import { EventBusService } from 'src/app/services/event-bus.service';
import { StorageService } from 'src/app/services/storage.service';
import { MenusPopoverPage } from 'src/app/shared/popover/menus-popover/menus-popover.page';
import { ItemsService } from './items.service';
import { environment } from 'src/environments/environment';
import { ItemCustomisePage } from 'src/app/shared/pages/item-customise/item-customise.page';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
  standalone: false,
})
export class ItemsPage implements OnInit {
  @ViewChildren(IonAccordion, { read: ElementRef }) categoryElements: QueryList<ElementRef>;

  userData: any;
  vendorId: string;
  imgBaseUrl: string = environment.imageBaseUrl;
  expandedAccordionValues: Array<string> = [];
  productDetails: any[] = [];
  customerReviews: any;
  selectedCategory: string;
  vendorDetails: any;
  activeSegment = 'items';
  comments = '';
  starRating = 3;
  averageRating = 3;
  stars: string[] = [];
  vegOnly = false;
  searchTerm = '';
  specialOfferItems: any[] = [];

  constructor(public popoverController: PopoverController, public router: Router, private modalCtrl: ModalController,
    private storageService: StorageService,
    private commonService: CommonService, private navController: NavController, private eventBus: EventBusService,
    private activatedRoute: ActivatedRoute, private itemService: ItemsService) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.userData = this.storageService.getUser();

    this.activatedRoute.queryParams.subscribe(params => {
      // Access individual query parameters here
      this.vendorId = params.vendorId;

      if (this.vendorId) {
        //need to call category and products api
        this.getAllProductsByVendor(this.vendorId);
        this.getDiscountedItemsByVendor(this.vendorId);
        this.getVendorDetails(this.vendorId);
        this.getReviewsByVendor(this.vendorId);
        this.generateStars();
      }
    });

  }

  getAllProductsByVendor(vendorId: string) {
    const queryParams = this.vegOnly ? '?vegOnly=true' : '' + this.searchTerm ? `?search=${this.searchTerm}` : '';

    this.itemService.getAllProductsByVendor(vendorId, queryParams).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.productDetails = resdata.data;

            if (this.productDetails) {
              // Extract category IDs and set the first selected category
              this.expandedAccordionValues = this.productDetails.map(
                (productList: any) => productList.category._id
              );
              this.selectedCategory = this.productDetails[0]?.category._id;

              // Extract products with tags using map and reduce
              const productsWithTags = this.productDetails
                .map(category => category.products || []) // Extract products arrays
                .reduce((acc, products) => acc.concat(products), []) // Flatten the arrays
                .filter(product => product.tag && product.tag !== "none"); // Filter products with valid tags

              console.log(productsWithTags);

              if (productsWithTags.length > 0) {
                // Add 'featured-items' to the 0th index of expandedAccordionValues
                this.expandedAccordionValues.unshift('featured-items');

                // Construct the featured items category and add it to the productDetails array
                const featuredItems = {
                  category: {
                    categoryName: 'Featured Items',
                    closeTime: '',
                    status: true,
                    vendor: productsWithTags[0]?.vendor,
                    _id: 'featured-items',
                  },
                  products: productsWithTags,
                };

                this.productDetails.unshift(featuredItems);
              }
            }
          } else {
            this.productDetails = [];
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

  getVendorDetails(vendorId: string) {
    this.itemService.getVendorDetails(vendorId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.vendorDetails = resdata.data;
          } else {
            this.vendorDetails = null;
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

  getDiscountedItemsByVendor(vendorId: string) {

    this.itemService.getDiscountedProductsByVendor(vendorId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.specialOfferItems = resdata.data;
          } else {
            this.specialOfferItems = [];
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        // eslint-disable-next-line max-len
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching special offer items!', 'danger');
      },
      complete: () => {
      },
    });
  }

  segmentChange(ev: any) {
    this.activeSegment = ev.target.value;
  }

  scrollToCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    const categoryElement = this.categoryElements.find(element => element.nativeElement.id === categoryId);

    if (categoryElement) {
      categoryElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }

    document.querySelector('ion-popover').dismiss();
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: MenusPopoverPage,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });

    popover.onDidDismiss().then((data: any) => {
      console.log('from popover data  ' + data.data.fromPopover);
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  onRatingUpdated(rating: number) {
    this.starRating = rating;
    console.log('Rating updated:', rating);
  }

  getReviewsByVendor(vendorId: string) {
    this.itemService.getReviewByVendor(vendorId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.customerReviews = resdata.data;
            this.averageRating = resdata.data.averageRating;

            this.generateStars();
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        // eslint-disable-next-line max-len
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching reviews!', 'danger');
      },
      complete: () => {
      },
    });
  }


  submitReview() {
    const reqData = {
      // eslint-disable-next-line no-underscore-dangle
      userId: this.userData._id,
      vendorId: this.vendorId,
      starCount: this.starRating,
      comments: this.comments
    };

    this.itemService.addReview(reqData).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          this.getReviewsByVendor(this.vendorId);
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        // eslint-disable-next-line max-len
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while add review', 'danger');
      },
      complete: () => {
      },
    });
  }

  generateStars() {
    const fullStars = Math.floor(this.averageRating);
    const halfStar = this.averageRating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    this.stars = [
      ...Array(fullStars).fill('fa fa-star checked'),
      ...Array(halfStar).fill('fa fa-star-half-o checked'),
      ...Array(emptyStars).fill('fa fa-star-o')
    ];
  }

  onToggleChange(event: any) {
    this.vegOnly = event.detail.checked;
    this.getAllProductsByVendor(this.vendorId);
  }

  handleSearchInput(ev: any) {
    this.searchTerm = ev.target.value;
    this.getAllProductsByVendor(this.vendorId);
  }

  async openModal(product: any) {
    const modal = await this.modalCtrl.create({
      component: ItemCustomisePage,
      componentProps: { data: product }
    });
    modal.present();

    const { data } = await modal.onWillDismiss();

    if (data.role === 'confirm' && data.data) {
      this.handleModalData(data.data);
    }
  }

  reset(event: any) {}

  handleModalData(productData) {
    // Handle the returned product data here
    console.log('Product data:', productData);
  }
}
