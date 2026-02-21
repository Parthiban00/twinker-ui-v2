import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorOrdersPage } from './vendor-orders.page';

const routes: Routes = [
  { path: '', component: VendorOrdersPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendorOrdersPageRoutingModule {}
