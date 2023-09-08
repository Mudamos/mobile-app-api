var _ = require('lodash')
  , Connection = require('../../../config/initializers/database')
  , CacheRedis = require('../../../config/initializers/cache-redis')
  , Cache = new CacheRedis();

class ConfigModel {

  constructor() { }

  static getConfig(key) {
    return Cache.getKey(key)
      .then(cache => {
        var query = `SELECT * FROM config WHERE KeyName = ?`;
        return new Promise((resolve, reject) => {
          if (cache) {
            resolve(JSON.parse(cache))
          }
          else {
            var connection = new Connection();
            connection.getConnection(function (err) {
              if (err) {
                reject(err);
              }
            }, function (conn) {
              conn.query(query, [key], function (error, rows, fields) {
                if (rows.length)
                  Cache.setKeySync(key, JSON.stringify(_.first(rows)))
                conn.release();
                resolve(_.first(rows));
              });
            });
          }
        });
      })
  }
  static getConfigList(keys) {
    var query = `SELECT * FROM config WHERE KeyName = ?`;
    return Cache.getKey(JSON.stringify(keys))
      .then(cache => {

        if (keys.length > 1)
          for (var i = 1; i < keys.length; i++) {
            query = query + ` OR KeyName = ? `;
          }
        query = query + 'ORDER BY KeyName'
        return new Promise((resolve, reject) => {
          if (cache) {
            resolve(JSON.parse(cache))
          }
          else {
            var connection = new Connection();
            connection.getConnection(function (err) {
              if (err) {
                reject(err);
              }
            }, function (conn) {
              conn.query(query, keys, function (error, rows, fields) {
                conn.release();
                Cache.setKeySync(JSON.stringify(keys), JSON.stringify(rows))
                resolve(rows);
              });
            });
          }
        });
      })
  }
}

module.exports = ConfigModel;
