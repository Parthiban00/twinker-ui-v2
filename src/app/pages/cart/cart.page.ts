import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PaymentPage } from '../payment/payment.page';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage implements OnInit {
  default = 'Delivery';
  wishes = '';
  itemAmount = 234;
  Charges = false;
  discount = false;
  AmountWithCharges = 345;
  deliveryPartnerFee1 = 23;
  totalAmount1 = 4354;
  coupon = '';
  applied = false;
  couponPresent = false;
  couponApplied = false;
  selectedLocation = 'asdf ,sf sd ,sadfas s';

  // eslint-disable-next-line @typescript-eslint/naming-convention
  CartItemsLocal = [
    {
      _id: '233',
      RestaurantId: '2344',
      MenuId: '32432',
      MenuName: 'asdf ',
      ProductName: 'Chicken Fried RIce',
      Description: 'adfas',
      Price: 234,
      Size: '1Full',
      AvailableTime: '',
      AvailableStatus: '',
      AvailableDays: '',
      ActiveYn: true,
      DeleteYn: false,
      ItemCount: 3,
      Amount: 123,
      Offer: 234,
      OfferPrice: 543,
      Commission: '',
      Sort: '',
      OfferDescription: 'Devali offer',
      ImageUrl: '',
      ActualAmount: '',
      Category: '',
      RestaurantName: '',
      Recommended: '',
      Badge: '',
      BadgeDescription: '',
      Type: '',
      Suggestion: '',
      Customizable: '',
      CustomizableDetails: '',
    },
  ];

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() { }

  decreaseItemLocalStorage(index, menuid, menuname, cartid) {

  }

  incraseItemLocalStorage(index, menuid, menuname, cartid) {

  }

  reset(ev: any) {
    console.log('modal close event ', ev);
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: PaymentPage,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      // this.message = `Hello, ${data}!`;
    }
  }
}
