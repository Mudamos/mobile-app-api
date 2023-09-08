var ConfigService = require('../services/config')
  , SendResponse = require('../../libs/helpers/send-response');

module.exports = function (router, passport, app) {
  router.route('/:key')
    .get((req, res)  =>{
      ConfigService.getConfigKey(req.params.key)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });
};
