const fetch = require('node-fetch');
const crypto = require('crypto');

class Mill {

  constructor() {
    this.authEndpoint = 'https://eurouter.ablecloud.cn:9005/zc-account/v1/login';
    //this.authEndpoint = 'https://postman-echo.com/post';
    this.endpoint = 'http://eurouter.ablecloud.cn:5000/millService/v1';
    //this.endpoint = 'https://postman-echo.com/post';
    this.user = null;
    this.auth = null;
    this.nonce = 'AQcDfGrE34DfGdsV';
    this.timeZoneNum = '+02:00';
  }

  async login(username, password) {

    const body = JSON.stringify({
      account: username,
      password: password
    });

    const headers = {
      'Content-Type': 'application/x-zc-object',
      'Connection': 'Keep-Alive',
      'X-Zc-Major-Domain': 'seanywell',
      'X-Zc-Msg-Name': 'millService',
      'X-Zc-Sub-Domain': 'milltype',
      'X-Zc-Seq-Id': 1,
      'X-Zc-Version': 1
    };

    const result = await fetch(this.authEndpoint, { method: 'POST', body, headers});
    const json = await result.json();

    if(json.error) {
      throw new Error(json.error);
    } else {
      this.user = json;
      this.auth = {
        token: json.token,
        tokenExpire: json.tokenExpire,
        refreshToken: json.refreshToken,
        tokenExpire: json.tokenExpire
      }
      return json;
    }
  }

  async request(command, body) {
    const bodyStr = JSON.stringify(body||{});
    const bodyLen = bodyStr.length;
    const timeout = 300;
    const timestamp = (new Date().getTime() / 1000).toFixed();
    const signature = timeout + timestamp + this.nonce + this.auth.token;
    const shaSignature = crypto.createHash('sha1').update(signature).digest('hex');

    const headers = {
      'Content-Type': 'application/x-zc-object',
      'Connection': 'Keep-Alive',
      'X-Zc-Major-Domain': 'seanywell',
      'X-Zc-Msg-Name': 'millService',
      'X-Zc-Sub-Domain': 'milltype',
      'X-Zc-Seq-Id': 1,
      'X-Zc-Version': 1,
      'X-Zc-Timestamp': timestamp,
      'X-Zc-Timeout': timeout,
      'X-Zc-Nonce': this.nonce,
      'X-Zc-User-Id': this.user.userId,
      'X-Zc-User-Signature': shaSignature,
      'X-Zc-Content-Length': bodyLen
    };

    const endpoint = `${this.endpoint}/${command}`;
    const result = await fetch(endpoint, { method: 'POST', body: bodyStr, headers});
    const text = await result.text();
    if(text.length>0) {
      const json = JSON.parse(text);
      if(json.error) {
        throw new Error(json.error);
      } else {
        return json;
      }
    } else {
      return {};
    }
  }

  // returns a list of homes
  async listHomes() {
    return this.request('selectHomeList');
  }

  // returns a list of rooms in a house
  async listRooms(homeId) {
    return this.request('selectRoombyHome', { homeId, timeZoneNum: this.timeZoneNum });
  }

  // returns a list of devices in a room
  async listDevices(roomId) {
    return this.request('selectDevicebyRoom', { roomId, timeZoneNum: this.timeZoneNum });
  }

  async changeRoomTemperature(roomId, tempSettings) {
    const body = {
      roomId,
      comfortTemp: tempSettings.comfortTemp,
      sleepTemp: tempSettings.sleepTemp,
      awayTemp: tempSettings.awayTemp,
      homeType:0
    };
    console.log('changeRoomModeTempInfo', body);
    return this.request('changeRoomModeTempInfo', body);
  }

  async changeRoomMode(roomId, mode) {
    const body = {
      mode,
      roomId,
      timeZoneNum: this.timeZoneNum,
      hour: 0,
      minute: 0,
      always: 1
    };
    console.log('changeRoomMode', body);
    return this.request('changeRoomMode', body);
  }

}

module.exports = Mill;
