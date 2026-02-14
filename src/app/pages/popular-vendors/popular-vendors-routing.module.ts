import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PopularVendorsPage } from './popular-vendors.page';

const routes: Routes = [
  {
    path: '',
    component: PopularVendorsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PopularVendorsPageRoutingModule {}
