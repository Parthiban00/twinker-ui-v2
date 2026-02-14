import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeLandPageRoutingModule } from './home-land-routing.module';

import { HomeLandPage } from './home-land.page';
import { SpecificItemListPageModule } from 'src/app/shared/pages/specific-item-list/specific-item-list.module';
import { WebService } from 'src/app/services/web.service';
import { VendorService } from './vendor.service';
import { StorageService } from 'src/app/services/storage.service';
import { HomeMainService } from '../home-main/home-main.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeLandPageRoutingModule,
    SpecificItemListPageModule
  ],
  declarations: [HomeLandPage],
  providers:[ WebService, VendorService, StorageService, HomeMainService ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeLandPageModule {}
