var _ = require('lodash')
	, listErrors = require('../../libs/helpers/errors-list')
	, AddressModel = require('../models/user/address')
	, FailModel = require('../../libs/models/response/fail')
	, SuccessModel = require('../../libs/models/response/success')
	, ValidationModel = require('../../libs/models/response/validation');

const ValidateAttribute = require('../../libs/models/validate/attribute');
const { isEmpty, path } = require("ramda");

const requester = require("request-promise");
const {
  logCreator,
} = require("../../src/services");
const { brazilUFToStateName } = require("../../src/utils");
const config = require("../../config")();
const { logger } = logCreator(config);

const cleanUpHost = host => {
  if (host.endsWith("/")) return host.substring(0, host.length - 1);

  return host;
};

const viaCepHost = cleanUpHost(config("VIA_CEP_API_URL"));

const joinner = (separator = ", ") => (...list) => list.filter(Boolean).join(separator);

class AddressService {

	constructor() { }

	static searchGoogleApi(address) {
		let validate = true;
		let country;
		return ValidationModel.validateRequest('address', 'ErrorAddressSearch', {zipcode: address})
			.then(success => {
				return AddressModel.searchGoogleApi(address)
					.then(body => {
							var result = JSON.parse(body)
						if(result.status == "OVER_QUERY_LIMIT" || result.status == "REQUEST_DENIED"){
              logger.error("Failed to fetch zipcode info on google maps: ", result.status);
							throw new FailModel('fail', 'address', listErrors['ErrorAddressSearch'].message, listErrors['ErrorAddressSearch'].errorCode);
						}else if (result.status == "ZERO_RESULTS" ) {
							var result = {};
							return new SuccessModel('success', result);
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
				const payload = JSON.parse(body)

				if (payload.status == "ZERO_RESULTS" || payload.status == "OVER_QUERY_LIMIT") {
					const result = {};
					return new SuccessModel('success', result);
				} else {
					let result = null;
					const filtered = payload.results.filter(result => result.address_components.length >= 4 && _.filter(result.address_components, (component) => { return _.filter(component.types , (type) => { return type == 'postal_code'}).length }).length);

					if (filtered.length > 1) {
						const { closestElement } = filtered.reduce(({ closestElement, minorDistance }, element) => {
							const element_location = element.geometry.location;
							const distance = Math.sqrt(Math.pow(element_location.lat - lat, 2) + Math.pow(element_location.lng - lng, 2));

							if (distance < minorDistance) {
									return { closestElement: element, minorDistance: distance }
							}

							return { closestElement, minorDistance };
						}, { minorDistance: 999 })

						result = closestElement;
					} else {
						result = filtered && filtered[0];
					}

					var address_result = new AddressModel('', '', parseFloat(lat), parseFloat(lng), '', '', '', '');

					if(result){
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
					} else {
						validate = false;
					}

					if (!validate) {
						address_result = {};
					}

					return new SuccessModel('success', address_result);
				};
			})
	}

  static viaCepSearchByZipCode(zipCode) {
    return requester({
      uri: `${viaCepHost}/ws/${zipCode}/json`,
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
  }

  static async search(address, { skipGoogleMaps = false } = {}) {
    if (!skipGoogleMaps) {
      const googleSearch = await AddressService.searchGoogleApi(address)
        .catch(e => logger.info("[ADDRESS] Google address search api error", address, e));

      logger.info("Google search result", googleSearch);

      const result = path(["data"], googleSearch);
      if (result && !isEmpty(result)) return googleSearch;

      logger.info("[ADDRESS] Fallback to viacep", address);
    }

    return AddressService.viaCepSearchByZipCode(address)
      .then(response => {
        const result = JSON.parse(response);

        const failed = !result || result.erro;
        logger.info("Has failed via cep", failed);

        if (failed) {
          throw new ValidationModel(
            'fail',
            'validation',
            listErrors['ErrorAddressNotFound'].message,
            [new ValidateAttribute("zipcode", listErrors['ErrorAddressNotFound'].message)],
            listErrors['ErrorAddressNotFound'].errorCode
          );
        }

        return new SuccessModel('success', new AddressModel(
          joinner()(joinner(" ")(result.logradouro, result.complemento), result.bairro, joinner(" - ")(result.localidade, result.uf)),
          `${result.cep}`.replace("-", ""),
          null,
          null,
          result.bairro,
          result.localidade,
          brazilUFToStateName(result.uf),
          result.uf
        ));
      })
  }
}

module.exports = AddressService;
