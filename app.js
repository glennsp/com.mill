// eslint-disable-next-line import/no-unresolved
const Homey = require('homey');
const Sentry = require('@sentry/node');
const Mill = require('./lib/mill');

class MillApp extends Homey.App {
  onInit() {
    Sentry.init({ dsn: 'https://3474e68f802c435db291e7c489a7f0ea@sentry.io/1321923' });

    this.millApi = new Mill();
    this.user = null;
    this.isAuthenticated = false;
    const username = Homey.ManagerSettings.get('username');
    const password = Homey.ManagerSettings.get('password');

    if (username && password) {
      this.authenticate(username, password)
        .catch((e) => {
          this.log('error while authenticating', e);
        });
    }

    this.log(`${Homey.manifest.id} is running..`);
  }

  async authenticate(username, password) {
    this.user = await this.millApi.login(username, password) || null;
    this.isAuthenticated = true;
    // this.user = await this.mill.login('glenn.pedersen@gmail.com', 'picTe7-cikhip-dobdim');
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
