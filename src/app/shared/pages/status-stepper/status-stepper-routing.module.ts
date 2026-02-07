import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StatusStepperPage } from './status-stepper.page';

const routes: Routes = [
  {
    path: '',
    component: StatusStepperPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatusStepperPageRoutingModule {}
