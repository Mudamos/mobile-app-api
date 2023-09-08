var _ = require('lodash')
  , Connection = require('../../../config/initializers/database');

class NotificationModel {

  constructor() { }

  static validateUserCorfirm(user) {
    var query = 'CALL SP_UPDATE_USER_CONFIRM(@validate, ?); select DATE_FORMAT(@validate, \'%Y-%m-%dT%TZ\') as validate;';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [user.user_id], function (error, rows, fields) {
          conn.release();
          if (rows[1].length) {
            user.user_validate = _.first(rows[1]).validate;
            resolve(user);
          }
        });
      });
    });
  };
}

module.exports = NotificationModel;
