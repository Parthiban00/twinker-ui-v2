import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenusPopoverPage } from './menus-popover.page';

const routes: Routes = [
  {
    path: '',
    component: MenusPopoverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenusPopoverPageRoutingModule {}
