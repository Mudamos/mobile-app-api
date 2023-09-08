var _ = require('lodash')
	, UserModel = require('./user')
	, Connection = require('../../../config/initializers/database');

class MobileModel {

	constructor() { }

	static updateMobile(mobile, user) {
		var query = 'CALL SP_UPDATE_MOBILE(?, ? , ?, ?, ? , ? , ?, ? , ? , ?, ?)';
		return new Promise((resolve, reject) => {
			var connection = new Connection();
			connection.getConnection(function (err) {
				if (err) {
					reject(err);
				}
			}, function (conn) {
				conn.query(query, [mobile.id, mobile.number, user.user_id, mobile.imei, mobile.brand, mobile.model, mobile.so, mobile.soVersion, mobile.screenSize, mobile.pinCode, 1], function (error, rows, fields) {
					conn.release();
					user.mobile_id = mobile.id;
					user.mobile_number = mobile.number;
					user.mobile_imei = mobile.imei;
					user.mobile_brand = mobile.brand;
					user.mobile_model = mobile.model;
					user.mobile_so = mobile.so;
					user.mobile_so_version = mobile.soVersion;
					user.mobile_screensize = mobile.screenSize;
					user.mobile_status = 1;
					resolve(user);
				});
			});
		});
	};

	static findByNumber(mobile, user) {
		var query = 'SELECT m.Id AS mobile_id, m.Status AS mobile_status, m.Number AS mobile_number, m.Imei AS mobile_imei, m.Brand AS mobile_brand, m.Model AS mobile_model, m.SO AS mobile_so, m.SOVersion AS mobile_so_version, m.ScreenSize AS mobile_screensize FROM mobile as m JOIN user_mobile as um ON m.Id = um.MobileId AND UserId = ? AND m.number = ? ORDER BY m.Create desc LIMIT 1';
		return new Promise((resolve, reject) => {
			var connection = new Connection();
			connection.getConnection(function (err) {
				if (err) {
					reject(err);
				}
			}, function (conn) {
				conn.query(query, [user.user_id, mobile.number], function (error, rows, fields) {
					conn.release();
					resolve(_.first(rows));
				});
			});
		});
	}

	static createMobileBasic(mobile, user) {
		var query = `CALL SP_INSERT_MOBILE(?, ?, ?, ?)`;
		return new Promise((resolve, reject) => {
			var connection = new Connection();
			connection.getConnection(function (err) {
				if (err) {
					reject(err);
				}
			}, function (conn) {
				conn.query(query, [mobile.number, user.user_id, 0, mobile.pinCode], function (error, rows, fields) {
					conn.release();
					resolve(mobile.pinCode);
				});
			});
		});
	}
}

module.exports = MobileModel;
