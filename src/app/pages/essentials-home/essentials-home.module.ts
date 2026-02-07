import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EssentialsHomePageRoutingModule } from './essentials-home-routing.module';

import { EssentialsHomePage } from './essentials-home.page';
import { ItemsService } from '../items/items.service';
import { WebService } from 'src/app/services/web.service';
import { StorageService } from 'src/app/services/storage.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    EssentialsHomePageRoutingModule
  ],
  declarations: [EssentialsHomePage],
  providers: [ItemsService,WebService, StorageService,]
})
export class EssentialsHomePageModule {}
