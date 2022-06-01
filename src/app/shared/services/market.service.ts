import { HeadersService } from './headers.service';
import { WithdrawalService } from './withdrawal.service';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import {
  Response,
  MarketOffers,
  MarketOffersBuy,
  ProductInterface,
  ProductItem,
  PurchaseDataRequest,
  OffersList
} from '../interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ArkaneService } from '../../arkane/arkane.service';
import { BalanceService } from './balance.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';
import { AppVersionService } from './app-version.service';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  products: ProductInterface[];
  product;
  itemsPerPage = 15;
  totalItems: any;
  currentPage = 1;
  purchaseData: PurchaseDataRequest;
  isGaiminNFTs: boolean = false;

  public shoppingCart$: BehaviorSubject<ProductItem[]> = new BehaviorSubject<ProductItem[]>([]);

  constructor(
    private http: HttpClient,
    private toastrService: ToastrService,
    private arkaneService: ArkaneService,
    private withdrawalService: WithdrawalService,
    private balanceService: BalanceService,
    private headersService: HeadersService,
    private authService: AuthService,
    private appVersionService: AppVersionService
  ) {}

  getProduct(page) {
    return this.http
      .get<Response<MarketOffers>>(
        environment.gaiminApi +
          `/market/offers?page=${page}&size=${this.itemsPerPage}&isGaiminNFTs=${this.isGaiminNFTs}`,
        {
          headers: this.headersService.headersDevice()
        }
      )
      .subscribe((response) => {
        if (response.success) {
          this.products = response.data.offers;
          this.totalItems = response.data.pagination.totalResults;
          this.currentPage = page;
        }
      });
  }

  getRecommendationsProducts(page, itemsPerPage, isGaiminNFT) {
    return this.http.get<Response<MarketOffers>>(
      environment.gaiminApi + `/market/offers?page=${page}&size=${itemsPerPage}&isGaiminNFTs=${isGaiminNFT}`,
      {
        headers: this.headersService.headersDevice()
      }
    );
  }

  addProduct(productItem: ProductItem) {
    const product$ = this.shoppingCart$.getValue().find(({ id }) => id == productItem.id);

    if (!product$) {
      this.shoppingCart$.next([...this.shoppingCart$.getValue(), { ...productItem }]);
      this.toastrService.success(productItem.name + ' ' + 'was added');
    } else {
      const updatedShoppingCart = this.shoppingCart$
        .getValue()
        .map((item) => (item.id == product$.id ? { ...productItem } : item));
      this.shoppingCart$.next(updatedShoppingCart);
      this.toastrService.success(productItem.name + ' ' + 'is in the shopping cart.');
    }
  }

  removeProduct(id) {
    const product$ = this.shoppingCart$.getValue();
    product$.map((item, index) => {
      if (item.id === id) {
        product$.splice(index, 1);
      }
      this.shoppingCart$.next(product$);
    });
  }

  calcTotal() {
    let total = 0;
    this.shoppingCart$.subscribe((shopItems) => {
      total = shopItems.reduce((acc, product) => (acc += product.price * product.count), 0);
    });
    return total;
  }

  cartDataToArkane() {
    this.shoppingCart$.subscribe((shopItems) => {
      let offersList: OffersList[] = [];
      shopItems.forEach((item) => {
        offersList.push({ offerId: item.id, amount: item.count });
      });
      this.purchaseData = { offers: offersList, walletAddress: this.arkaneService.wallets.result[0].address };
    });
    this.http
      .post<Response<MarketOffersBuy>>(`${environment.gaiminApi}/market/offers/buy`, this.purchaseData, {
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${this.authService.getAccessToken()}`)
          .set('X-Client-Version', `platform/${this.appVersionService.getVersion()}`)
      })
      .subscribe(
        (response: any) => {
          this.balanceService.refreshPaidBalance();
          this.withdrawalService.getUserWithdrawals();
          this.getProduct(this.currentPage);
          if (response.success) {
            response.data.map((item) => {
              if (item.status == 'FAILED') {
                this.toastrService.error(`Purchase of offer ${item.id} was failed!`);
              } else {
                this.toastrService.success('We will send you an email on the completion of the purchase');
              }
            });
          }
        },
        (error) => {
          console.log('Error while buying', error);
        }
      );
    this.shoppingCart$.next([]);
  }

  productAmountAdd(productItem: ProductItem) {
    const maxAmount =
      productItem.maxBuyAmount && productItem.maxBuyAmount < productItem.amount
        ? productItem.maxBuyAmount
        : productItem.amount;
    if (productItem.count < maxAmount) {
      productItem.count++;
    }
  }

  productAmountRemove(productItem: ProductItem) {
    const minAmount = productItem.minBuyAmount ? productItem.minBuyAmount : 1;
    if (productItem.count > minAmount) {
      productItem.count--;
    }
  }
}
