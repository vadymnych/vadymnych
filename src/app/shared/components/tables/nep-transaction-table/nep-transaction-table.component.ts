import { Component, OnInit } from '@angular/core';
import { NepService } from '../../../services/nep.service';
import { NepHistory } from '../../../interfaces';

@Component({
  selector: 'app-nep-transaction-table',
  templateUrl: './nep-transaction-table.component.html',
  styleUrls: ['./nep-transaction-table.component.scss']
})
export class NepTransactionTableComponent implements OnInit {
  rewards: NepHistory[];

  constructor(private nepService: NepService) {}

  ngOnInit() {
    this.nepService.nepHistoryObserver.subscribe((rewards) =>
      (this.rewards = rewards).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );

    this.nepService.getNepHistory();
  }
}
