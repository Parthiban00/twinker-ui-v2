import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: false,
})
export class PaymentPage implements OnInit {

  paymentOptions = [
    {
      id: 1,
      name: 'Payment Gateway(soon...)',
      type: 'PG',
    },
    {
      id: 2,
      name: 'Cash On Delevery',
      type: 'COD',
    },

  ];



  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss('data', 'confirm');
  }

  handleInput(ev: any) {

  }

  compareWith(o1, o2) {
    return o1.id === o2.id;
  }

  handleChange(ev) {
    console.log('Current value:', JSON.stringify(ev.target.value));
  }

  trackItems(index: number, item: any) {
    return item.id;
  }
}

