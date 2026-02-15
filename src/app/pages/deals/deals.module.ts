import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DealsPageRoutingModule } from './deals-routing.module';
import { DealsPage } from './deals.page';
import { DealsService } from './deals.service';
import { WebService } from 'src/app/services/web.service';
import { StorageService } from 'src/app/services/storage.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DealsPageRoutingModule
  ],
  declarations: [DealsPage],
  providers: [DealsService, WebService, StorageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DealsPageModule {}
