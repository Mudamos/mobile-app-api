var rp = require('request-promise')
	,	config = require('nconf');

class AddressModel {

	constructor(address, zipcode, lat, lng, district, city, state, uf) {
		this.address = address;
		this.zipcode = zipcode;
		this.district = district;
		this.state = state;
		this.uf = uf;
		this.city = city;
		this.lat = lat;
		this.lng = lng;
	}

	static searchGoogleApi(address) {
		var options = {
			uri : `https://maps.google.com/maps/api/geocode/json?address=${address}&components=country:BR&components=postal_code:${address}&key=${config.get('GOOGLE_MAPS_KEY')}&region=br`,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		};
		return rp(options);
	}

	static searchGoogleApiInverse(lat, lng) {
		var options = {
			uri: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${config.get('GOOGLE_MAPS_KEY')}&location_type=${config.get('GOOGLE_MAPS_TYPE')}&region=br`,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		};
		return rp(options);
	}

	static distance(origins, destinations) {
		var options = {
			uri: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=bicycling&language=pt-BR`,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		};
		return rp(options);
	}
}

module.exports = AddressModel;
