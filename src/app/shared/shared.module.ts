import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItemComponent } from './components/menu-item/menu-item.component';
import { RouterModule } from '@angular/router';
import { IconComponent } from './components/icon/icon.component';
import { SocialsComponent } from './components/socials/socials.component';
import { ButtonComponent } from './components/button/button.component';
import { EditAvatarModalComponent } from './components/modals/edit-avatar-modal/edit-avatar-modal.component';
import { EditProfileModalComponent } from './components/modals/edit-profile-modal/edit-profile-modal.component';
import { LoginModalComponent } from './components/modals/login-modal/login-modal.component';
import { LogoutModalComponent } from './components/modals/logout-modal/logout-modal.component';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NepTableComponent } from './components/tables/nep-table/nep-table.component';
import { AccordionComponent } from './components/accordion/accordion.component';
import { DevicesTableComponent } from './components/tables/devices-table/devices-table.component';
import { TransactionsTableComponent } from './components/tables/transactions-table/transactions-table.component';
import { WithdrawComponent } from './components/withdraw/withdraw.component';
import { WithdrawModalComponent } from './components/modals/withdraw-modal/withdraw-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NftComponent } from './components/nft/nft.component';
import { HttpClientModule } from '@angular/common/http';
import { HeaderBalancesComponent } from './components/header-balances/header-balances.component';
import { ProfileComponent } from './components/profile/profile.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';
import { NftItemComponent } from './components/nft-item/nft-item.component';
import { NftModalComponent } from './components/modals/nft-modal/nft-modal.component';
import { ErrorModalComponent } from './components/modals/error-modal/error-modal.component';
import { HelpModalComponent } from './components/modals/help-modal/help-modal.component';
import { NepTransactionTableComponent } from './components/tables/nep-transaction-table/nep-transaction-table.component';
import { ConfirmModalComponent } from './components/modals/confirm-modal/confirm-modal.component';
import { UnlinkedDeviceModalComponent } from './components/modals/unlinked-device-modal/unlinked-device-modal.component';
import { TransferNftModalComponent } from './components/modals/transfer-nft-modal/transfer-nft-modal.component';
import { SendFundsModalComponent } from './components/modals/send-funds-modal/send-funds-modal.component';
import { LoaderComponent } from './components/loader/loader.component';

import { CancelWithdrawComponent } from './components/cancel-withdraw/cancel-withdraw.component';
import { CancelWithdrawModalComponent } from './components/modals/cancel-withdraw-modal/cancel-withdraw-modal.component';
import { UpdateModalComponent } from './components/modals/update-modal/update-modal.component';
import { CriticalUpdateModalComponent } from './components/modals/critical-update-modal/critical-update-modal.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { InsertionDirective } from './components/sidebar/insertion.directive';
import { MiningSidebarComponent } from './components/sidebars/mining-sidebar/mining-sidebar.component';
import { MiningItemComponent } from './components/sidebars/mining-sidebar/mining-item/mining-item.component';
import { NotificationsComponent } from './components/sidebars/notifications/notifications.component';
import { UpdateNotificationComponent } from './components/sidebars/notifications/update-notification/update-notification.component';
import { MiningToggleSwitcherComponent } from './components/mining-toggle-switcher/mining-toggle-switcher.component';
import { CartSidebarComponent } from './components/sidebars/cart-sidebar/cart-sidebar.component';
import { CartItemSidebarComponent } from './components/sidebars/cart-sidebar/cart-item-sidebar/cart-item-sidebar.component';
import { BenchmarkingSpinnerComponent } from './components/benchmarking-spinner/benchmarking-spinner.component';
import { ProductRecommendationComponent } from './components/product-recommendation/product-recommendation.component';
import { NewsComponent } from './components/news/news.component';
import { LabelComponent } from './components/label/label.component';

@NgModule({
  declarations: [
    MenuItemComponent,
    IconComponent,
    SocialsComponent,
    ButtonComponent,
    EditAvatarModalComponent,
    EditProfileModalComponent,
    LoginModalComponent,
    LogoutModalComponent,
    StatusBarComponent,
    ProgressBarComponent,
    NepTableComponent,
    AccordionComponent,
    DevicesTableComponent,
    TransactionsTableComponent,
    WithdrawComponent,
    WithdrawModalComponent,
    NftComponent,
    HeaderBalancesComponent,
    ProfileComponent,
    NftItemComponent,
    OrderSummaryComponent,
    NftModalComponent,
    ErrorModalComponent,
    HelpModalComponent,
    TransferNftModalComponent,
    SendFundsModalComponent,
    NepTransactionTableComponent,
    ConfirmModalComponent,
    LoaderComponent,
    CancelWithdrawComponent,
    CancelWithdrawModalComponent,
    UpdateModalComponent,
    CriticalUpdateModalComponent,
    UnlinkedDeviceModalComponent,
    SidebarComponent,
    InsertionDirective,
    MiningSidebarComponent,
    MiningItemComponent,
    NotificationsComponent,
    UpdateNotificationComponent,
    MiningToggleSwitcherComponent,
    CartSidebarComponent,
    CartItemSidebarComponent,
    BenchmarkingSpinnerComponent,
    ProductRecommendationComponent,
    NewsComponent,
    LabelComponent
  ],
  imports: [CommonModule, RouterModule, ClipboardModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  exports: [
    MenuItemComponent,
    IconComponent,
    SocialsComponent,
    ButtonComponent,
    StatusBarComponent,
    ProgressBarComponent,
    NepTableComponent,
    AccordionComponent,
    DevicesTableComponent,
    TransactionsTableComponent,
    WithdrawComponent,
    FormsModule,
    ReactiveFormsModule,
    NftComponent,
    HeaderBalancesComponent,
    ProfileComponent,
    NepTransactionTableComponent,
    LoaderComponent,
    CancelWithdrawComponent,
    MiningToggleSwitcherComponent,
    BenchmarkingSpinnerComponent,
    CartItemSidebarComponent,
    ProductRecommendationComponent,
    NewsComponent,
    LabelComponent,
    OrderSummaryComponent
  ],
  providers: []
})
export class SharedModule {}
