const { always } = require("ramda");

var MessageService = require('../services/message')
  , SendResponse = require('../../libs/helpers/send-response')
  , LogModel = require('../../libs/models/log/log')
  , TraceModel = require('../../libs/models/log/trace');

module.exports = function (router, passport, app, { logger, customMessageSignRegister, validateCustomMessageSign, withUser }) {

  router.post("/sign/custom", withUser({ includeLegacy: true }), (req, res) => {
    const user = req.legacyUser;
    const { integrator, message } = req.body;
    logger.debug("sign message:", message);

    validateCustomMessageSign({ integrator, message, user })
      .then(data => customMessageSignRegister({ message, userId: user.user_id, integratorId: integrator.appId, result: data }).then(always(data)))
      .then(data => res.json({ status: "success", data }))
      .catch(error => {
        if (error.status === "fail") {
          return res.json(error);
        }

        return res.sendStatus(500);
      });
  });

  router.route('/sign')
    .post((req, res) => {
      passport.authenticate('bearer', { session: false }, function (err, user, info) {
        if (user == false) {
          res.status(401).send('Unauthorized');
        } else {
          var ipClient = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          MessageService.signMessage(req.body.signMessage, req.headers.authorization.split(" ")[1], ipClient)
            .then(result => {
              SendResponse.send(res, result);
            })
            .catch(err => {
              SendResponse.send(res, err);
            })
        }
      })(req, res);
    });

  router.route('/blockchain/status')
    .post((req, res) => {
      MessageService.signatureBlockchainStatus(req.body.sign)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    })
};
