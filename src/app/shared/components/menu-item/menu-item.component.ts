import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MenuItemInterface } from '../../interfaces';
import { ModalService } from '../../services/modal.service';
import { MenuService } from '../../services/menu.service';
import { HelpModalComponent } from '../modals/help-modal/help-modal.component';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent {
  @Input() item: MenuItemInterface;
  @Output() collapseStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private modalService: ModalService, public menuService: MenuService) {}

  navigateTo() {
    // this is temp "if" because we dont have support page
    if (this.item.text !== 'Support') {
      return this.item.url;
    }
  }

  openSupportModal() {
    // this is temp "if" because we dont have support page
    if (this.item.text === 'Support') {
      this.modalService.create('helpModalComponent', HelpModalComponent).open();
    }
  }
}
