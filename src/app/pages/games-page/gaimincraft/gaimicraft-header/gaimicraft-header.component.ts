import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-gaimicraft-header',
  templateUrl: './gaimicraft-header.component.html',
  styleUrls: ['./gaimicraft-header.component.scss']
})
export class GaimicraftHeaderComponent implements OnInit, OnDestroy {
  constructor(@Inject(DOCUMENT) private document: Document, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'gaimincraft-bg');
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'gaimincraft-bg');
  }
}
