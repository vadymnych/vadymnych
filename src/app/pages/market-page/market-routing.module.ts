import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketPageComponent } from './market-page.component';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './products/product/product.component';

const routes: Routes = [
  {
    path: '',
    component: MarketPageComponent,
    pathMatch: 'prefix',
    children: [
      { path: '', pathMatch: 'prefix', component: ProductsComponent },
      { path: 'product/:id', component: ProductComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketRoutingModule {}
