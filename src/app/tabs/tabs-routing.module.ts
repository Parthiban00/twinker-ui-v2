import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home-main',
        loadChildren: () => import('../pages/home-main/home-main.module').then(m => m.HomeMainPageModule)
      },
      {
        path: 'deals',
        loadChildren: () => import('../pages/deals/deals.module').then(m => m.DealsPageModule)
      },
      {
        path: 'cart',
        loadChildren: () => import('../pages/cart/cart.module').then(m => m.CartPageModule)
      },
      {
        path: 'orders',
        loadChildren: () => import('../pages/orders/orders.module').then(m => m.OrdersPageModule)
      },
      {
        path: 'orders/orders-list',
        loadChildren: () => import('../pages/orders-list/orders-list.module').then(m => m.OrdersListPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../pages/profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/home-main',
        pathMatch: 'full'
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
