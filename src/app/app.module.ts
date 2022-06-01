import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { PlatformComponent } from './layout/platform/platform.component';
import { MainMenuComponent } from './layout/platform/main-menu/main-menu.component';
import { PlatformHeaderComponent } from './layout/platform/platform-header/platform-header.component';
import { LeftBarComponent } from './layout/platform/left-bar/left-bar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from './shared/shared.module';
import { NepPageComponent } from './pages/nep-page/nep-page.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { CartItemComponent } from './pages/cart-page/cart-item/cart-item.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { GamesPageComponent } from './pages/games-page/games-page.component';
import { BenchmarkingPageComponent } from './pages/benchmarking-page/benchmarking-page.component';
import { ErrorInterceptor } from './interceptor/error.interceptor';
import { MarketModule } from './pages/market-page/market.module';
import { LoaderInterceptor } from './interceptor/loader.interceptor';
import { GaimincraftComponent } from './pages/games-page/gaimincraft/gaimincraft.component';
import { GaimicraftHeaderComponent } from './pages/games-page/gaimincraft/gaimicraft-header/gaimicraft-header.component';
import { GaimicraftInstructionComponent } from './pages/games-page/gaimincraft/gaimicraft-instruction/gaimicraft-instruction.component';
import { PlatformFooterComponent } from './layout/platform/platform-footer/platform-footer.component';
import { BenchmarkingItemComponent } from './pages/benchmarking-page/benchmarking-list/benchmarking-item/benchmarking-item.component';
import { BenchmarkingListComponent } from './pages/benchmarking-page/benchmarking-list/benchmarking-list.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

@NgModule({
  declarations: [
    AppComponent,
    LeftBarComponent,
    MainMenuComponent,
    NepPageComponent,
    CartPageComponent,
    CartItemComponent,
    PlatformComponent,
    PlatformHeaderComponent,
    ProfilePageComponent,
    DashboardPageComponent,
    GamesPageComponent,
    BenchmarkingPageComponent,
    GaimincraftComponent,
    GaimicraftHeaderComponent,
    GaimicraftInstructionComponent,
    PlatformFooterComponent,
    BenchmarkingItemComponent,
    BenchmarkingListComponent,
    HomePageComponent
  ],
  imports: [
    A11yModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ClipboardModule,
    FormsModule,
    HttpClientModule,
    NgSelectModule,
    ReactiveFormsModule,
    SharedModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      closeButton: true,
      timeOut: 5000,
      preventDuplicates: true
    }),
    NgxSmartModalModule.forRoot(),
    MarketModule
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
