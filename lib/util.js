// eslint-disable-next-line import/no-unresolved
const Homey = require('homey');

const log = (severity, message, data) => {
  if (Homey.ManagerSettings.get('debug')) {
    const debugLog = Homey.ManagerSettings.get('debugLog') || [];
    const entry = { registered: new Date().toLocaleString(), severity, message };
    if (data) {
      entry.data = data;
    }

    debugLog.push(entry);
    if (debugLog.length > 100) {
      debugLog.splice(0, 1);
    }
    Homey.app.log(`${severity}: ${message}`, data || '');
    Homey.ManagerSettings.set('debugLog', debugLog);
    Homey.ManagerApi.realtime('debugLog', entry);
  }
};

const debug = (message, data) => {
  log('DEBUG', message, data);
};

const warn = (message, data) => {
  log('WARN', message, data);
};

const error = (message, data) => {
  log('ERROR', message, data);
};

module.exports = { debug, warn, error };
