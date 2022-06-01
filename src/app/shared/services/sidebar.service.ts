import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  Type
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private dialogComponentRef!: ComponentRef<SidebarComponent>;
  isSideBarOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  public createSideBar(componentType: Type<any>) {
    this.appendDialogComponentToBody();
    this.dialogComponentRef.instance.childComponentType = componentType;
  }

  private appendDialogComponentToBody() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(SidebarComponent);
    const componentRef = componentFactory.create(this.injector);
    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
    this.dialogComponentRef = componentRef;

    this.dialogComponentRef.instance.onClose.subscribe(() => {
      this.closeSideBar();
    });
  }

  closeSideBar() {
    this.isSideBarOpen.next(false);
    setTimeout(() => {
      this.removeDialogComponentFromBody();
    }, 500);
  }

  private removeDialogComponentFromBody() {
    this.appRef.detachView(this.dialogComponentRef.hostView);
    this.dialogComponentRef.destroy();
  }
}
