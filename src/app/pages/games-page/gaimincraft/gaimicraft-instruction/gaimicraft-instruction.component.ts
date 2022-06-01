import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { GamesService } from '../../../../shared/services/games.service';
import { environment } from '../../../../../environments/environment';
import { COPY_TYPE } from '../../../../shared/interfaces';

@Component({
  selector: 'app-gaimicraft-instruction',
  templateUrl: './gaimicraft-instruction.component.html',
  styleUrls: ['./gaimicraft-instruction.component.scss']
})
export class GaimicraftInstructionComponent implements OnInit, OnDestroy {
  serverData = {
    domain: environment.minecraftDomain,
    uniqueLink: '/login '
  };

  readonly getUserGaiminCraftTime: number = 20000; // 20 sec
  getTokenTimer;

  constructor(
    private clipboardService: ClipboardService,
    private toastrService: ToastrService,
    private gamesService: GamesService
  ) {}

  public get copyType(): typeof COPY_TYPE {
    return COPY_TYPE;
  }

  ngOnInit(): void {
    this.getUserGaiminCraft();
  }

  getUserGaiminCraft() {
    this.serverData.uniqueLink = '/login ';
    this.gamesService.getUserGaiminCraftToken().subscribe((response) => {
      this.serverData.uniqueLink += response.data.token;
    });
    this.getTokenTimer = setTimeout(() => {
      this.getUserGaiminCraft();
    }, this.getUserGaiminCraftTime);
  }

  onCopy(copyType: COPY_TYPE, copyText: string) {
    let copyMessage: string = '';
    switch (copyType) {
      case COPY_TYPE.LOGIN_TOKEN:
        copyMessage = `The unique login link was copied.`;
        break;
      case COPY_TYPE.SERVER_ADDRESS:
        copyMessage = `The server address "${copyText}" was copied.`;
        break;
      default:
        copyMessage = `${copyText} was copied`;
    }
    this.clipboardService.copy(copyText);
    this.toastrService.success(copyMessage);
  }

  ngOnDestroy(): void {
    clearTimeout(this.getTokenTimer);
  }
}
