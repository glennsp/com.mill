// eslint-disable-next-line import/no-unresolved
const Homey = require('homey');
const Room = require('./../../lib/models');
const logException = require('./../../lib/logger');

class MillDevice extends Homey.Device {
  onInit() {
    this.deviceId = this.getData().id;

    this.log(`${this.getName()} ${this.getClass()} (${this.deviceId}) initialized`);

    // capabilities
    this.registerCapabilityListener('target_temperature', this.onCapabilityTargetTemperature.bind(this));
    this.registerCapabilityListener('mill_mode', this.onCapabilityThermostatMode.bind(this));

    // triggers
    this.modeChangedTrigger = new Homey.FlowCardTriggerDevice('mill_mode_changed');
    this.modeChangedTrigger.register();

    this.modeChangedToTrigger = new Homey.FlowCardTriggerDevice('mill_mode_changed_to');
    this.modeChangedToTrigger
      .register()
      .registerRunListener((args, state) => args.mill_mode === state.mill_mode);

    // conditions
    this.isHeatingCondition = new Homey.FlowCardCondition('mill_is_heating');
    this.isHeatingCondition
      .register()
      .registerRunListener(() => (this.room.heatStatus === 1));

    this.isMatchingModeCondition = new Homey.FlowCardCondition('mill_mode_matching');
    this.isMatchingModeCondition
      .register()
      .registerRunListener(args => (args.mill_mode === this.room.modeName));

    // actions
    this.setProgramAction = new Homey.FlowCardAction('mill_set_mode');
    this.setProgramAction
      .register()
      .registerRunListener(args => this.setThermostatMode(args.mill_program));

    this.refreshTimeout = null;
    this.room = null;
    this.refreshState();
  }

  async refreshState() {
    this.log(`Refreshing state in ${this.getName()}`);

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }

    try {
      if (Homey.app.isConnected()) {
        const millApi = Homey.app.getMillApi();

        const room = await millApi.listDevices(this.getData().id);
        this.log(`Refreshing state for ${room.roomName}: current/program mode: ${room.currentMode}/${room.programMode}, comfort/sleep/away/holiday/avg temp: ${room.comfortTemp}/${room.sleepTemp}/${room.awayTemp}/${room.holidayTemp}/${room.avgTemp}, heatStatus: ${room.heatStatus}`);

        if (this.room && !this.room.modesMatch(room)) {
          this.log(`Triggering mode change from ${this.room.modeName} to ${room.modeName}`);
          // not needed, setCapabilityValue will trigger
          // this.modeChangedTrigger.trigger(this, { mill_mode: 'x'+room.modeName })
          //   .catch(this.error);
          this.modeChangedToTrigger.trigger(this, null, { mill_mode: room.modeName })
            .catch(this.error);
        }

        this.room = new Room(room);
        Promise.all([
          this.setCapabilityValue('measure_temperature', room.avgTemp),
          this.setCapabilityValue('target_temperature', room.targetTemp),
          this.setCapabilityValue('mill_mode', room.modeName),
          this.setCapabilityValue('mill_onoff', room.isHeating)
        ]).then(() => {
          this.scheduleRefresh();
        }).catch((error) => {
          this.log(error);
          logException(error);
        });
      } else {
        this.log('Mill not connected');
        this.scheduleRefresh(10);
      }
    } catch (e) {
      this.log(e);
      logException(e);
    } finally {
      if (this.refreshTimeout === null) {
        this.scheduleRefresh();
      }
    }
  }

  scheduleRefresh(interval) {
    const refreshInterval = interval || Homey.ManagerSettings.get('interval');
    this.refreshTimeout = setTimeout(this.refreshState.bind(this), refreshInterval * 1000);
    this.log(`Refreshing in ${refreshInterval} seconds`);
  }

  onAdded() {
    this.log('device added', this.getState());
  }

  onDeleted() {
    this.log('device deleted');
  }

  onCapabilityTargetTemperature(value, opts, callback) {
    const logDate = new Date().getTime();
    this.log(`${logDate}: onCapabilityTargetTemperature(${value})`);
    const temp = Math.ceil(value);
    if (temp !== value) { // half degrees isn't supported by Mill, need to round it up
      this.setCapabilityValue('target_temperature', temp);
      this.log(`${logDate}: onCapabilityTargetTemperature(${value}=>${temp})`);
    }
    const millApi = Homey.app.getMillApi();
    this.room.targetTemp = temp;
    millApi.changeRoomTemperature(this.deviceId, this.room)
      .then(() => {
        this.log(`${logDate}: onCapabilityTargetTemperature(${temp}) done`);
        this.log(`Changed temp for ${this.room.roomName} to ${temp}: currentMode: ${this.room.currentMode}/${this.room.programMode}, comfortTemp: ${this.room.comfortTemp}, awayTemp: ${this.room.awayTemp}, avgTemp: ${this.room.avgTemp}, sleepTemp: ${this.room.sleepTemp}`);
        callback(null, temp);
      }).catch((error) => {
        this.log(`${logDate}: onCapabilityTargetTemperature(${temp}) error`);
        this.log(`Change temp for ${this.room.roomName} to ${temp} resultet in error`, error);
        callback(error);
      });
  }

  setThermostatMode(value) {
    return new Promise((resolve, reject) => {
      const millApi = Homey.app.getMillApi();
      this.room.modeName = value;
      Promise.all([
        this.setCapabilityValue('target_temperature', this.room.targetTemp),
        millApi.changeRoomMode(this.deviceId, this.room.currentMode)
      ]).then(() => {
        this.log(`Changed mode for ${this.room.roomName} to ${value}: currentMode: ${this.room.currentMode}/${this.room.programMode}, comfortTemp: ${this.room.comfortTemp}, awayTemp: ${this.room.awayTemp}, avgTemp: ${this.room.avgTemp}, sleepTemp: ${this.room.sleepTemp}`);
        resolve(value);
      }).catch((error) => {
        this.log(`Change mode for ${this.room.roomName} to ${value} resultet in error`, error);
        reject(error);
      });
    });
  }

  onCapabilityThermostatMode(value, opts, callback) {
    this.setThermostatMode(value)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  }
}

module.exports = MillDevice;
