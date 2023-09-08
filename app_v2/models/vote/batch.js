var _ = require('lodash')
  , Connection = require('../../../config/initializers/database');

class Batch {

  constructor() { }

  static verifyFileProcess(files) {
    var query = `SELECT Id, File FROM batch WHERE File REGEXP '${files.join('|')}'`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      })
    });
  }

  static findAll() {
    var query = `SELECT Id as id, File as file , Signature as signature FROM batch WHERE Status = 0`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      })
    });
  }

  static update(batch) {
    var query = 'CALL SP_UPDATE_BATCH (?, ?, ?, ?, ?);';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [batch.tx_id, batch.tx_stamp, batch.block_stamp, batch.status, batch.id], function (error, rows, fields) {
          conn.release();
          resolve(batch);
        });
      });
    });
  }

  static createBatch(pathFile, sha) {
    var query = `CALL SP_INSERT_BATCH(@id, ?, ? ); SELECT @id as id`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [pathFile, sha]
          , function (error, rows, fields) {
            conn.release();
            resolve(_.first(rows[1]).id);
          });
      })
    });
  }

  static InsertVotesInBacth(batchId, voteIds) {
    var query = `INSERT INTO batch_vote (BatchId, VoteId, Signature)
                 SELECT ${batchId} , Id, Signature FROM vote WHERE Id IN (${voteIds.join(',')})`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, function (error, rows, fields) {
          conn.release();
          if (rows.affectedRows)
            resolve(true);
        });
      })
    });
  }
}

module.exports = Batch;
