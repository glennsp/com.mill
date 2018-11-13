const Sentry = require('@sentry/node');

const logException = (e) => {
  Sentry.captureException(e);
}

module.exports = logException;
