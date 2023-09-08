var Connection = require('../../../config/initializers/database');

class Access {

  constructor() { }

  static access(information, userId, sha, isError) {
    var query = `CALL SP_INSERT_LOGACCESS(?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [information, userId, sha, isError], function (error, rows, fields) {
          conn.release();
          resolve(true);
        });
      });
    });
  }

  static findByUser(userId, isError) {
    var query = `SELECT * FROM logaccess WHERE UserId = ? AND IsError = ?`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [userId, isError], function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      });
    });
  }

  static deleteByUser(userId, isError) {
    var query = `DELETE FROM logaccess WHERE UserId = ? AND IsError = ?`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [userId, isError], function (error, rows, fields) {
          conn.release();
            resolve(true);
        });
      });
    });
  }
}

module.exports = Access;
