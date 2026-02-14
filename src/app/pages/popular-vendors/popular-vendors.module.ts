import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PopularVendorsPageRoutingModule } from './popular-vendors-routing.module';
import { PopularVendorsPage } from './popular-vendors.page';
import { PopularVendorsService } from './popular-vendors.service';
import { WebService } from 'src/app/services/web.service';
import { StorageService } from 'src/app/services/storage.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PopularVendorsPageRoutingModule
  ],
  declarations: [PopularVendorsPage],
  providers: [PopularVendorsService, WebService, StorageService]
})
export class PopularVendorsPageModule {}
