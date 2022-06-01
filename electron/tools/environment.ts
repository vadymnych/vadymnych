import { Environment } from './interfaces';

export function getGaiminApi() {
  const env = getEnvironment();
  console.log('Environment: ' + env);
  const api = getGaiminApiByEnvironment(env);
  console.log('Backend API: ' + api);
  return api;
}

export function getVenlyLogin() {
  const env = getEnvironment();
  const login = getVenlyLoginByEnviroment(env);
  return login;
}

function getGaiminApiByEnvironment(environment: Environment) {
  switch (environment) {
    case Environment.LOCAL:
      return 'http://localhost:8080/api';
    case Environment.QA:
      return 'https://api.qa.gaimin.gg/api';
    case Environment.PROD:
      return 'https://api.gaimin.gg/api';
    default: {
      console.error('Cannot define Gaimin API by environment=' + environment);
      break;
    }
  }
}

function getVenlyLoginByEnviroment(environment: Environment) {
  switch (environment) {
    case Environment.LOCAL:
      return 'https://login-staging.arkane.network/auth/realms/Arkane';
    case Environment.QA:
      return 'https://login-staging.arkane.network/auth/realms/Arkane';
    case Environment.PROD:
      return 'https://login.arkane.network/auth/realms/Arkane';
    default: {
      console.error('Cannot define Gaimin API by environment=' + environment);
      break;
    }
  }
}

export function getEnvironment() {
  for (const arg of process.argv) {
    switch (arg) {
      case Environment.QA: {
        return Environment.QA;
      }
      case Environment.LOCAL: {
        return Environment.LOCAL;
      }
      default: {
        break;
      }
    }
  }
  return Environment.PROD;
}

export function isWindows() {
  return process.platform === 'win32';
}
