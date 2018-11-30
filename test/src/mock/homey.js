module.exports = {
  App: class App {},
  manifest: {
    id: 'com.mill'
  },
  settings: {
    username: 'username',
    password: 'password',
    debugLog: []
  },
  ManagerSettings: {
    get: param => param,
    set: () => {}
  }
};
