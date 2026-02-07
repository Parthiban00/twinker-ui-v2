import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { VendorService } from 'src/app/pages/home-land/vendor.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-specific-item-list',
  templateUrl: './specific-item-list.page.html',
  styleUrls: ['./specific-item-list.page.scss'],
  standalone: false,
})
export class SpecificItemListPage implements OnInit {

  receivedData: any;
  imgBaseUrl: string = environment.imageBaseUrl;
  data: any[] = [];
  dataForSearch: any[] = [];

  constructor(private modalCtrl: ModalController, private navParams: NavParams,
    private vendorService: VendorService, private commonService: CommonService) {
    this.receivedData = this.navParams.get('data');
    console.log('Received data in modal:', this.receivedData);
    if (this.receivedData) {
      this.getData(this.receivedData.category, this.receivedData.popularCuisineKeyword);
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
      this.data = this.searchProductByName(this.dataForSearch, ev.target.value);
    }
  }

  searchProductByName(data, searchName) {
    return data.reduce((acc, vendorObj) => {
      // Filter products that match the search criteria
      const matchedProducts = vendorObj.products.filter(product =>
        product.productName.toLowerCase().includes(searchName.toLowerCase())
      );

      // If there are matched products, include the vendor and these products in the result
      if (matchedProducts.length > 0) {
        acc.push({
          vendor: vendorObj.vendor,
          products: matchedProducts
        });
      }

      return acc;
    }, []);
  }


  getData(categoryId: string, keyword: string) {
    this.vendorService.searchSpecificProductsByCategory(categoryId, keyword).subscribe({
      next: (resdata: any) => {
        if (resdata.status) {
          if (resdata.data) {
            this.data = resdata.data;
            this.dataForSearch = JSON.parse(JSON.stringify(this.data));
          } else {
            this.data = [];
          }
        } else {
          this.commonService.presentToast('bottom', resdata.message, 'danger');
        }
      },
      error: (err: any) => {
        // eslint-disable-next-line max-len
        this.commonService.presentToast('bottom', err.error.message ? err.error.message : 'Error while fetching data!', 'danger');
      },
      complete: () => {
      },
    });
  }
}
