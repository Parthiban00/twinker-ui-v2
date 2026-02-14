import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StorageService } from './services/storage.service';
import { AuthInterceptor } from './services/auth.interceptor';
import { FilterPopoverComponent } from './shared/popover/filter-popover/filter-popover.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, FilterPopoverComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, IonicModule, FormsModule, HttpClientModule],
  exports: [],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    StorageService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
