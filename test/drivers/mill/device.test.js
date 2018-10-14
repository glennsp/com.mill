const nock = require('nock');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Device = require('../../drivers/mill/device');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('device', function () {

  before(() => {
    this.device = new Device();
  });

  it('should refresh state', async () => {
  });

});
