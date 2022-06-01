import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  get isLodading(): Observable<boolean> {
    return this.loading.asObservable();
  }

  constructor() {}

  showLoader() {
    this.loading.next(true);
  }

  hideLoader() {
    this.loading.next(false);
  }
}
