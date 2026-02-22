import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeliveryOrdersPageRoutingModule } from './delivery-orders-routing.module';
import { DeliveryOrdersPage } from './delivery-orders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryOrdersPageRoutingModule,
  ],
  declarations: [DeliveryOrdersPage],
})
export class DeliveryOrdersPageModule {}
