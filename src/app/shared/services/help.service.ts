import { HeadersService } from './headers.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HelpRequest, Response } from '../interfaces';
import { ElectronService } from './electron.service';
import { MiningProcessService } from './miner-services/mining-process.service';
@Injectable({ providedIn: 'root' })
export class HelpService {
  constructor(
    private http: HttpClient,
    private electronService: ElectronService,
    private headersService: HeadersService,
    private miningProcessService: MiningProcessService
  ) {}

  getSystemUtilityInfo() {
    return this.electronService.ipcRenderer.sendSync('get-system-status-utility-info');
  }

  sendUserHelpRequest(helpRequest: HelpRequest, image: File) {
    console.log(
      'This is the last system status utility info during mining:',
      JSON.stringify(this.getSystemUtilityInfo())
    );
    const formData = new FormData();
    if (image) {
      formData.append('image', image, 'image');
    }

    formData.append(
      'helpRequest',
      new Blob([JSON.stringify(helpRequest)], {
        type: 'application/json'
      })
    );
    return this.http.post<Response<any>>(environment.gaiminApi + '/help', formData, {
      headers: this.headersService.headersDevice()
    });
  }
}
