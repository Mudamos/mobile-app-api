const { prop } = require('ramda');

var ProfileService = require('../services/profile')
  , MobileService = require('../services/mobile')
  , SendResponse = require('../../libs/helpers/send-response')
  , LogModel = require('../../libs/models/log/log')
  , multer = require('multer')
  , upload = multer({ dest: 'upload/' });

module.exports = function (router, passport, app) {

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

  router.route('/vote_address')
    .post((req, res) => {
      const city = prop('city', req.body.user);

      ProfileService.updateUserVoteCity(city, req.headers.authorization.split(" ")[1])
        .then(result => SendResponse.send(res, result))
        .catch(err => SendResponse.send(res, err));
    });

  router.route('/birthday')
    .post((req, res)  =>{
      ProfileService.updateUserBirthday(req.body.user, req.headers.authorization.split(" ")[1])
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/zipcode')
    .post((req, res)  =>{
      ProfileService.updateUserZipCode(req.body.user, req.headers.authorization.split(" ")[1]).then(result => {
        SendResponse.send(res, result);
      })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/documents')
    .post((req, res)  =>{
      ProfileService.updateUserDocuments(req.body.user, req.headers.authorization.split(" ")[1]).then(result => {
        SendResponse.send(res, result);
      })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/mobile_pin')
    .post((req, res)  =>{
      MobileService.createMobileAndPinCode(req.body.mobile, req.headers.authorization.split(" ")[1])
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/mobile')
    .post((req, res)  =>{
      MobileService.updateMobile(req.body.mobile, req.headers.authorization.split(" ")[1])
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/wallet')
    .post((req, res)  =>{
      ProfileService.insertUserWallet(req.body.user, req.headers.authorization.split(" ")[1])
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/photo')
    .post(upload.fields([{ name: 'file', maxCount: 1 }]), function (req, res) {
      ProfileService.setUserPhoto(req.files.file ? req.files.file[0] : undefined , req.body.avatar_url, req.headers.authorization.split(" ")[1])
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });
}
