import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationSetupPageRoutingModule } from './location-setup-routing.module';

import { LocationSetupPage } from './location-setup.page';
import { WebService } from 'src/app/services/web.service';
import { LocationSetupService } from './location-setup.service';
import { StorageService } from 'src/app/services/storage.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationSetupPageRoutingModule,
    HttpClientModule
  ],
  declarations: [LocationSetupPage],
  providers:[ WebService, LocationSetupService, StorageService ]
})
export class LocationSetupPageModule {}
