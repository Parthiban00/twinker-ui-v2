import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderDetailViewPageRoutingModule } from './order-detail-view-routing.module';

import { OrderDetailViewPage } from './order-detail-view.page';
import { StatusStepperPageModule } from 'src/app/shared/pages/status-stepper/status-stepper.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderDetailViewPageRoutingModule,
    StatusStepperPageModule,
    OrderDetailViewPage
  ]
})
export class OrderDetailViewPageModule {}
