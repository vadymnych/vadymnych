import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as Sentry from '@sentry/angular';
import { ElectronService } from "./app/shared/services/electron.service";


const electronService = new ElectronService();
if ( electronService.ipcRenderer != null ) {
  Sentry.setExtra( 'deviceToken', electronService.ipcRenderer.sendSync( 'get-device-token' ) );
}
Sentry.setExtra( 'platform', 'angular' );

if ( environment.type === 'prod' ) {
  enableProdMode();
  Sentry.init( { dsn: 'https://a47c489e61f4459cb1339e4de2f2d007@o455103.ingest.sentry.io/5446173' } );
} else if ( environment.type === 'qa' ) {
  Sentry.init( { dsn: 'https://e65b02a4a4f74ac9a6fc0642a23382b8@o357378.ingest.sentry.io/5443690' } );
}

platformBrowserDynamic().bootstrapModule( AppModule )
  .catch( err => console.error( err ) );
