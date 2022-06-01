import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlatformComponent } from './layout/platform/platform.component';

// Guards
import { AuthGuard } from './shared/guards/auth.guard';

// Pages
import { NepPageComponent } from './pages/nep-page/nep-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { GamesPageComponent } from './pages/games-page/games-page.component';
import { BenchmarkingPageComponent } from './pages/benchmarking-page/benchmarking-page.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { GaimincraftComponent } from './pages/games-page/gaimincraft/gaimincraft.component';
import { HomePageComponent } from "./pages/home-page/home-page.component";

const routes: Routes = [
  {
    path: '',
    component: PlatformComponent,
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      {
        path: 'games',
        canActivate: [AuthGuard],
        component: GamesPageComponent,
      },
      {
        path: 'home',
        component: HomePageComponent,
      },
      {
        path: 'games/gaimincraft',
        canActivate: [AuthGuard],
        component: GaimincraftComponent
      },
      {
        path: 'market',
        loadChildren: () => import('./pages/market-page/market.module').then((m) => m.MarketModule)
      },
      {
        path: 'dashboard',
        component: DashboardPageComponent
      },
      {
        path: 'wallet',
        canActivate: [AuthGuard],
        loadChildren: () => import('./arkane/arkane.module').then((m) => m.ArkaneModule)
      },
      {
        path: 'nep',
        canActivate: [AuthGuard],
        component: NepPageComponent
      },
      {
        path: 'benchmarking',
        component: BenchmarkingPageComponent
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        component: ProfilePageComponent
      },
      {
        path: 'cart',
        canActivate: [AuthGuard],
        component: CartPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
