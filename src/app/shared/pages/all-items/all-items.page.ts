import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { HomeMainService } from 'src/app/pages/home-main/home-main.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import { FilterPopoverComponent } from '../../popover/filter-popover/filter-popover.component';

@Component({
  selector: 'app-all-items',
  templateUrl: './all-items.page.html',
  styleUrls: ['./all-items.page.scss'],
  standalone: false,
})
export class AllItemsPage implements OnInit {
  // @ViewChild('popover') popover;

  receivedData: any;
  imgBaseUrl: string = environment.imageBaseUrl;
  featuredItems: any[] = [];
  dataForSearch: any[] = [];
  isOpen = false;
  vendors: any;
  currentFilters = {
    selectedVendor: null,
    priceRange: { lower: 20, upper: 500 },
    offerType: null,
    offerPercentageRange: { lower: 0, upper: 100 },
    offerPriceRange: { lower: 0, upper: 500 }
  };

  constructor(private modalCtrl: ModalController, private navParams: NavParams,
    private homeService: HomeMainService, private commonService: CommonService) {
    this.receivedData = this.navParams.get('data');
    console.log('Received data in modal:', this.receivedData);
    if (this.receivedData) {
      this.getFeaturedItemsByCategory(this.receivedData.category);
    }
  }

  ngOnInit(): void { }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss('data', 'confirm');
  }

  handleSearchInput(ev: any) {
    if (this.dataForSearch) {
      this.featuredItems = this.searchProductByName(this.dataForSearch, ev.target.value);
    }
  }

  async presentPopover(ev: any) {
    const modal = await this.modalCtrl.create({
      component: FilterPopoverComponent,
      componentProps: {
        vendors: this.vendors,
        currentFilters: this.currentFilters
      }
    });

    modal.onWillDismiss().then((data) => {
      if (data.role === 'confirm') {
        console.log('Filter data:', data.data);

        this.applyFilters(data.data);
        // Handle the filter data
      }
    });

    return await modal.present();
  }


  searchProductByName(data, searchName) {
    const matchedProducts = data.filter(product =>
      product.productName.toLowerCase().includes(searchName.toLowerCase())
    );

    // If there are matched products, include the vendor and these products in the result
    return matchedProducts;
  }

  getFeaturedItemsByCategory(categoryId: string) {

    this.homeService.getFeaturedItemsByCategory(categoryId).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.featuredItems = resdata.data;
            this.dataForSearch = JSON.parse(JSON.stringify(this.featuredItems));

            this.vendors = this.extractUniqueVendors(this.dataForSearch);
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

  applyFilters(filters) {
    this.currentFilters = filters;

    this.featuredItems = this.dataForSearch.filter(item => {
      let matches = true;

      // eslint-disable-next-line no-underscore-dangle
      if (filters.selectedVendor && item.vendor._id !== filters.selectedVendor._id) {
        matches = false;
      }

      if (item.price < filters.priceRange.lower || item.price > filters.priceRange.upper) {
        matches = false;
      }

      if (filters.offerType) {
        if (filters.offerType === 'in-percentage' && item.discountType !== 'in-percentage') {
          matches = false;
        } else if (filters.offerType === 'in-price' && item.discountType !== 'in-price') {
          matches = false;
        }
      }

      if (filters.offerType === 'in-percentage' &&
        (item.discount < filters.offerPercentageRange.lower || item.discount > filters.offerPercentageRange.upper)) {
        matches = false;
      }

      if (filters.offerType === 'in-price' &&
        (item.discount < filters.offerPriceRange.lower || item.discount > filters.offerPriceRange.upper)) {
        matches = false;
      }

      return matches;
    });
  }

  extractUniqueVendors(items) {
    const vendorMap = {};
    items.forEach(item => {
      // eslint-disable-next-line no-underscore-dangle
      if (!vendorMap[item.vendor._id]) {
        // eslint-disable-next-line no-underscore-dangle
        vendorMap[item.vendor._id] = item.vendor;
      }
    });
    return Object.values(vendorMap);
  }
}
