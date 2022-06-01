import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  OnDestroy,
  OnInit,
  Type,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { SidebarService } from '../../services/sidebar.service';
import { InsertionDirective } from './insertion.directive';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild(InsertionDirective) insertionPoint!: InsertionDirective;
  private readonly _onClose = new Subject<any>();
  public onClose = this._onClose.asObservable();

  private componentRef!: ComponentRef<any>;
  public childComponentType!: Type<any>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cd: ChangeDetectorRef,
    public sideBarService: SidebarService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.openNav();
    });
  }

  ngAfterViewInit() {
    this.loadChildComponent(this.childComponentType);
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  private loadChildComponent(componentType: Type<any>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    const viewContainerRef = this.insertionPoint.viewContainerRef;
    viewContainerRef.clear();
    this.componentRef = viewContainerRef.createComponent(componentFactory);
  }

  openNav() {
    this.sideBarService.isSideBarOpen.next(true);
  }

  closeNav() {
    this.sideBarService.isSideBarOpen.next(false);
    this._onClose.next('');
  }

  outsideClose(event) {
    if (event.target.className === 'sidebar sidebar__active') {
      this.closeNav();
    }
  }
}
