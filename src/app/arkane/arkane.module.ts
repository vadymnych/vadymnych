import { NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { ArkaneRoutingModule } from './arkane-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ArkaneComponent } from './arkane.component';
import { ActivityComponent } from './activity/activity.component';
import { TokensComponent } from './tokens/tokens.component';
import { NftsComponent } from './nfts/nfts.component';
import { WalletComponent } from './wallet/wallet.component';
import { UpdatedTimeComponent } from './updated-time/updated-time.component';
import { NftItemComponent } from './nfts/nft-item/nft-item.component';
import { ArkaneInterceptor } from './arkane.interceptor';

@NgModule({
  declarations: [
    ArkaneComponent,
    ActivityComponent,
    TokensComponent,
    NftsComponent,
    WalletComponent,
    UpdatedTimeComponent,
    NftItemComponent
  ],
  imports: [CommonModule, ArkaneRoutingModule, SharedModule, NgxPaginationModule],

  providers: [{ provide: HTTP_INTERCEPTORS, useClass: ArkaneInterceptor, multi: true }]
})
export class ArkaneModule {}
