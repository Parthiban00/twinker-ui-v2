import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PopularItemsPage } from './popular-items.page';

const routes: Routes = [
  {
    path: '',
    component: PopularItemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PopularItemsPageRoutingModule {}
