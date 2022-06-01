import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MenuService } from '../../../shared/services/menu.service';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss']
})
export class StatusBarComponent {
  constructor(public userService: UserService, public menuService: MenuService) {}
}
