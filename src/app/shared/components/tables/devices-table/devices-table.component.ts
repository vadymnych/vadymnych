import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'app-devices-table',
  templateUrl: './devices-table.component.html',
  styleUrls: ['./devices-table.component.scss']
})
export class DevicesTableComponent implements OnInit {
  constructor(public deviceService: DeviceService) {}

  ngOnInit(): void {}
}
