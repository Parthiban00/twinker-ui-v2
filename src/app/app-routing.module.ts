import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'otp-verification',
    loadChildren: () => import('./pages/otp-verification/otp-verification.module').then( m => m.OtpVerificationPageModule)
  },
  {
    path: 'service-not-available',
    loadChildren: () => import('./pages/service-not-available/service-not-available.module').then( m => m.ServiceNotAvailablePageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'location-setup',
    loadChildren: () => import('./pages/location-setup/location-setup.module').then( m => m.LocationSetupPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'home-main',
    loadChildren: () => import('./pages/home-main/home-main.module').then( m => m.HomeMainPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'cart',
    loadChildren: () => import('./pages/cart/cart.module').then( m => m.CartPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then( m => m.PaymentPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'shared/location-setup',
    loadChildren: () => import('./shared/location-setup/location-setup.module').then( m => m.LocationSetupPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'home-land',
    loadChildren: () => import('./pages/home-land/home-land.module').then( m => m.HomeLandPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'items',
    loadChildren: () => import('./pages/items/items.module').then( m => m.ItemsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'orders',
    loadChildren: () => import('./pages/orders/orders.module').then( m => m.OrdersPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'all-items',
    loadChildren: () => import('./shared/pages/all-items/all-items.module').then( m => m.AllItemsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'essentials-home',
    loadChildren: () => import('./pages/essentials-home/essentials-home.module').then( m => m.EssentialsHomePageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'groceries-home',
    loadChildren: () => import('./pages/groceries-home/groceries-home.module').then( m => m.GroceriesHomePageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'search',
    loadChildren: () => import('./pages/search/search.module').then( m => m.SearchPageModule),
    canLoad: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
