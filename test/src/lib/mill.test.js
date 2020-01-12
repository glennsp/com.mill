const fs = require('fs');
const nock = require('nock');
const chai = require('chai');
const { expect } = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Mill = require('../../../lib/mill');
const Room = require('../../../lib/models');

chai.use(chaiAsPromised);

describe('mill', () => {
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

  describe('login', () => {
    it('should not log in with wrong credentials', async () => {
      nock('https://eurouter.ablecloud.cn:9005')
        .post('/zc-account/v1/login')
        .reply(404, {
          description: 'login failed, domain(810), name(username)',
          error: 'account not exist',
          errorCode: 3501
        });

      await expect(this.mill.login('username', 'invalid')).to.be.rejected;
    });

    it('should log in with correct credentials', async () => {
      const username = process.env.MILL_USERNAME;
      const password = process.env.MILL_PASSWORD;

      nock('https://eurouter.ablecloud.cn:9005')
        .post('/zc-account/v1/login')
        .reply(200, {
          email: username,
          nickName: 'My house',
          phone: '',
          refreshToken: 'f67645a282465e60',
          refreshTokenExpire: '2018-11-10 07:18:16',
          token: '2b849ad96241a144',
          tokenExpire: '2018-10-11 09:18:16',
          userId: 36338,
          userProfile: { nick_name: 'House', privacyPolicy: 1 }
        });

      const user = await this.mill.login(username, password);
      expect(user).to.exist;
      expect(user.email).to.be.equal(username);
    });
  });

  describe('homes', () => {
    it('should read all homes correctly', async () => {
      nock('http://eurouter.ablecloud.cn:9005')
        .post('/millService/v1/selectHomeList')
        .reply(200, fs.readFileSync('./test/resources/homes.json'));

      const homes = await this.mill.listHomes();
      expect(homes.error).to.not.exist;
    });
  });

  describe('rooms', () => {
    it('should read all rooms correctly', async () => {
      const roomId = 201810061300100000;
      nock('http://eurouter.ablecloud.cn:9005')
        .post('/millService/v1/selectRoombyHome')
        .reply(200, fs.readFileSync('./test/resources/room.json'));
      const rooms = await this.mill.listRooms(roomId);
      expect(rooms.error).to.not.exist;
    });
  });

  describe('devices', () => {
    it('should read all devices correctly', async () => {
      const roomId = 201810061300100000;
      nock('http://eurouter.ablecloud.cn:9005')
        .post('/millService/v1/selectDevicebyRoom')
        .reply(200, fs.readFileSync('./test/resources/devices.json'));
      const room = await this.mill.listDevices(roomId);
      expect(room.error).to.not.exist;
      expect(room).to.be.an.instanceof(Room);
    });
  });

  describe('settings', () => {
    it('should set temperature correctly', async () => {
      nock('http://eurouter.ablecloud.cn:9005')
        .post('/millService/v1/changeRoomModeTempInfo')
        .reply(200, '');

      const rooms = await this.mill.changeRoomTemperature(201810061300110000, {
        sleepTemp: 17, awayTemp: 10, comfortTemp: 22
      });
      expect(rooms.errorCode).to.not.exist;
    });

    it('should set mode correctly', async () => {
      nock('http://eurouter.ablecloud.cn:9005')
        .post('/millService/v1/changeRoomMode')
        .reply(200, '');

      const rooms = await this.mill.changeRoomMode(201810061300110000, { mode: 1 });
      expect(rooms.errorCode).to.not.exist;
    });
  });
});
