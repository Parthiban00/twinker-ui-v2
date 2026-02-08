import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrdersListPageRoutingModule } from './orders-list-routing.module';

import { OrdersListPage } from './orders-list.page';
import { OrderDetailViewPageModule } from '../order-detail-view/order-detail-view.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdersListPageRoutingModule,
    OrderDetailViewPageModule
  ],
  declarations: [OrdersListPage]
})
export class OrdersListPageModule {}
