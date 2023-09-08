var Connection = require('../../../config/initializers/database');
var _ = require('lodash');

class Trace {

  constructor() { }

  static log(type, request, response, isError) {
    var query = `CALL SP_INSERT_TRACE(? ,? ,?, ?)`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [type, request, response, isError], function (error, rows, fields) {
          conn.release();
          resolve(true);
        });
      });
    });
  }

  static cleanPassword(path, body){
    var bodyParse = JSON.parse(JSON.stringify(body))
    var listPath = [{'path' :'/API/V2/USERS/SIGN_UP'} ,{'path' :'/API/V1/USERS/SIGN_UP' }, {'path' :'/API/V1/USERS/PASSWORD/UPDATE' }, {'path' :'/API/V2/USERS/PASSWORD/UPDATE' }, {'path' :'/API/V3/USERS/SIGNUP' }];
    if(_.find(listPath, { 'path' : path } )){
      delete bodyParse.user.currentPassword;
      delete bodyParse.user.newPassword;
      delete bodyParse.user.password;
    }
    return bodyParse;
  }
}

module.exports = Trace;
