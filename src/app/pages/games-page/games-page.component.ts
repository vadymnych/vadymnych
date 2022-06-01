import { Component, Input, OnInit } from '@angular/core';
import { Games } from '../../shared/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-games-page',
  templateUrl: './games-page.component.html',
  styleUrls: ['./games-page.component.scss']
})
export class GamesPageComponent implements OnInit {
  @Input() title: string = 'Games';
  @Input() showBg: boolean = true;
  readonly games: Games[] = [
    {
      name: 'Minecraft',
      img: './assets/icons/games/minecraft.png',
      navigateUrl: '/gaimincraft',
      isComingSoon: false
    },
    {
      name: 'Grand Theft Auto',
      img: './assets/icons/games/grand-theft-auto.png',
      navigateUrl: '',
      isComingSoon: true
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  navigateToPage(page: string) {
    if (page != '') {
      this.router.navigateByUrl('games' + page);
    }
  }
}
