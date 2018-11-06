const { expect } = require('chai');
const Room = require('../../../lib/models');

describe('room', () => {
  const roomJSON = {
    always: 0,
    backMinute: 0,
    roomProgramId: 201810061300100000,
    controlSource: '0,0,0',
    comfortTemp: 22,
    roomProgram: 'Standard Program',
    awayTemp: 10,
    holidayTemp: 0,
    avgTemp: 22.0,
    roomId: 201810061347140000,
    roomName: 'Living room',
    deviceInfo: [{
      heaterFlag: 1,
      subDomainId: 5316,
      controlType: 0,
      currentTemp: 22.0,
      canChangeTemp: 0,
      deviceId: 47914,
      deviceName: 'Livingroom',
      mac: 'F0FE6BB08D70',
      deviceStatus: 0
    }],
    backHour: 0,
    currentMode: 0,
    heatStatus: 1,
    offLineDeviceNum: 0,
    total: 1,
    independentCount: 0,
    sleepTemp: 17,
    onlineDeviceNum: 1,
    isOffline: 1,
    programMode: 1
  };

  it('should initialize with a room JSON', () => {
    const room = new Room(roomJSON);
    expect(room.roomProgramId).to.be.equal(roomJSON.roomProgramId);
    expect(room.deviceInfo).to.be.equal(roomJSON.deviceInfo);

    expect(room.modeName).to.be.equal('Comfort');

    expect(room.mode).to.be.equal(1);
  });

  describe('mode', () => {
    it('should handle currentMode and programMode', () => {
      let room = new Room({ currentMode: 0, programMode: 1 });
      expect(room.modeName).to.be.equal('Comfort');
      expect(room.mode).to.be.equal(1);

      room = new Room({ currentMode: 2, programMode: 0 });
      expect(room.modeName).to.be.equal('Sleep');
      expect(room.mode).to.be.equal(2);
    });

    it('should handle setting mode', () => {
      const room = new Room({ currentMode: 0, programMode: 1 });
      expect(room.modeName).to.be.equal('Comfort');
      expect(room.mode).to.be.equal(1);

      // force Sleep
      room.mode = 2;
      expect(room.modeName).to.be.equal('Sleep');
      expect(room.mode).to.be.equal(2);

      // back to program (Comfort)
      room.mode = 0;
      expect(room.modeName).to.be.equal('Comfort');
      expect(room.mode).to.be.equal(1);
    });

    it('should handle setting wrong mode', () => {
      const room = new Room({ currentMode: 0, programMode: 1 });
      room.mode = 20;
      expect(room.modeName).to.be.equal('Comfort');
      expect(room.mode).to.be.equal(1);
    });

    it('should handle setting mode name', () => {
      const room = new Room({ currentMode: 0, programMode: 1 });

      // force Sleep
      room.modeName = 'Sleep';
      expect(room.modeName).to.be.equal('Sleep');
      expect(room.mode).to.be.equal(2);
    });

    it('should handle setting a wrong mode name', () => {
      const room = new Room({ currentMode: 0, programMode: 1 });

      // force Sleep
      room.modeName = 'Asleep';
      expect(room.modeName).to.be.equal('Comfort');
      expect(room.mode).to.be.equal(1);
    });
  });

  describe('targetTemp', () => {
    it('should handle target temp', () => {
      const room = new Room(roomJSON);
      expect(room.targetTemp).to.be.equal(roomJSON.comfortTemp);

      room.modeName = 'Sleep';
      expect(room.targetTemp).to.be.equal(roomJSON.sleepTemp);
    });

    it('should handle setting target temp', () => {
      const room = new Room(roomJSON);
      expect(room.targetTemp).to.be.equal(roomJSON.comfortTemp);
      room.targetTemp = 19;
      expect(room.comfortTemp).to.be.equal(19);

      expect(room.sleepTemp).to.be.equal(17);
      room.modeName = 'Sleep';
      room.targetTemp = 19;
      expect(room.sleepTemp).to.be.equal(19);
    });
  });
});
