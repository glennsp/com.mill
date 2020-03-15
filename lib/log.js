const Sentry = require('@sentry/node');
const crypto = require('crypto');

class Log {
  constructor() {
    this.capturedExceptions = {};
    this.capturedMessages = {};

    if (!global.Homey) {
      try {
        // eslint-disable-next-line global-require,import/no-unresolved
        this.homey = require('homey');
      } catch (err) {
        console.error('Error: Homey not found');
      }
    } else {
      this.homey = global.Homey;
    }

    const sentryDSN = this.homey ? this.homey.env.SENTRY_DSN : process.env.SENTRY_DSN;
    if (sentryDSN) {
      this.init(sentryDSN);
    } else {
      console.error('Error: Sentry DSN not found');
    }
  }

  static log(...args) {
    console.log(Log.logTime(), '[homey-log]', ...args);
  }

  init(dsn, opts = {}) {
    // if (process.env.DEBUG === '1' && this.homey.env.HOMEY_LOG_FORCE !== '1') {
    //   return Log.log('App is running in debug mode, disabling Sentry logging');
    // }

    if (this.homey) {
      opts.release = `com.mill@${this.homey.manifest.version}`;
    }

    Sentry.init(dsn, opts);

    this.sentryEnabled = true;

    if (this.homey) {
      Sentry.configureScope((scope) => {
        scope.setTag('appId', this.homey.manifest.id);
        scope.setTag('appVersion', this.homey.manifest.version);
        scope.setTag('homeyVersion', this.homey.version);
      });

      Log.log(`App ${this.homey.manifest.id} v${this.homey.manifest.version} logging...`);
    } else {
      Log.log('App logging...');
    }

    return this;
  }

  captureMessage(message, options, callback) {
    Log.log('captureMessage:', message);

    if (this.capturedMessages.indexOf(message) > -1) {
      Log.log('Prevented sending a duplicate message');
      return this;
    }

    this.capturedMessages.push(message);

    if (this.sentryEnabled) {
      const eventId = Sentry.captureMessage(
        message,
        options && options.constructor.name === 'Object' ? Object.assign({}, options) : options,
        callback
      );
      return eventId;
    }

    return null;
  }

  captureException(err, options, callback) {
    Log.log('captureException:', err);

    const errHash = Log.hash(err.message);
    if (this.capturedExceptions[errHash]) {
      Log.log('Prevented sending a duplicate log');
      this.capturedExceptions[errHash].count += 1;
      return null;
    }

    this.capturedExceptions[errHash] = {
      exception: err.message,
      count: 1
    };

    if (this.sentryEnabled) {
      const eventId = Sentry.captureException(
        err,
        options && options.constructor.name === 'Object' ? Object.assign({}, options) : options,
        callback
      );
      return eventId;
    }

    return null;
  }

  static logTime() {
    const padZero = num => (num < 10 ? `0${num}` : num)

    const date = new Date();
    const mm = padZero(date.getMonth() + 1);
    const dd = padZero(date.getDate());
    const hh = padZero(date.getHours());
    const min = padZero(date.getMinutes());
    const sec = padZero(date.getSeconds());

    return `${date.getFullYear()}-${mm}-${dd} ${hh}:${min}:${sec}`;
  }

  static hash(str) {
    return crypto.createHash('sha1').update(str).digest('base64');
  }
}

module.exports = new Log();
