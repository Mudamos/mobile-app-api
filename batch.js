var nconf = require('nconf')
  , async = require('async')
  , logger = require('winston');

require('dotenv').load({ silent: true });

nconf.use('memory');

nconf.argv();
nconf.env();

var server = require('./config/initializers/batch');

async.series([
  function startServer(callback) {
    server(callback);
  }], function(err) {
    if (err) {
      logger.error('[APP] initialization failed', err);
    } else {
      logger.info('[APP] initialized SUCCESSFULLY');
    }
  }
);

