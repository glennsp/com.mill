const proxyquire = require('proxyquire').noCallThru();
const chai = require('chai');
const { expect } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const homey = require('./mock/homey');
const mill = require('./mock/mill');

describe('mill api', () => {
  before(() => {
    chai.use(chaiAsPromised);
    const App = proxyquire('../../app', {
      homey,
      './lib/mill': mill,
      './lib/util': { debug: () => {} }
    });
    const app = new App();
    app.onInit();
    homey.app = app;
    const api = proxyquire('../../api', {
      homey,
      './lib/mill': mill,
      './lib/util': { debug: () => {} }
    });

    this.authenticate = api.filter(a => a.path === '/authenticate')[0]; // eslint-disable-line prefer-destructuring
    this.clearSettings = api.filter(a => a.path === '/clearSettings')[0]; // eslint-disable-line prefer-destructuring
    this.clearLog = api.filter(a => a.path === '/clearLog')[0]; // eslint-disable-line prefer-destructuring
  });

  it('should authenticate', async () => {
    const args = { body: { username: 'username', password: 'password' } };
    return this.authenticate.fn(args, (err, res) => {
      // eslint-disable-next-line no-unused-expressions
      expect(err).to.be.null;
      // eslint-disable-next-line no-unused-expressions
      expect(res).to.be.true;
    });
  });

  it('should clear settings', async () => this.clearSettings.fn(null, (err, res) => {
    // eslint-disable-next-line no-unused-expressions
    expect(err).to.be.null;
    // eslint-disable-next-line no-unused-expressions
    expect(res).to.exist;
  }));

  it('should clear logs', async () => this.clearLog.fn(null, (err, res) => {
    // eslint-disable-next-line no-unused-expressions
    expect(err).to.be.null;
    // eslint-disable-next-line no-unused-expressions
    expect(res).to.exist;
  }));
});
