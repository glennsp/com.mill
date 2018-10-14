const nock = require('nock');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Mill = require('../../lib/mill');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('login', function () {

  before(() => {
    this.mill = new Mill();

    this.mill.user = {
      userId: 36338
    };
    this.mill.auth = {
      refreshToken: 'f67645a282465e60',
      refreshTokenExpire: '2018-11-10 07:18:16',
      token: '2b849ad96241a144',
      tokenExpire: '2018-10-11 09:18:16'
    }
  });

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


  it('should read all homes correctly', async () => {
    nock('http://eurouter.ablecloud.cn:5000')
    	.post('/millService/v1/selectHomeList')
    	.reply(200, {
        hourSystem: 1,
        homeList: [
          {
            homeAlways: 0,
            homeName: 'My house',
            isHoliday: 0,
            holidayStartTime: 0,
            timeZone: '+2:00',
            modeMinute: 0,
            modeStartTime: 0,
            holidayTemp: 10,
            modeHour: 0,
            currentMode: 0,
            holidayEndTime: 0,
            homeType: 0,
            homeId: 201801011200100000,
            programId: 201801011200100000
          }
        ]
      }
    );

    const homes = await this.mill.listHomes();
    expect(homes.error).to.not.exist;
  });

  it('should read all rooms correctly', async () => {
    const roomId = 201810061300100000;
    nock('http://eurouter.ablecloud.cn:5000')
      .post('/millService/v1/selectRoombyHome')
      .reply(200, { backMinute: 0,
        offLineDeviceNum: 0,
        mode: 0,
        homeAlways: 0,
        homeName: 'Snorresgate',
        isHoliday: 0,
        onlineDeviceNum: 2,
        programList:
        [ {
          programName: 'Standard Program',
          homeId: 201810061300100000,
          programId: 201810061300100000
        } ],
        homeType: 0,
        backHour: 0,
        roomInfo: [ {
          controlSource: '0,0,0',
          comfortTemp: 22,
          roomProgram: 'Standard Program',
          awayTemp: 10,
          avgTemp: 21,
          roomId,
          roomName: 'Livingroom',
          currentMode: 3,
          heatStatus: 0,
          offLineDeviceNum: 0,
          total: 1,
          independentCount: 0,
          sleepTemp: 17,
          onlineDeviceNum: 1,
          isOffline: 1
        } ]
      }
    );
    const rooms = await this.mill.listRooms(roomId);
    expect(rooms.error).to.not.exist;
  });

  it('should set temperature correctly', async () => {
    nock('http://eurouter.ablecloud.cn:5000')
      .post('/millService/v1/changeRoomModeTempInfo')
      .reply(200, '');

    const rooms = await this.mill.changeRoomTemperature(201810061300110000, {sleepTemp: 17, awayTemp: 10, comfortTemp: 22});
    expect(rooms.errorCode).to.not.exist;
  });

  it('should set mode correctly', async () => {
    nock('http://eurouter.ablecloud.cn:5000')
      .post('/millService/v1/changeRoomMode')
      .reply(200, '');

    const rooms = await this.mill.changeRoomMode(201810061300110000, {mode: 1});
    expect(rooms.errorCode).to.not.exist;
  });

});
