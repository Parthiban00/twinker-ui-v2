import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LocationSetupPageRoutingModule } from './location-setup-routing.module';
import { LocationSetupPage } from './location-setup.page';

import { WebService } from 'src/app/services/web.service';
import { HttpClientModule } from '@angular/common/http';
import { LocationService } from './location.service';
import { StorageService } from 'src/app/services/storage.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationSetupPageRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  declarations: [LocationSetupPage],
  providers:[ WebService, LocationService, StorageService ]

})
export class LocationSetupPageModule {}
