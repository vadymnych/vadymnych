import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { MarketRoutingModule } from './market-routing.module';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './products/product/product.component';
import { SharedModule } from '../../shared/shared.module';
import { MarketPageComponent } from './market-page.component';

@NgModule({
  declarations: [MarketPageComponent, ProductsComponent, ProductComponent],
  imports: [CommonModule, MarketRoutingModule, SharedModule, NgxPaginationModule],
  exports: [ProductsComponent, ProductComponent, MarketPageComponent]
})
export class MarketModule {}
