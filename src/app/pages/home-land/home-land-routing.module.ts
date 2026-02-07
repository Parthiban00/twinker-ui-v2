import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeLandPage } from './home-land.page';

const routes: Routes = [
  {
    path: '',
    component: HomeLandPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeLandPageRoutingModule {}
