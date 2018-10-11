'use strict'

const Homey = require('homey');
const Mill = require('../../lib/mill');

class MillDriver extends Homey.Driver {

    async onInit() {
      this.log('onInit()');
    }

    async onPairListDevices(data, callback) {
      this.log('onPairListDevices()');

      console.log(`Looking up devices for ${this.user.email}`);
      const homes = await this.mill.listHomes();
      //console.log(homes);
      //console.log(`Home: ${homes.homeList[0].homeName}`);
      const rooms = await this.mill.listRooms(homes.homeList[0].homeId);
      const devices = rooms.roomInfo.map(room => (
        {
          name: room.roomName,
          data: {
            id: room.roomId,
            name: room.roomName,
            temp: room.avgTemp,
            alive: room.isOffline===1
          },
          state: {
            measure_temperature: room.avgTemp,
            target_temperature: room.comfortTemp,
            thermostat_mode: room.currentMode,
            heating: room.heatStatus===1,
          }
          // Optional properties, these overwrite those specified in app.json:
          // "icon": "/path/to/another/icon.svg",
          // "capabilities": [ "onoff", "dim" ],
          // "capabilitiesOptions: { "onoff": {} },
          // "mobile": {},
          // Optional properties, device-specific:
          // "store": { "foo": "bar" },
          // "settings": {},
        }
      ));
    callback( null, devices );
  }

}

module.exports = MillDriver;
