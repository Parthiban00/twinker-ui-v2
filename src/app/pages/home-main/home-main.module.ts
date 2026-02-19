import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeMainPageRoutingModule } from './home-main-routing.module';

import { HomeMainPage } from './home-main.page';
import { StorageService } from 'src/app/services/storage.service';
import { HomeMainService } from './home-main.service';
import { WebService } from 'src/app/services/web.service';
import { CategoryListPageModule } from 'src/app/modals/category-list/category-list.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeMainPageRoutingModule,
    CategoryListPageModule
  ],
  declarations: [HomeMainPage],
  providers:[ WebService, HomeMainService, StorageService ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeMainPageModule {}
