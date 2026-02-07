import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EssentialsHomePage } from './essentials-home.page';

const routes: Routes = [
  {
    path: '',
    component: EssentialsHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EssentialsHomePageRoutingModule {}
