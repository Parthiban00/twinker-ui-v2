import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-item-customise',
  templateUrl: './item-customise.page.html',
  styleUrls: ['./item-customise.page.scss'],
  standalone: false,
})
export class ItemCustomisePage implements OnInit {
  productData: any;

  constructor(private modalCtrl: ModalController, private navParams: NavParams) { }

  cancel() {
    return this.modalCtrl.dismiss({data:null, role:'cancel'});
  }

  confirm() {
    this.modalCtrl.dismiss({
      data: this.productData,
      role: 'confirm'
    });
  }

  ngOnInit() {
    this.productData = this.navParams.get('data');

    console.log('product data ', this.productData);
  }

  ionViewDidEnter() {
    if (this.productData) {
      if (this.productData.itemCount <= 0) {
        this.productData.itemCount = 1;
      }
    }
  }

}
