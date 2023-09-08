var Connection = require('../../../config/initializers/database')
	, validator = require('validator');

class Profile {

	constructor() { }

  static updateUserProfile(user, user_cache) {
    var query = 'UPDATE user SET ';
    const params = [];

    if (user.birthday && !validator.isEmpty(user.birthday)) {
      query += 'Birthday = ?,';
      params.push(user.birthday);
    }

    if (user.name && !validator.isEmpty(user.name)) {
      query += 'Name = ?,';
      params.push(user.name);
    }

    if (user.zipcode && user_cache.user_zipcode != user.zipcode) {
      query += 'Zipcode = ?,';
      params.push(user.zipcode || null);

      query += 'State = ?,';
      params.push(user.state || null);

      query += 'City = ?,';
      params.push(user.city || null);

      query += 'District = ?,';
      params.push(user.district || null);

      query += 'UF = ?,';
      params.push(user.uf || null);

      query += 'Lat = ?,';
      params.push(user.lat || null);

      query += 'Lng = ?,';
      params.push(user.lng || null);
    }

    if (user.voteidcard && !validator.isEmpty(user.voteidcard)) {
      query += 'VoteIdCard = ?,';
      params.push(user.voteidcard);
    }

    if (user.voteCity) {
      query += 'voteCityId = ?,';
      params.push(user.voteCity.id);
    }

    query = query.substr(0, query.length - 1);
    query += ' WHERE Id = ?';
    params.push(user_cache.user_id);

    return new Promise((resolve, reject) => {
      var connection = new Connection();
      connection.getConnection(function (err) {
        if (err) {
          reject(err);
        }
      }, function (conn) {
        conn.query(query, params, function (error, rows, fields) {
          conn.release();
          if (rows && rows.affectedRows) {
            user_cache.user_birthday = user.birthday || user_cache.user_birthday;
            user_cache.user_name = user.name || user_cache.user_name;
            user_cache.user_zipcode = user.zipcode || user_cache.user_zipcode;
            user_cache.user_voteidcard = user.voteidcard || user_cache.user_voteidcard;
            user_cache.user_state = user.state || user_cache.user_state;
            user_cache.user_uf = user.uf || user_cache.user_uf;
            user_cache.user_district = user.district || user_cache.user_district;
            user_cache.user_city = user.city || user_cache.user_city;
            user_cache.user_lat = user.lat || user_cache.user_lat;
            user_cache.user_lng = user.lng || user_cache.user_lng;

            if (user.voteCity) {
              user_cache.voteCityId = user.voteCity.id;
              user_cache.voteCityName = user.voteCity.name;
              user_cache.voteCityUf = user.voteCity.uf;
            }
          }
          resolve(user_cache);
        });
      });
    });
  };
}

module.exports = Profile;
