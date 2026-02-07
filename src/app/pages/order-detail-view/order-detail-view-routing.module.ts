import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderDetailViewPage } from './order-detail-view.page';

const routes: Routes = [
  {
    path: '',
    component: OrderDetailViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderDetailViewPageRoutingModule {}
