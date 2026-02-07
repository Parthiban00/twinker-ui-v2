import { Component, OnInit } from '@angular/core';
import { OrderDetailViewPage } from '../order-detail-view/order-detail-view.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.page.html',
  styleUrls: ['./orders-list.page.scss'],
  standalone: false,
})
export class OrdersListPage implements OnInit {

  orderData: any = [{
    _id: '1',
    orderCode: 'ORD-001',
    placedTime: '20/01/2024',
    status: 'Placed',
    itemNames: 'Chicken Rice, Parotta'
  }];

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  goToOrderDetailView(orderId: string, orderCode: string) {

  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: OrderDetailViewPage,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      // this.message = `Hello, ${data}!`;
    }
  }
}
