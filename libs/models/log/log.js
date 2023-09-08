var Connection = require('../../../config/initializers/database');

class Log {

  constructor() { }

  static log(type, request, response, isError) {
    var query = `CALL SP_INSERT_LOG(?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          console.log(err);
          resolve(false);
        }
      }, function (conn) {
        conn.query(query, [type, request, response, isError], function (error, rows, fields) {
          conn.release();
          resolve(true);
        });
      });
    });
  }
}

module.exports = Log;
