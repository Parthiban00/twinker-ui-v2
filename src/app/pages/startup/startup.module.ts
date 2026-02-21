import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StartupPageRoutingModule } from './startup-routing.module';
import { StartupPage } from './startup.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    StartupPageRoutingModule
  ],
  declarations: [StartupPage]
})
export class StartupPageModule {}
