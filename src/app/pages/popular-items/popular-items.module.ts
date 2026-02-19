import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PopularItemsPageRoutingModule } from './popular-items-routing.module';
import { PopularItemsPage } from './popular-items.page';
import { PopularItemsService } from './popular-items.service';
import { WebService } from 'src/app/services/web.service';
import { StorageService } from 'src/app/services/storage.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PopularItemsPageRoutingModule
  ],
  declarations: [PopularItemsPage],
  providers: [PopularItemsService, WebService, StorageService]
})
export class PopularItemsPageModule {}
