const { mergeDeepLeft } = require('ramda');
const rp = require('request-promise');
const config = require("../../../config")();

const timeout = parseInt(config("REQUEST_TIMEOUT"), 10);

const makeAuthorizedRequest = options =>
  rp(mergeDeepLeft(options, {
    headers: {
      Authorization: Buffer.from(config('ORIGINALMY_KEY'), 'utf8').toString('base64'),
    },
  }));

class BlockchainModel {

  constructor() {}

  static async register(digest) {
    const options = {
      uri: `${config('ORIGINALMY_URL')}/company/document/register`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: {
        digest,
      },
      json: true,
      timeout,
    };

    return makeAuthorizedRequest(options);
  }

  static status(digest) {
    const options = {
      uri: `${config('ORIGINALMY_URL')}/company/document/status/${digest}`,
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      json: true,
      timeout,
    };

    return rp(options);
  }
}
module.exports = BlockchainModel;
