import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  isMenuMinimized: boolean = false;

  constructor() {}

  toggleMenu() {
    this.isMenuMinimized = !this.isMenuMinimized;
  }

  openMenu() {
    this.isMenuMinimized = false;
  }

  closeMenu() {
    this.isMenuMinimized = true;
  }
}
