import { Component } from '@angular/core';
import { ArkaneService } from '../arkane.service';

@Component({
  selector: 'app-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.scss']
})
export class TokensComponent {
  constructor(public arkaneService: ArkaneService) {}
}
