var _ = require('lodash')
  , config = require('nconf')
	, moment = require('moment')
  , validator = require('validator')
  , Connection = require('../../../config/initializers/database')
  , queryBuilder = require("../../../src/db/query-builder")

const {
  head,
  identity,
} = require("ramda");


class Favorite {

  constructor() { }

  static toggleFavorite(userId, petitionId) {
    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    const queryFavoriteExists = queryBuilder("favorite").select({createdAt: "Create"}).where("UserId", userId).where("PetitionId", petitionId);
    const QueryDeleteFavorite = queryBuilder("favorite").where("UserId", userId).where("PetitionId", petitionId).del();
    const queryInsertFavorite = queryBuilder("favorite").insert({ userId, petitionId, Create: now});

    return new Promise((resolve, reject) => {
      const connection = new Connection();
      connection.getConnection(err => {
        err && reject(err)
      }, conn => {
        conn.beginTransaction(err => {
          if (err) {
            return conn.rollback(() => {
              conn.release();
              reject(err);
            });
          }
          conn.query(String(queryFavoriteExists), (err, rows, fields) => {
            if (err) {
              return conn.rollback(() => {
                conn.release();
                reject(err);
              });
            }

            const favoriteExist = head(rows);

            if (favoriteExist) {
              conn.query(String(QueryDeleteFavorite), (err, rows, fields) => {
                if (err) {
                  return conn.rollback(() => {
                    conn.release();
                    reject(err);
                  });
                }

                conn.commit(err => {
                  if (err) {
                    return conn.rollback(() => {
                      conn.release();
                      reject(err);
                    });
                  }
                  conn.release();

                  resolve({"action": "delete", favorite: null});
                });
              })
            } else {
              conn.query(String(queryInsertFavorite), (err, rows, fields) => {
                if (err) {
                  return conn.rollback(() => {
                    conn.release();
                    reject(err);
                  });
                }

                conn.commit(err => {
                  if (err) {
                    return conn.rollback(() => {
                      conn.release();
                      reject(err);
                    });
                  }

                  conn.query(String(queryFavoriteExists), (err, rows, fields) => {
                    if (err) {
                      return conn.rollback(() => {
                        conn.release();
                        reject(err);
                      });
                    }

                    conn.release();
                    resolve({"action": "insert", favorite: head(rows)});
                  })
                });
              })
            }
          });
        });
      });
    })
  }
}

module.exports = Favorite;
