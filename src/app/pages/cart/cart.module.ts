import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartPageRoutingModule } from './cart-routing.module';

import { CartPage } from './cart.page';
import { ItemCustomisePageModule } from 'src/app/shared/pages/item-customise/item-customise.module';
import { PaymentPageModule } from '../payment/payment.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartPageRoutingModule,
    ItemCustomisePageModule,
    PaymentPageModule
  ],
  declarations: [CartPage]
})
export class CartPageModule {}
