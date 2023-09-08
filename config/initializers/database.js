var config = require('nconf')
  , mysql = require('mysql')
  , validator = require('validator')
  , listErrors = require('../../libs/helpers/errors-list')
  , ValidationModel = require('../../libs/models/response/validation')
  , ValidateAttribute = require('../../libs/models/validate/attribute');

const appConfig = require("../")();
const { logCreator } = require("../../src/services");
const { logger } = logCreator(appConfig);

module.exports = (function () {

  let instance = null;

  class Connection {
    constructor() {
      if (instance) {
        return instance;
      }

      if (config.get("NODE_ENV") === "development") {
        logger.info("[PID %d] Creating an old connection pool", process.pid);
      }

      const connectionLimit = parseInt(config.get('DB_CONNECTIONS_LIMIT'), 10);

      this.pool = mysql.createPool({
        host: config.get('DB_HOST'),
        user: config.get('DB_USER'),
        timezone: 'America/Sao_Paulo',
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        connectionLimit: connectionLimit ? connectionLimit : null,
        waitForConnections: true,
        supportBigNumbers: true,
        multipleStatements: true,
        connectTimeout: 30000
      });

      this.pool.on('connection', function (connection) {
       connection.query('SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED; SET TIME_ZONE = \'America/Sao_Paulo\';')
      });

      this.pool.on('error', function (err) {
        //console.log('Error Pool ' + err.code);
      });

      this.pool.on('release', function (connection) {
        //console.log('Connection %d released', connection.threadId);
      });

      instance = this;
    }

    getPool() {
        return this.pool;
    }

    getConnection(error, callback){
      this.pool.getConnection(function(err, connection) {
        if(err){
          error(new ValidationModel('fail', 'validation', listErrors['ErrorDataBaseConnection'].message, [new ValidateAttribute('connection', listErrors['ErrorDataBaseConnection'].message)], listErrors['ErrorDataBaseConnection'].errorCode));
        }else{
          callback(connection);
        }
      })
    }
  }

  return Connection;

})();
