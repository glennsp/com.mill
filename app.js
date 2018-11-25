// eslint-disable-next-line import/no-unresolved
const Homey = require('homey');
const Mill = require('./lib/mill');
const { debug, error } = require('./lib/util');
const { Log } = require('homey-log');

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

    if (username && password && !this.isAuthenticating) {
      try {
        this.isAuthenticating = true;
        this.user = await this.millApi.login(username, password) || null;
        this.isAuthenticated = true;
        debug('Mill authenticated');
      } finally {
        this.isAuthenticating = false;
      }
    }
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
