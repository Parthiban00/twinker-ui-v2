import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatusStepperPageRoutingModule } from './status-stepper-routing.module';

import { StatusStepperPage } from './status-stepper.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusStepperPageRoutingModule
  ],
  exports:[
    StatusStepperPage
  ],
  declarations: [StatusStepperPage]
})
export class StatusStepperPageModule {}
