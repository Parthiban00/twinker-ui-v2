import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroceriesHomePageRoutingModule } from './groceries-home-routing.module';

import { GroceriesHomePage } from './groceries-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroceriesHomePageRoutingModule
  ],
  declarations: [GroceriesHomePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GroceriesHomePageModule {}
