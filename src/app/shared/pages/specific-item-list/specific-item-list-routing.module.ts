import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpecificItemListPage } from './specific-item-list.page';

const routes: Routes = [
  {
    path: '',
    component: SpecificItemListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpecificItemListPageRoutingModule {}
