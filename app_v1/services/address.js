var _ = require('lodash')
	, listErrors = require('../../libs/helpers/errors-list')
	, AddressModel = require('../models/user/address')
	, FailModel = require('../../libs/models/response/fail')
	, SuccessModel = require('../../libs/models/response/success')
	, ValidationModel = require('../../libs/models/response/validation');

class AddressService {

	constructor() { }

	static searchGoogleApi(address) {
		var validate = true;
		var country;
		return ValidationModel.validateRequest('address', 'ErrorAddressSearch', {zipcode: address})
			.then(success => {
				return AddressModel.searchGoogleApi(address)
					.then(body => {
							var result = JSON.parse(body)
						if(result.status == "OVER_QUERY_LIMIT" || result.status == "REQUEST_DENIED"){
							throw new FailModel('fail', 'address', listErrors['ErrorAddressSearch'].message, listErrors['ErrorAddressSearch'].errorCode);
						}else if (result.status == "ZERO_RESULTS" ) {
							return new SuccessModel('success', {});
						} else {
							var first_address = _.first(result.results);
							var address_result = new AddressModel(
								first_address.formatted_address
								, address
								, first_address.geometry.location.lat
								, first_address.geometry.location.lng
								, ''
								, ''
								, ''
								, '');

							_.each(_.first(result.results).address_components, (component) => {
								if (_.find(component.types, (type) => type == 'sublocality_level_1')) {
									address_result.district = component.long_name;
								}
								if (_.find(component.types, (type) => type == 'administrative_area_level_2')) {
									address_result.city = component.long_name;
								}
								if (_.find(component.types, (type) => type == 'administrative_area_level_1')) {
									address_result.state = component.long_name.replace('State of ', '');
									address_result.uf = component.short_name;
								}
								if (_.find(component.types, (type) => type == 'country')) {
									country = component.short_name;
								}
							})

							if (!address_result.zipcode || !address_result.lat || !address_result.lng || country.toLowerCase() != 'br') {
								validate = false;
							}

							if (!validate) {
                address_result = {};
							}
							return new SuccessModel('success', address_result);
						}
					})
			})
	}

	static searchGoogleApiInverse(lat, lng) {
		var validate = true;
		var country;

		return AddressModel.searchGoogleApiInverse(lat, lng)
			.then(body => {
				var result = JSON.parse(body)
				if (result.status == "ZERO_RESULTS" || result.status == "OVER_QUERY_LIMIT") {
					return new SuccessModel('success', {});
				} else {
					var result = _.first(_.filter(result.results, result => result.address_components.length >= 4 && _.filter(result.address_components, (component) => {return _.filter(component.types , (type) => { return type == 'postal_code'}).length }).length));
					var address_result = new AddressModel('', '', parseFloat(lat), parseFloat(lng), '', '', '', '');
					if(result){
					if (result.formatted_address)
						address_result.address = result.formatted_address;

					_.each(result.address_components, (component) => {
						if (_.find(component.types, (type) => type == 'sublocality_level_1')) {
							address_result.district = component.long_name;
						}
						if (_.find(component.types, (type) => type == 'postal_code')) {
							address_result.zipcode = component.long_name.replace('-', '');
						}
						if (_.find(component.types, (type) => type == 'administrative_area_level_2')) {
							address_result.city = component.long_name;
						}
						if (_.find(component.types, (type) => type == 'administrative_area_level_1')) {
							address_result.state = component.long_name.replace('State of ', '');
							address_result.uf = component.short_name;
						}
						if (_.find(component.types, (type) => type == 'country')) {
							country = component.short_name;
						}
					})

					if (address_result.zipcode && address_result.zipcode.length == 5)
						address_result.zipcode = `${address_result.zipcode}000`;

					if (!address_result.zipcode || !address_result.lat || !address_result.lng || country.toLowerCase() != 'br') {
						validate = false;
					}
					}else{
						validate = false;
					}

					if (!validate) {
						address_result = {};
					}
					return new SuccessModel('success', address_result);
				};
			})
	}
}

module.exports = AddressService;
