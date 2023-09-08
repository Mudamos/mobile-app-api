var Connection = require('../../../config/initializers/database');

class Blacklist {

  constructor() { }

  static insert(userId, walletId, type) {
    var query = `CALL SP_INSERT_BLACKLIST(?, ?, ?)`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [userId, walletId, type], function (error, rows, fields) {
          conn.release();
          resolve(true);
        });
      });
    });
  }

  static findByUser(user_id, type) {
    var query = `SELECT UserId, Type FROM  blacklist WHERE UserId = ? AND Type = ?`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [user_id, type], function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      });
    });
  }

  static findBlackListType(type) {
    var query = `SELECT b.Id AS blacklist_id , b.Create AS blacklist_create , b.UserId AS user_id FROM blacklist AS b WHERE Type = ?`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [type], function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      });
    });
  }

  static deleteById(id) {
    var query = `DELETE FROM blacklist WHERE Id = ?`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [id], function (error, rows, fields) {
          conn.release();
          resolve(true)
        });
      });
    });
  }
}

module.exports = Blacklist;
