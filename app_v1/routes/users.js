var UserService = require('../services/user')
  , ProfileService = require('../services/profile')
  , MessageService = require('../services/message')
  , SendResponse = require('../../libs/helpers/send-response')
  , Sign = require('../../libs/helpers/sign')
  , LogModel = require('../../libs/models/log/log');

module.exports = function (router, passport, app) {

  router.route('/sign_up')
    .post((req, res) => {
      if (req.headers && req.headers.authorization)
        UserService.updateUserLogin(req.body.user, req.headers.authorization.split(" ")[1])
          .then(result => {
            SendResponse.send(res, result);
          })
          .catch(err => {
            SendResponse.send(res, err);
          })
      else {
        UserService.createUserLogin(req.body.user, req.body.petition || null)
          .then(result => {
            SendResponse.send(res, result);
          })
          .catch(err => {
            SendResponse.send(res, err);
          })
      }
    });

  router.route('/message/:plip_id')
    .get((req, res) => {
      passport.authenticate('bearer', { session: false }, function (err, user, info) {
        if (user == false) {
          res.status(401).send('Unauthorized');
        } else {
          MessageService.getMessagePlipByUser(req.params.plip_id, req.headers.authorization.split(" ")[1])
            .then(result => {
              SendResponse.send(res, result);
            })
            .catch(err => {
              SendResponse.send(res, err);
            })
        }
      })(req, res);
    });

  router.route('/password/reset/')
    .post((req, res) => {
      UserService.resetPassword(req.body.user)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });


  router.route('/resend_validation/')
    .post((req, res) => {
      UserService.reSendValidation(req.body.user)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/remove/account/')
    .post((req, res) => {
      UserService.removeAccount(req.body.user)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/password/update/')
    .post((req, res) => {
      if (req.headers && req.headers.authorization) {
        passport.authenticate('bearer', { session: false }, function (err, user, info) {
          if (user == false) {
            res.status(401).send('Unauthorized');
          } else {
            UserService.updatePassword(req.body.user, req.headers.authorization.split(" ")[1])
              .then(result => {
                SendResponse.send(res, result);
              })
              .catch(err => {
                SendResponse.send(res, err);
              })
          }
        })(req, res);
      } else {
        UserService.updateUserPasswordPinCode(req.body.user)
          .then(result => {
            SendResponse.send(res, result);
          })
          .catch(err => {
            SendResponse.send(res, err);
          })
      }
    });

  router.route('/profile/update')
    .post((req, res) => {
      passport.authenticate('bearer', { session: false }, function (err, user, info) {
        if (user == false) {
          res.status(401).send('Unauthorized');
        } else {
          ProfileService.updateUserProfile(req.body.user, req.headers.authorization.split(" ")[1])
            .then(result => {
              SendResponse.send(res, result);
            })
            .catch(err => {
              SendResponse.send(res, err);
            })
        }
      })(req, res);
    });

  router.route('/email/update')
    .post((req, res) => {
      if (!req.headers.authorization || req.headers.authorization.split(" ").length > 1) {
        passport.authenticate('bearer', { session: false }, function (err, user, info) {
          if (user == false) {
            res.status(401).send('Unauthorized');
          } else {
            ProfileService.updateUserEmail(req.body.user, req.headers.authorization.split(" ")[1])
              .then(result => {
                SendResponse.send(res, result);
              })
              .catch(err => {
                SendResponse.send(res, err);
              })
          }
        })(req, res);
      } else {
        if (req.headers.authorization != config.get('AUTHORIZATION_KEY')) {
          res.status(401).send('Unauthorized');
        } else {
          ProfileService.updateUserEmailRootAuthorization(req.body.user, req.headers.authorization)
            .then(result => {
              SendResponse.send(res, result);
            })
            .catch(err => {
              SendResponse.send(res, err);
            })
        }
      }
    });

  router.route('/recovery')
    .post((req, res) => {
      if (!req.headers.authorization || req.headers.authorization != config.get('AUTHORIZATION_KEY')) {
        res.status(401).send('Unauthorized');
      } else {
        ProfileService.recovery(req.body.user, req.body.score)
          .then(result => {
            SendResponse.send(res, result);
          })
          .catch(err => {
            SendResponse.send(res, err);
          })
      }
    });

  router.route('/count')
    .get((req, res) => {
      UserService.count()
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });
}
