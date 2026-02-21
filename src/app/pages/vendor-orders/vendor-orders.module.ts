import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VendorOrdersPageRoutingModule } from './vendor-orders-routing.module';
import { VendorOrdersPage } from './vendor-orders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VendorOrdersPageRoutingModule,
  ],
  declarations: [VendorOrdersPage],
})
export class VendorOrdersPageModule {}
