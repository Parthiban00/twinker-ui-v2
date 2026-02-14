import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ServiceNotAvailablePage } from './service-not-available.page';

const routes: Routes = [
  {
    path: '',
    component: ServiceNotAvailablePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceNotAvailablePageRoutingModule {}
