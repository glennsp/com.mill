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
    const username = Homey.ManagerSettings.get('username');
    const password = Homey.ManagerSettings.get('password');

    if (username && password) {
      this.authenticate(username, password)
        .catch((e) => {
          error(`error while authenticating: ${e}`);
        });
    }

    debug(`${Homey.manifest.id} is running..`);
  }

  async authenticate(username, password) {
    this.user = await this.millApi.login(username, password) || null;
    this.isAuthenticated = true;
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
