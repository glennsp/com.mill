// eslint-disable-next-line import/no-unresolved
const Homey = require('homey');
const { Log } = require('./../../lib/log');
const { debug, error } = require('./../../lib/util');
const Room = require('./../../lib/models');

class MillDevice extends Homey.Device {
  onInit() {
    this.deviceId = this.getData().id;

    debug(`[${this.getName()}] ${this.getClass()} (${this.deviceId}) initialized`);

    // Add new capailities for devices that don't have them yet
    if (!this.getCapabilities().includes('onoff')) {
      this.addCapability('onoff').catch(this.error);
    }
    if (!this.getCapabilities().includes('measure_power')) {
      this.addCapability('measure_power').catch(this.error);
    }

    // capabilities
    this.registerCapabilityListener('target_temperature', this.onCapabilityTargetTemperature.bind(this));
    this.registerCapabilityListener('mill_mode', this.onCapabilityThermostatMode.bind(this));
    this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));

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
      .registerRunListener(() => (this.room && this.room.heatStatus === 1));

    this.isMatchingModeCondition = new Homey.FlowCardCondition('mill_mode_matching');
    this.isMatchingModeCondition
      .register()
      .registerRunListener(args => (args.mill_mode === this.room.modeName));

    // actions
    this.setProgramAction = new Homey.FlowCardAction('mill_set_mode');
    this.setProgramAction
      .register()
      .registerRunListener((args) => {
        debug(`[${args.device.getName()}] Flow changed mode to ${args.mill_mode}`);
        return args.device.setThermostatMode(args.mill_mode);
      });

    this.refreshTimeout = null;
    this.room = null;
    this.refreshState();
  }

  async refreshState() {
    debug(`[${this.getName()}] Refreshing state`);

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }

    try {
      if (Homey.app.isConnected()) {
        await this.refreshMillService();
        this.setAvailable();
      } else {
        debug(`[${this.getName()}] Mill not connected`);
        this.setUnavailable();
        await Homey.app.connectToMill().then(() => {
          this.scheduleRefresh(10);
        }).catch((err) => {
          error('Error caught while refreshing state', err);
        });
      }
    } catch (e) {
      error('Exception caught', e);
      Log.captureException(e);
    } finally {
      if (this.refreshTimeout === null) {
        this.scheduleRefresh();
      }
    }
  }

  scheduleRefresh(interval) {
    const refreshInterval = interval || Homey.ManagerSettings.get('interval');
    this.refreshTimeout = setTimeout(this.refreshState.bind(this), refreshInterval * 1000);
    debug(`[${this.getName()}] Next refresh in ${refreshInterval} seconds`);
  }

  async refreshMillService() {
    const millApi = Homey.app.getMillApi();

    return millApi.listDevices(this.getData().id)
      .then((room) => {
        debug(`[${this.getName()}] Mill state refreshed`, {
          comfortTemp: room.comfortTemp,
          awayTemp: room.awayTemp,
          holidayTemp: room.holidayTemp,
          sleepTemp: room.sleepTemp,
          avgTemp: room.avgTemp,
          currentMode: room.currentMode,
          programMode: room.programMode,
          heatStatus: room.heatStatus
        });

        if (room.programMode !== undefined) {
          if (this.room && !this.room.modesMatch(room) && this.room.modeName !== room.modeName) {
            debug(`[${this.getName()}] Triggering mode change from ${this.room.modeName} to ${room.modeName}`);
            // not needed, setCapabilityValue will trigger
            // this.modeChangedTrigger.trigger(this, { mill_mode: room.modeName })
            //   .catch(this.error);
            this.modeChangedToTrigger.trigger(this, null, { mill_mode: room.modeName })
              .catch(this.error);
          }

          this.room = new Room(room);
          const jobs = [
            this.setCapabilityValue('measure_temperature', ((Math.log10((room.avgTemp ^ (room.avgTemp >> 31)) - (room.avgTemp >> 31)) | 0) + 1) > 2 ? Math.round(room.avgTemp / 100) : room.avgTemp),
            this.setCapabilityValue('mill_mode', room.modeName),
            this.setCapabilityValue('mill_onoff', room.isHeating),
            this.setCapabilityValue('onoff', room.modeName !== 'Off')
          ];

          if(this.hasCapability('measure_power')) {
            const settings = this.getSettings();
            if (settings.energy_consumption > 0)
              jobs.push(this.setCapabilityValue('measure_power', room.isHeating ? settings.energy_consumption : 2));
          }

          if (room.modeName !== 'Off') {
            jobs.push(this.setCapabilityValue('target_temperature', room.targetTemp));
          }
          return Promise.all(jobs).catch((err) => {
            Log.captureException(err);
          });
        }
      }).catch((err) => {
        error(`[${this.getName()}] Error caught while refreshing state`, err);
      });
  }

  onAdded() {
    debug('device added', this.getState());
  }

  onDeleted() {
    clearTimeout(this.refreshTimeout);
    debug('device deleted', this.getState());
  }

  onCapabilityTargetTemperature(value, opts, callback) {
    debug(`onCapabilityTargetTemperature(${value})`);
    const temp = Math.ceil(value);
    if (temp !== value && this.room.modeName !== 'Off') { // half degrees isn't supported by Mill, need to round it up
      this.setCapabilityValue('target_temperature', temp);
      debug(`onCapabilityTargetTemperature(${value}=>${temp})`);
    }
    const millApi = Homey.app.getMillApi();
    this.room.targetTemp = temp;
    millApi.changeRoomTemperature(this.deviceId, this.room)
      .then(() => {
        debug(`onCapabilityTargetTemperature(${temp}) done`);
        debug(`[${this.getName()}] Changed temp to ${temp}: currentMode: ${this.room.currentMode}/${this.room.programMode}, comfortTemp: ${this.room.comfortTemp}, awayTemp: ${this.room.awayTemp}, avgTemp: ${this.room.avgTemp}, sleepTemp: ${this.room.sleepTemp}`);
        callback(null, temp);
      }).catch((err) => {
        debug(`onCapabilityTargetTemperature(${temp}) error`);
        debug(`[${this.getName()}] Change temp to ${temp} resultet in error`, err);
        callback(err);
      });
  }

  setThermostatMode(value) {
    return new Promise((resolve, reject) => {
      const millApi = Homey.app.getMillApi();
      this.room.modeName = value;
      const jobs = [];
      if (this.room.modeName !== 'Off') {
        jobs.push(this.setCapabilityValue('target_temperature', this.room.targetTemp));
      }
      jobs.push(millApi.changeRoomMode(this.deviceId, this.room.currentMode));

      Promise.all(jobs).then(() => {
        debug(`[${this.getName()}] Changed mode to ${value}: currentMode: ${this.room.currentMode}/${this.room.programMode}, comfortTemp: ${this.room.comfortTemp}, awayTemp: ${this.room.awayTemp}, avgTemp: ${this.room.avgTemp}, sleepTemp: ${this.room.sleepTemp}`);
        resolve(value);
      }).catch((err) => {
        error(`[${this.getName()}] Change mode to ${value} resulted in error`, err);
        reject(err);
      });
    });
  }

  onCapabilityThermostatMode(value, opts, callback) {
    this.setThermostatMode(value)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  }

  onCapabilityOnOff(value, opts, callback) {
    let mode = value ? 'Program' : 'Off';
    this.setThermostatMode(mode)
      .then(result => callback(null, result))
      .catch(err => callback(err));
  }
}

module.exports = MillDevice;
