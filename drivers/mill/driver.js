// eslint-disable-next-line import/no-unresolved
const Homey = require('homey');

class MillDriver extends Homey.Driver {
  async onInit() {
  }

  async onPairListDevices(data, callback) {
    if (!Homey.app.isConnected()) {
      // eslint-disable-next-line no-underscore-dangle
      callback(new Error(Homey.__('pair.messages.notAuthorized')));
    } else {
      const millApi = Homey.app.getMillApi();
      const homes = await millApi.listHomes();
      const rooms = await millApi.listRooms(homes.homeList[0].homeId);
      const devices = rooms.roomInfo.map(room => (
        {
          name: room.roomName,
          data: {
            id: room.roomId,
            homeId: homes.homeList[0].homeId,
            homeName: homes.homeList[0].homeName,
            name: room.roomName,
            temp: room.avgTemp,
            alive: room.isOffline === 1
          }
        }
      ));
      callback(null, devices);
    }
  }
}

module.exports = MillDriver;
