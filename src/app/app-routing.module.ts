import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  // {
  //   path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full'
  // },
  {
    path: '',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'location-setup',
    loadChildren: () => import('./pages/location-setup/location-setup.module').then( m => m.LocationSetupPageModule)
  },
  {
    path: 'home-main',
    loadChildren: () => import('./pages/home-main/home-main.module').then( m => m.HomeMainPageModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./pages/cart/cart.module').then( m => m.CartPageModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then( m => m.PaymentPageModule)
  },
  {
    path: 'otp-verification',
    loadChildren: () => import('./pages/otp-verification/otp-verification.module').then( m => m.OtpVerificationPageModule)
  },
  {
    path: 'shared/location-setup',
    loadChildren: () => import('./shared/location-setup/location-setup.module').then( m => m.LocationSetupPageModule)
  },
  {
    path: 'home-land',
    loadChildren: () => import('./pages/home-land/home-land.module').then( m => m.HomeLandPageModule)
  },
  {
    path: 'items',
    loadChildren: () => import('./pages/items/items.module').then( m => m.ItemsPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./pages/orders/orders.module').then( m => m.OrdersPageModule)
  },
  {
    path: 'all-items',
    loadChildren: () => import('./shared/pages/all-items/all-items.module').then( m => m.AllItemsPageModule)
  },
  {
    path: 'essentials-home',
    loadChildren: () => import('./pages/essentials-home/essentials-home.module').then( m => m.EssentialsHomePageModule)
  },
  {
    path: 'groceries-home',
    loadChildren: () => import('./pages/groceries-home/groceries-home.module').then( m => m.GroceriesHomePageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./pages/search/search.module').then( m => m.SearchPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
