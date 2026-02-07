import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroceriesHomePage } from './groceries-home.page';

const routes: Routes = [
  {
    path: '',
    component: GroceriesHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroceriesHomePageRoutingModule {}
