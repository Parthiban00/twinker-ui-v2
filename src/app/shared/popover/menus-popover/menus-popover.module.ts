import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenusPopoverPageRoutingModule } from './menus-popover-routing.module';

import { MenusPopoverPage } from './menus-popover.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenusPopoverPageRoutingModule
  ],
  imports: [MenusPopoverPage]
})
export class MenusPopoverPageModule {}
