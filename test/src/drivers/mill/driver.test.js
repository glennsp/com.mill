// const fs = require('fs');
const nock = require('nock');
const chai = require('chai');
// const { expect } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const mock = require('mock-require');
mock('homey', require('@milanzor/homey-mock'));
const Homey = require('homey');
//Homey.App = class Empty {};

const Mill = require('../../../../lib/mill');
const MillApp = require('../../../../app');
// const Room = require('../../../../lib/models');
const MillDriver = require('../../../../drivers/mill/driver');

chai.use(chaiAsPromised);

describe('driver', () => {
/*
  beforeEach(() => {
    this.mill = new Mill();

    this.mill.user = {
      userId: 36338
    };
    this.mill.auth = {
      refreshToken: 'f67645a282465e60',
      refreshTokenExpire: new Date(new Date().getTime() + 24 * 3600 * 1000),
      token: '2b849ad96241a144',
      tokenExpire: new Date(new Date().getTime() + 2 * 3600 * 1000)
    };
  });

  afterEach(() => {
    nock.cleanAll();
  });
  */

  it('onPairListDevices', async () => {
    nock('https://eurouter.ablecloud.cn:9005')
      .post('/zc-account/v1/login')
      .reply(404, {
        description: 'login failed, domain(810), name(username)',
        error: 'account not exist',
        errorCode: 3501
      });

    console.log(Homey.App);
//    Homey.env = {};
    Homey.app = new MillApp();
    const driver = new MillDriver('mill', []);
    driver.onPairListDevices(null, (result) => {
      console.log('>>', result);
    });
  });
});
