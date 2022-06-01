import { Component, OnInit } from '@angular/core';
import { ArkaneService } from './arkane.service';

@Component({
  selector: 'app-arkane',
  templateUrl: './arkane.component.html',
  styleUrls: ['./arkane.component.scss']
})
export class ArkaneComponent implements OnInit {
  isAuthenticated;

  constructor(public arkaneService: ArkaneService) {}

  ngOnInit() {
    this.arkaneService.isLoggedIn().subscribe((isLoggedIn) => (this.isAuthenticated = isLoggedIn));
    if (this.isAuthenticated) {
      this.arkaneService.getData();
    }
  }

  onLogin() {
    this.arkaneService.login();
  }
}
