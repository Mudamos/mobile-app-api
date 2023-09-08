var _ = require('lodash')
  , config = require('nconf')
  , validator = require('validator')
  , listErrors = require('../../../libs/helpers/errors-list')
  , Connection = require('../../../config/initializers/database')
  , ValidationModel = require('../../../libs/models/response/validation')
  , ValidateAttribute = require('../../../libs/models/validate/attribute');

const { startsWith } = require("ramda");

const isOldPdfPath = path => startsWith("/", path || "");

class Petition {

  constructor() { }

  static update(petition) {
    var query = 'CALL SP_UPDATE_PETITION (?, ?, ?, ?, ?);';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [petition.tx_id, petition.tx_stamp, petition.block_stamp, petition.status, petition.id], function (error, rows, fields) {
          conn.release();
          resolve(petition);
        });
      });
    });
  }

  static insert(petition) {
    petition.status = 0;
    petition.name = petition.name || '';
    var query = 'CALL SP_INSERT_PETITION (@id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); SELECT @id AS id;';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        const queryParams = [
          petition.id_version,
          petition.id_petition,
          petition.status,
          petition.name,
          petition.sha,
          petition.url,
          petition.page_url,
          petition.scope_coverage,
          petition.uf,
          petition.city_id,
        ];

        conn.query(query, queryParams, (error, rows, fields) => {
          conn.release();
          if (_.first(rows) && _.first(_.first(rows))) {
            var validations = [];
            var messageError;
            _.each(rows, (row) => {
              if (Array.isArray(row) && _.first(row).Level == "Warning") {
                messageError = _.first(row).Message;
              } else if (Array.isArray(row) && _.first(row).msg != undefined) {
                messageError = _.first(row).msg;
              }
              if (messageError) {
                validations.push(new ValidateAttribute('petition', messageError));
                messageError = undefined;
              }
            });
            reject(new ValidationModel('fail', 'validation', listErrors['ErrorPetitionCreate'].message, validations, listErrors['ErrorPetitionCreate'].errorCode));
          } else {
            resolve(Petition.findById(_.first(rows[1]).id))
          }
        });
      });
    });
  }

  static findLastActive() {
    var query = 'SELECT p.PageUrl AS page_url FROM `petition` as p  WHERE p.Status = 1 ORDER BY p.Create DESC LIMIT 1 ;';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, function (error, rows, fields) {
          conn.release();
          resolve(_.first(rows));
        });
      })
    });
  }

  static async findById(id) {
    var query = 'SELECT p.Id AS id_petition, p.Status AS petition_status, p.IdPetition AS petition_id, p.Name AS petition_name, p.PageUrl AS petition_page_url, p.TxStamp AS petition_tx_stamp, p.DigSig AS petition_dig_sig FROM petition AS p WHERE Id = ?';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [id], function (error, rows, fields) {
          conn.release();
          resolve(_.first(rows));
        });
      })
    });
  }

  static async findByPetitionId(id) {
    var query = 'SELECT p.Id AS id_petition, p.Status AS petition_status, p.IdPetition AS petition_id, p.Name AS petition_name, p.PageUrl AS petition_page_url, p.TxStamp AS petition_tx_stamp, p.DigSig AS petition_dig_sig FROM petition AS p WHERE IdPetition = ? ORDER BY Id DESC;';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [id], function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      })
    });
  }

  static findByIdVersionPettion(id) {
    var query = 'SELECT Id as petition_id_version, Name AS petition_name, PageUrl AS petition_page_url  FROM petition WHERE ( IdVersion = ? AND Status = 1 )';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [id, id], function (error, rows, fields) {
          conn.release();
          resolve(_.first(rows));
        });
      })
    });
  }

  static findAllByIdVersionPettion(id) {
    var query = 'SELECT Id as petition_id_version, Name AS petition_name, PageUrl AS petition_page_url  FROM petition WHERE IdPetition = ( SELECT IdPetition FROM petition WHERE IdVersion = ? ) AND Status = 1 ';
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [id], function (error, rows, fields) {
          conn.release();
          resolve(rows);
        });
      })
    });
  }

  static findAll() {
    var query = `SELECT p.IdVersion AS id_version , p.Id AS id , p.DigSig as sha FROM  petition p WHERE p.Status = 0 AND p.BlockStamp IS NULL;`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err, conn) {
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

  static async findAllActive() {
    var query = `SELECT  p.IdPetition AS petition_id , count(p.IdPetition) AS qtd_votes FROM  vote v JOIN petition p ON p.Id = v.PetitionId GROUP BY p.IdPetition;`;

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err, conn) {
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

  static findAllBlockchainSignaturesProcessed(id_petition) {
    var query = `SELECT
                  b.File AS petition_pdf_url,
                  b.TxId AS petition_blockchain_transaction_id,
                  b.Create AS petition_updatedat,
                  b.TxStamp AS petition_txstamp,
                  b.BlockStamp AS petition_blockstamp,
                  b.Signature AS petition_signature
                FROM
                  batch AS b
                JOIN
                  petition AS p ON p.Id = b.PetitionId
                WHERE
                  p.IdPetition = ?
                  AND p.Status = 1
                  AND b.Status = 1
                ORDER BY
                  b.Create DESC`;
    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, [id_petition], function (error, rows, fields) {
          conn.release();
          _.each(rows, (row) => {
            if (!isOldPdfPath(row.petition_pdf_url)) {
              row.petition_pdf_url = `${config.get('AWS_URL')}/${config.get('AWS_BUCKET')}/${row.petition_pdf_url}`;
            } else {
              let splitURL = row.petition_pdf_url ? row.petition_pdf_url.split('/') : '';
              if (splitURL != '') {
                splitURL[splitURL.length - 1] = `anonymised/${splitURL[splitURL.length - 1]}`;
                splitURL = splitURL.join('/');
              }
              row.petition_pdf_url = `${config.get('AWS_URL')}/${config.get('AWS_BUCKET')}${splitURL}`;
            }
          });

          resolve(rows);
        });
      })
    });
  }
}

module.exports = Petition;
