import { app } from 'electron';
import * as fs from 'fs';
import { getEnvironment } from '../tools/environment';
import { interval } from 'rxjs';
import { Environment, GaiminSettings, LOG_TYPE } from '../tools/interfaces';
import { logIntoConsole } from '../tools/logger';

export class GaiminSettingsHelper {
  private readonly settingsFileName: string;
  private settingFileDirectory: string = app.getPath('appData') + '/gaimin';
  private readonly settingsFilePath: string;

  private gaiminSettings: GaiminSettings;

  constructor() {
    switch (getEnvironment()) {
      case Environment.LOCAL:
        this.settingsFileName = 'settings_qa.json';
        break;
      case Environment.QA:
        this.settingsFileName = 'settings_qa.json';
        break;
      case Environment.PROD:
        this.settingsFileName = 'settings.json';
        break;
      default: {
        console.error('Cannot define settings file name by environment!');
        break;
      }
    }
    this.settingsFilePath =
      this.settingFileDirectory + '/' + this.settingsFileName;
    console.log('Settings: ' + JSON.stringify(this.get()));
  }

  autoSaveSettingsPeriodically(
    settings: GaiminSettings,
    intervalMillis: number
  ): void {
    interval(intervalMillis).subscribe((i) => {
      console.log('Autosaving settings file');
      logIntoConsole(
        LOG_TYPE.INFO,
        `Autosaving settings file ${JSON.stringify(settings)}`
      );
      this.save(settings);
    });
  }

  get(): GaiminSettings {
    if (fs.existsSync(this.settingFileDirectory)) {
      console.log(this.settingFileDirectory + ' directory already exists');
    } else {
      console.log('Creating directory: ' + this.settingFileDirectory);
      fs.mkdirSync(this.settingFileDirectory);
    }

    if (fs.existsSync(this.settingsFilePath)) {
      console.log(this.settingsFilePath + ' file already exists');
      try {
        this.gaiminSettings = JSON.parse(
          fs.readFileSync(this.settingsFilePath, 'utf8')
        );
      } catch (e) {
        this.gaiminSettings = {} as GaiminSettings;
      }
    } else {
      console.log('Creating file: ' + this.settingsFilePath);
      fs.openSync(this.settingsFilePath, 'w');
      this.gaiminSettings = {} as GaiminSettings;
    }

    return this.gaiminSettings;
  }

  save(settings: GaiminSettings | object): void {
    fs.writeFileSync(this.settingsFilePath, JSON.stringify(settings));
  }
}
