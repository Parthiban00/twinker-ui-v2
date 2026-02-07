import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemCustomisePage } from './item-customise.page';

const routes: Routes = [
  {
    path: '',
    component: ItemCustomisePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemCustomisePageRoutingModule {}
