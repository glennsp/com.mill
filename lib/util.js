// eslint-disable-next-line import/no-unresolved
const fetch = require('node-fetch');

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
module.exports = fetchJSON;

