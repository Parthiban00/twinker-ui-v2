import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemCustomisePageRoutingModule } from './item-customise-routing.module';

import { ItemCustomisePage } from './item-customise.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemCustomisePageRoutingModule
  ],
  exports: [
    ItemCustomisePage
  ],
  declarations: [ItemCustomisePage]
})
export class ItemCustomisePageModule { }
