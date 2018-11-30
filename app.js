// eslint-disable-next-line import/no-unresolved
const Homey = require('homey');
const { Log } = require('homey-log');
const Mill = require('./lib/mill');
const { debug } = require('./lib/util');

class MillApp extends Homey.App {
  onInit() {
    this.millApi = new Mill();
    this.user = null;
    this.isAuthenticated = false;
    this.isAuthenticating = false;

    debug(`${Homey.manifest.id} is running..`);
  }

  async connectToMill() {
    const username = Homey.ManagerSettings.get('username');
    const password = Homey.ManagerSettings.get('password');

    return this.authenticate(username, password);
  }

  async authenticate(username, password) {
    if (username && password && !this.isAuthenticating) {
      try {
        this.isAuthenticating = true;
        this.user = await this.millApi.login(username, password) || null;
        this.isAuthenticated = true;
        debug('Mill authenticated');
        return true;
      } finally {
        this.isAuthenticating = false;
      }
    }
    return false;
  }

  clear() {
    this.user = null;
  }

  isConnected() {
    return this.isAuthenticated;
  }

  getUser() {
    return this.user;
  }

  getMillApi() {
    return this.millApi;
  }
}

module.exports = MillApp;
