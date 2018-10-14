/* eslint import/no-unresolved: 2 */
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
        return callback(error);
      }
    },
  },
  {
    method: 'POST',
    path: '/clearSettings',
    fn: async (args, callback) => {
      Homey.app.clear();
      return callback(null, {});
    },
  },
];
