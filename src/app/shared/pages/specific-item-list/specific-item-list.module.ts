import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SpecificItemListPageRoutingModule } from './specific-item-list-routing.module';

import { SpecificItemListPage } from './specific-item-list.page';
import { VendorService } from '../../../pages/home-land/vendor.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SpecificItemListPageRoutingModule
  ], exports: [
    SpecificItemListPage
  ],
  declarations: [SpecificItemListPage],
  providers: [VendorService]
})
export class SpecificItemListPageModule {}
