const ProfileService = require('../services/profile')
  , SendResponse = require('../../libs/helpers/send-response')
  , LogModel = require('../../libs/models/log/log');

module.exports = (router, passport, app) => {

  router.use(passport.authenticate('bearer', { session: false }));

  router.route('/')
    .get((req, res)  =>{
      ProfileService.validateUser(req.headers.authorization.split(' ')[1])
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });
}
