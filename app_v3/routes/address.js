var AddressService = require('../services/address')
  , SendResponse = require('../../libs/helpers/send-response')
  , LogModel = require('../../libs/models/log/log');

module.exports = function (router, passport, app) {
  router.route('/search/:lat/:lng/inverse')
    .get((req, res)  =>{
      AddressService.searchGoogleApiInverse(req.params.lat, req.params.lng)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    })
};
