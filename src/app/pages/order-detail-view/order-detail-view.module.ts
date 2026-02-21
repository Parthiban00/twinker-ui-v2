import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { OrderDetailViewPageRoutingModule } from './order-detail-view-routing.module';

import { OrderDetailViewPage } from './order-detail-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonicModule,
    OrderDetailViewPageRoutingModule,
  ],
  declarations: [OrderDetailViewPage],
})
export class OrderDetailViewPageModule {}
