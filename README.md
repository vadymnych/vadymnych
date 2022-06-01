# Gaimin Platform

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.1.1.

## Release Platform
### Via GitHub CI:
1. Go to our github project releases web page: https://github.com/Gaimin-io-Limited/gaimin2020/releases
2. Remember the latest release tag which starts from `gaimin-platform-v...`
3. Click `Draft a new release` button
4. Increase the latest release version form step 2 and set it as tag version.

    !!! The name must start from `gaimin-platform-v`
    
    !!! After `v` must be the version number, for example: `gaimin-platform-v1.2.3`
    
    ! Version number should consist of MAJOR.MINOR.PATCH, increment the:
      - MAJOR version when you make incompatible API changes.
      - MINOR version when you add functionality in a backwards compatible manner.
      - PATCH version when you make backwards compatible bug fixes.
5. Publish release. 

### Manually via release.sh script:
1. Install gcloud, if not installed yet (documented in `gaimin-backend readme`)

    Authorize in GCP
2. Checkout `master` branch and fetch the latest changes.
3. Execute `./release.sh`

#### Released application installer download links:
for Windows: https://console.cloud.google.com/storage/browser/platform_release_win;tab=objects?project=gaimin2020&prefix= 

for Mac: https://console.cloud.google.com/storage/browser/gaimin-platform/artifacts/gaimin-platform;tab=objects?project=gaimin2020&prefix=

## Windows installer certificate
certificate file: installer/code_certificate.p12

#### How to sign installer?
Run
```npm run dist-win```, which builds and signs the installer.

Or:

1. set environment variables:

    `WIN_CSC_LINK="path to the .p12 certificate file"`

     `WIN_CSC_KEY_PASSWORD="password"`
 
2. execute:
    `electron-builder -w`

#### How to convert .crt to .pem or to .p12?
From binary to text format:

`openssl x509 -inform DER -in code_certificate.crt -out code_certificate.pem -text`

From PEM (pem, cer, crt) to PKCS#12 (p12, pfx):

`openssl pkcs12 -export -in code_certificate.pem -inkey code_certificate_pk.pem -out code_certificate.p12`
## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Watch

Run `npm run build:watch` + `npm run electron:watch` to build and start watching the project changes.
After changes reload the app `ctrl+shift+R`.

## Create exe file

For production environment:
- Run `npm run win`

For QA environment:
- Run `npm run win-dev`
- Go to folder with installed program and run Gaimin platform.exe with --dev param 
(open cmd at folder with .exe and run `"Gaimin platform.exe" --dev`)



