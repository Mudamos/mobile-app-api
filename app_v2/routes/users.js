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
        var message = '';
        if (req.body.user && req.body.user.name && req.body.user.email && req.body.user.password)
          message = `${req.body.user.name};${req.body.user.email};${req.body.user.password}`;

        Sign.verifyMineMessage(message, req.body.block || "")
          .then(success => {
            if (!success) {
              res.status(401).send('Unauthorized')
            } else {
              UserService.createUserLogin(req.body.user, req.body.petition || null)
                .then(result => {
                  SendResponse.send(res, result);
                })
                .catch(err => {
                  SendResponse.send(res, err);
                })
            }
          })
      }
    });

  router.route('/password/reset/')
    .post((req, res) => {
      const minedParam = req.body.user.cpf || req.body.user.email;

      Sign.verifyMineMessage(minedParam, req.body.block || "")
        .then(success => {
          if (!success) {
            res.status(401).send('Unauthorized')
          } else {
            UserService.resetPassword(req.body.user)
              .then(result => {
                SendResponse.send(res, result);
              })
              .catch(err => {
                SendResponse.send(res, err);
              })
          }
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
        Sign.verifyMineMessage(`${req.body.user.password};${req.body.user.pincode}`, req.body.block || "")
          .then(success => {
            if (!success) {
              res.status(401).send('Unauthorized')
            } else {
              UserService.updateUserPasswordPinCode(req.body.user)
                .then(result => {
                  SendResponse.send(res, result);
                })
                .catch(err => {
                  SendResponse.send(res, err);
                })
            }
          })
      }
    });
}
