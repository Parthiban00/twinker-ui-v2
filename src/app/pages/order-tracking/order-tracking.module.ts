import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OrderTrackingPageRoutingModule } from './order-tracking-routing.module';
import { OrderTrackingPage } from './order-tracking.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    OrderTrackingPageRoutingModule,
  ],
  declarations: [OrderTrackingPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrderTrackingPageModule {}
