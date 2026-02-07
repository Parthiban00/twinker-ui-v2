import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemsPageRoutingModule } from './items-routing.module';

import { ItemsPage } from './items.page';
import { WebService } from 'src/app/services/web.service';
import { StorageService } from 'src/app/services/storage.service';
import { HttpClientModule } from '@angular/common/http';
import { ItemsService } from './items.service';
import { StarRatingComponent } from 'src/app/shared/components/star-rating/star-rating.component';
import { TimeAgoPipe } from 'src/app/shared/pipes/time-ago.pipe';
import { ItemCustomisePageModule } from 'src/app/shared/pages/item-customise/item-customise.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemsPageRoutingModule,
    HttpClientModule,
    StarRatingComponent,
    ItemCustomisePageModule
  ],
  declarations: [ItemsPage, TimeAgoPipe],
  providers:[ WebService, StorageService, ItemsService ]
})
export class ItemsPageModule {}
