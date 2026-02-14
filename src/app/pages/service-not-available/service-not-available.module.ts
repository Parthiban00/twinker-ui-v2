import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ServiceNotAvailablePageRoutingModule } from './service-not-available-routing.module';
import { ServiceNotAvailablePage } from './service-not-available.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ServiceNotAvailablePageRoutingModule
  ],
  declarations: [ServiceNotAvailablePage]
})
export class ServiceNotAvailablePageModule {}
