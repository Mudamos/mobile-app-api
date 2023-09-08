var nconf = require('nconf')
  , async = require('async');

require('newrelic');

require('dotenv').load({ silent: true });

nconf.use('memory');

const config = require("./config")();
const { logCreator } = require("./src/services");
const { logger, stream: logStream } = logCreator(config);

console.log('Server Running on ' + process.env.NODE_ENV)

nconf.argv();

nconf.env();

var server = require('./config/initializers/server');

async.series([
  function startServer() {
    server({
      config,
      logger,
      logStream,
    });
  }], function(err) {
    if (err) {
      logger.error('[APP] initialization failed', err);
    } else {
      logger.info('[APP] initialized SUCCESSFULLY');
    }
  }
);
