var UserService = require('../services/user')
  , ProfileService = require('../services/profile')
  , SendResponse = require('../../libs/helpers/send-response')
  , Sign = require('../../libs/helpers/sign');

module.exports = function (router, passport, app, { withUser }) {
  router.route('/sign_up')
    .post((req, res) => {
      if (req.headers && req.headers.authorization) {
        UserService.updateUserLogin(req.body.user, req.headers.authorization.split(" ")[1])
          .then(result => {
            SendResponse.send(res, result);
          })
          .catch(err => {
            SendResponse.send(res, err);
          })
      } else {
        var message = '';
        if (req.body.user && req.body.user.cpf && req.body.user.email && req.body.user.password && req.body.user.termsAccepted)
          message = `${req.body.user.cpf};${req.body.user.email};${req.body.user.password};${req.body.user.termsAccepted}`;

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

    router.route('/search')
      .get((req, res) => {
        UserService.findUser(req.query)
          .then(result => {
            SendResponse.send(res, result);
          })
          .catch(err => {
            SendResponse.send(res, err);
          })
      });

    router.route('/petitions')
      .get(withUser(), (req, res) => {
        UserService.getPetitions(req.user)
          .then(result => {
            SendResponse.send(res, result);
          })
          .catch(err => {
            SendResponse.send(res, err);
          })
      });
}
