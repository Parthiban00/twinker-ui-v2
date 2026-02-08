import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StorageService } from './services/storage.service';
import { FilterPopoverComponent } from './shared/popover/filter-popover/filter-popover.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, FilterPopoverComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, IonicModule, FormsModule],
  exports: [],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, StorageService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
