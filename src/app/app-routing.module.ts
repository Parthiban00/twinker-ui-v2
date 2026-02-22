import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'startup',
    pathMatch: 'full'
  },
  {
    path: 'startup',
    loadChildren: () => import('./pages/startup/startup.module').then( m => m.StartupPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'otp-verification',
    loadChildren: () => import('./pages/otp-verification/otp-verification.module').then( m => m.OtpVerificationPageModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'service-not-available',
    loadChildren: () => import('./pages/service-not-available/service-not-available.module').then( m => m.ServiceNotAvailablePageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'location-setup',
    loadChildren: () => import('./pages/location-setup/location-setup.module').then( m => m.LocationSetupPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'home-main',
    loadChildren: () => import('./pages/home-main/home-main.module').then( m => m.HomeMainPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then( m => m.PaymentPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'shared/location-setup',
    loadChildren: () => import('./shared/location-setup/location-setup.module').then( m => m.LocationSetupPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'home-land',
    loadChildren: () => import('./pages/home-land/home-land.module').then( m => m.HomeLandPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'items',
    loadChildren: () => import('./pages/items/items.module').then( m => m.ItemsPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    loadChildren: () => import('./pages/orders/orders.module').then( m => m.OrdersPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'all-items',
    loadChildren: () => import('./shared/pages/all-items/all-items.module').then( m => m.AllItemsPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'essentials-home',
    loadChildren: () => import('./pages/essentials-home/essentials-home.module').then( m => m.EssentialsHomePageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'groceries-home',
    loadChildren: () => import('./pages/groceries-home/groceries-home.module').then( m => m.GroceriesHomePageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'popular-items',
    loadChildren: () => import('./pages/popular-items/popular-items.module').then( m => m.PopularItemsPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'popular-vendors',
    loadChildren: () => import('./pages/popular-vendors/popular-vendors.module').then( m => m.PopularVendorsPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'search',
    loadChildren: () => import('./pages/search/search.module').then( m => m.SearchPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'order-detail',
    loadChildren: () => import('./pages/order-detail-view/order-detail-view.module').then( m => m.OrderDetailViewPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'order-tracking',
    loadChildren: () => import('./pages/order-tracking/order-tracking.module').then( m => m.OrderTrackingPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'vendor-orders',
    loadChildren: () => import('./pages/vendor-orders/vendor-orders.module').then( m => m.VendorOrdersPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  {
    path: 'delivery-orders',
    loadChildren: () => import('./pages/delivery-orders/delivery-orders.module').then( m => m.DeliveryOrdersPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

