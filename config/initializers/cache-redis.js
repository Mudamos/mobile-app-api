var redis = require('redis')
  , config = require('nconf')
  , instance = null;

class ErrorModel {
  constructor(status, message, errorCode) {
    this.status = status;
    this.message = message;
    this.errorCode = errorCode;
  }
}

let listErrors = {
  'ErrorCache': {
    message: 'Ocorreu um nesta operação (cache)',
    errorCode: 1103
  }
};

const defaultExpire = parseInt(config.get("CACHE_EXPIRE"), 10);

class CacheRedis {
  constructor() {
    if (!instance) {
      const port = parseInt(config.get("CACHE_PORT"), 10);
      this._client = redis.createClient(port, config.get('CACHE_HOST'), {
        retry_strategy: function (options) {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with a individual error
            return new Error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands with a individual error
            return new Error('Retry time exhausted');
          }
          if (options.times_connected > 10) {
            // End reconnecting with built in error
            return undefined;
          }
          // reconnect after
          return Math.min(options.attempt * 100, 3000);
        }
      }
      );
      this._client.auth(config.get('CACHE_PASS'))
      this._client.on("error", function (err) {
        console.log(err)
      })
      instance = this;
    }
    return instance;
  }

  disconnect() {
    if (instance)
      instance.quit()
  }

  getKey(key) {
    return new Promise((resolve, reject) => {
      var clientRedis = this._client;

      clientRedis.get(key, function (err, value) {
        if (err)
          reject(new ErrorModel('error', listErrors['ErrorCacheEmpty'].message, listErrors['ErrorCacheEmpty'].errorCode));
        else
          resolve(value);
      });
    })
  }

  getKeySync(key) {
    var clientRedis = this._client;
    clientRedis.get(key, function (err, value) {
      if (err)
        throw new ErrorModel('error', listErrors['ErrorCacheEmpty'].message, listErrors['ErrorCacheEmpty'].errorCode);
      else
        return value;
    });
  }

  setKeySync(key, object, expire) {
    if (!key || key == undefined) {
      return new ErrorModel('error', listErrors['ErrorCacheEmpty'].message, listErrors['ErrorCacheEmpty'].errorCode);
    } else {
      var clientRedis = this._client;
      var success = clientRedis.set(key, object)
      clientRedis.expire(key, expire == null ? defaultExpire : expire)
      return success ? object : null;
    }
  }

  deleteKeySync(key) {
    var clientRedis = this._client;
    return clientRedis.del(key);
  }

  setKey(key, object, expire) {
    return new Promise((resolve, reject) => {
      if (!key || key == undefined) {
        return reject(new ErrorModel('error', listErrors['ErrorCacheEmpty'].message, listErrors['ErrorCacheEmpty'].errorCode));
      } else {
        var clientRedis = this._client;
        clientRedis.set(key, object, function (err, value) {
          if (err)
            return reject(new ErrorModel('error', listErrors['ErrorCacheEmpty'].message, listErrors['ErrorCacheEmpty'].errorCode));
          else {
            clientRedis.expire(key, expire == null ? defaultExpire : expire)
            return resolve(object);
          }
        })
      }
    })
  }
}

module.exports = CacheRedis;
