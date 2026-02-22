import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryOrdersPage } from './delivery-orders.page';

const routes: Routes = [
  { path: '', component: DeliveryOrdersPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryOrdersPageRoutingModule {}
