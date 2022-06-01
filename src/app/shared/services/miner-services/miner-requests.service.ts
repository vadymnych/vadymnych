import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Response, StartMiningRequest, StartMiningResponse, StartMiningEventResponse } from '../../interfaces';
import { DeviceService } from '../device.service';
import { HeadersService } from '../headers.service';

@Injectable({ providedIn: 'root' })
export class MinerRequestsService {
  miningEventsData = {
    CPU: {
      miningEventId: 0
    },
    GPU: {
      miningEventId: 0
    }
  };

  private readonly deviceToken: string;

  constructor(private http: HttpClient, private deviceService: DeviceService, private headersService: HeadersService) {
    this.deviceToken = this.deviceService.getDeviceToken();
  }

  sendStartMiningRequest(mode: string): Observable<Response<StartMiningResponse>> {
    const data: StartMiningRequest = { miningMode: mode };

    return this.http.post<Response<StartMiningResponse>>(`${environment.gaiminApi}/devices/me/start-mining`, data, {
      headers: this.headersService.headersDevice()
    });
  }

  sendStartMiningEvent(miningMode: string) {
    if (this.miningEventsData[miningMode].miningEventId === 0) {
      this.requestStartMiningEvent(miningMode);
    } else {
      this.sendStopMiningEvent(miningMode)?.subscribe(
        (response) => {
          if (response.success) {
            console.log(
              'The mining event stop with id',
              this.miningEventsData[miningMode].miningEventId,
              'and response',
              response
            );
            this.miningEventsData[miningMode].miningEventId = 0;
            this.requestStartMiningEvent(miningMode);
          }
        },
        (error) => {
          console.log(this.miningEventsData[miningMode].miningEventId, 'In error');
          console.log('Error in stop mining event', error);
        }
      );
    }
  }

  private requestStartMiningEvent(miningMode: string) {
    this.http
      .post<Response<StartMiningEventResponse>>(
        `${environment.gaiminApi}/devices/me/mining-event-start?miningEventTypeDto=${miningMode}`,
        {},
        {
          headers: this.headersService.headersDevice()
        }
      )?.subscribe(
      (response) => {
        this.miningEventsData[miningMode].miningEventId = response.data.id;
        console.log('Start mining-event with id', this.miningEventsData[miningMode].miningEventId);
      },
      (error) => {
        console.log('Error in start mining event', error);
      }
    );
  }

  sendStopMiningEvent(miningMode: string) {
    if (this.miningEventsData[miningMode].miningEventId === 0) return;
    return this.http.post<Response<any>>(
      `${environment.gaiminApi}/devices/me/mining-event-stop?miningEventId=${this.miningEventsData[miningMode].miningEventId}`,
      {},
      {
        headers: this.headersService.headersDevice()
      }
    );
  }
}
