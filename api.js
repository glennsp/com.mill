'use strict';
const Homey = require('homey');

module.exports = [
  {
    method: 'POST',
    path: '/authenticate',
    fn: async (args, callback) => {
      try {
        const result = await Homey.app.authenticate(args.body.username, args.body.password);
        return callback(null, result);
      } catch (error) {
        return callback(`
          Unfortunately, we received an error from Mill:\r\n
          "${error}"
          `);
      }
    }
  }
];
