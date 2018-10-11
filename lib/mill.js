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

  async listHomes() {
    this.homes = this.request('selectHomeList');
    return this.homes;
  }

  async listRooms(homeId) {
    const body = {
      homeId,
      timeZoneNum:'+01:00'
    };
    this.rooms = this.request('selectRoombyHome', body);
    return this.rooms;
  }

  async changeRoomTemperature(roomId, tempSettings) {
    const body = {
      roomId,
      ...tempSettings,
      homeType:0
    };
    this.result = this.request('changeRoomModeTempInfo', body);
    return this.result;
  }
}

module.exports = Mill;
