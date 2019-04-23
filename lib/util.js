// eslint-disable-next-line import/no-unresolved
const fetch = require('node-fetch');

const log = (severity, message, data) => {
  // Homey will not be available in tests
  let Homey;
  try { Homey = require('homey'); } catch (e) {}
  if (!Homey) {
    console.log(`${severity}: ${message}`, data || '');
    return;
  }

  if (Homey.ManagerSettings.get('debug')) {
    const debugLog = Homey.ManagerSettings.get('debugLog') || [];
    const entry = { registered: new Date().toLocaleString(), severity, message };
    if (data) {
      if (typeof data === 'string') {
        entry.data = { data };
      } else if (data.message) {
        entry.data = { error: data.message, stacktrace: data.stack };
      } else {
        entry.data = data;
      }
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

const fetchJSON = async (endpoint, options) => {
  try {
    const result = await fetch(endpoint, options);
    const text = await result.text();
    return text.length > 0 ? JSON.parse(text) : {};
  } catch (e) {
    return {
      error: e.message || e
    };
  }
};

module.exports = {
  debug, warn, error, fetchJSON
};
