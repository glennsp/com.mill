const proxyquire = require('proxyquire').noCallThru();
const chai = require('chai');
const { expect } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const homey = require('./mock/homey');
const mill = require('./mock/mill');

describe('com.mill app', () => {
  before(() => {
    chai.use(chaiAsPromised);
    const App = proxyquire('../../app', {
      homey,
      './lib/mill': mill,
      './lib/util': { debug: () => {} }
    });
    this.app = new App();
  });

  beforeEach(() => {
    this.app.onInit();
  });

  describe('authenticate', () => {
    it('should authenticate with settings', async () => {
      const result = await this.app.connectToMill();
      expect(result).to.be.true; // eslint-disable-line no-unused-expressions
      expect(this.app.isConnected()).to.be.true; // eslint-disable-line no-unused-expressions
      expect(this.app.isAuthenticating).to.be.false; // eslint-disable-line no-unused-expressions
      expect(this.app.getUser()).to.exist; // eslint-disable-line no-unused-expressions
    });

    it('should authenticate with username/password', async () => {
      const result = await this.app.authenticate('username', 'password');
      expect(result).to.be.true; // eslint-disable-line no-unused-expressions
      expect(this.app.isConnected()).to.be.true; // eslint-disable-line no-unused-expressions
      expect(this.app.isAuthenticating).to.be.false; // eslint-disable-line no-unused-expressions
      expect(this.app.getUser()).to.exist; // eslint-disable-line no-unused-expressions
    });
  });
});
