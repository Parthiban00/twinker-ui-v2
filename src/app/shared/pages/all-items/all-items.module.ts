import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AllItemsPageRoutingModule } from './all-items-routing.module';

import { AllItemsPage } from './all-items.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AllItemsPageRoutingModule
  ],
  exports:[
    AllItemsPage
  ],
  declarations: [AllItemsPage]
})
export class AllItemsPageModule {}
