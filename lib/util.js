// eslint-disable-next-line import/no-unresolved
const fetch = require('node-fetch');

const log = (app,severity, message, data) => {
  // Homey will not be available in tests
  try { Homey = require('homey'); } catch (e) {}
  if (!Homey) {
    console.log(`${severity}: ${message}`, data || '');
    return;
  }
  const debug = app.settings.get('debug');
  if ( debug ) {
    const debugLog = app.settings.get('debugLog') || [];
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
    app.log(`${severity}: ${message}`, data || '');
    app.settings.set('debugLog', debugLog);
    app.api.realtime('debugLog', entry);
  }
};

const debug = (app, message, data) => {
  log(app,'DEBUG', message, data);
};

const warn = (app,message, data) => {
  log(app,'WARN', message, data);
};

const error = (app,message, data) => {
  log(app,'ERROR', message, data);
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
