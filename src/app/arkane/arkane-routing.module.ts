import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArkaneComponent } from './arkane.component';
import { NftItemComponent } from './nfts/nft-item/nft-item.component';
import { NftsComponent } from './nfts/nfts.component';
import { WalletComponent } from './wallet/wallet.component';

const routes: Routes = [
  {
    path: '',
    component: ArkaneComponent,
    pathMatch: 'fully',
    children: [
      { path: '', component: WalletComponent },
      { path: 'nfts/:id', component: NftItemComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArkaneRoutingModule {}
