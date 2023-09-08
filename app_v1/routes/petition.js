var MessageService = require('../services/message')
  , SendResponse = require('../../libs/helpers/send-response')
  , PetitionService = require('../services/petition')
  , MobileService = require('../services/mobile')
  , LogModel = require('../../libs/models/log/log')
  , config = require('nconf')
  , SuccessModel = require('../../libs/models/response/success')

const signatureGoals = ({ final_goal, initial_goal }) =>
  [final_goal, initial_goal].map(n => Math.abs(parseInt(n, 10)));

module.exports = function (router, passport, app, {
  plipMobileValidationSender,
  plipMobileValidationVerifier,
  requiresMobileValidation,
  withUser,
}) {

  router.route("/plip/:plipId/requires_mobile_validation")
    .post(withUser(), (req, res) => {
      if (!req.user) {
        return res.status(401).send("Unauthorized");
      }

      const { params: { plipId }, body: { deviceUniqueId } } = req;

      requiresMobileValidation({ plipId, userId: req.user.userId, deviceUniqueId })
        .then(result => SendResponse.send(res, result))
        .catch(error => SendResponse.send(res, error));
    });

  router.route("/plip/:plipId/send_mobile_verification")
    .post(withUser(), (req, res) => {
      if (!req.user) {
        return res.status(401).send("Unauthorized");
      }

      const { deviceUniqueId, phone } = req.body;
      const { plipId } = req.params;

      plipMobileValidationSender({ deviceUniqueId, plipId, userId: req.user.userId, phone })
        .then(result => SendResponse.send(res, result))
        .catch(error => SendResponse.send(res, error));
    });

  router.route("/plip/:plipId/verify_mobile")
    .post(withUser(), (req, res) => {
      if (!req.user) {
        return res.status(401).send("Unauthorized");
      }

      const { phone, pinCode } = req.body;
      const { plipId } = req.params;

      plipMobileValidationVerifier({ plipId, userId: req.user.userId, phone, pinCode })
        .then(result => SendResponse.send(res, result))
        .catch(error => SendResponse.send(res, error));
    });

  router.route('/:version_id/info')
    .get(withUser(), (req, res) => {
      const { cityName, uf } = (req.user || {});
      const [finalGoal, initialGoal] = signatureGoals(req.query);

      MessageService.getMessagePlipVersionById(req.params.version_id, { cityName, finalGoal, initialGoal, uf })
        .then(result => SendResponse.send(res, result))
        .catch(err => SendResponse.send(res, err));
    });

  router.route('/plip/:plip_id/info')
    .get(withUser(), (req, res) => {
      const { cityName, uf } = (req.user || {});
      const [finalGoal, initialGoal] = signatureGoals(req.query);

      MessageService.getMessagePlipById(req.params.plip_id, { cityName, finalGoal, initialGoal, uf })
        .then(result => SendResponse.send(res, result))
        .catch(err => SendResponse.send(res, err));
    });

  router.route('/plip/:plip_id/versions')
    .get((req, res) => {
      MessageService.getVersionPlipById(req.params.plip_id)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/:version_id/:limit/votes')
    .get((req, res) => {
      MessageService.getMessagePlip(req.params.version_id, req.params.limit)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/:version_id/:limit/votes/blockchain')
    .get((req, res) => {
      MessageService.getMessagePlipBlockchain(req.params.version_id, req.params.limit)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/register')
    .post((req, res) => {
      if (!req.headers.authorization || req.headers.authorization != config.get('AUTHORIZATION_KEY')) {
        res.status(401).send('Unauthorized');
      } else {
        PetitionService.register(req.body.petition)
          .then(result => {
            SendResponse.send(res, result);
          })
          .catch(err => {
            SendResponse.send(res, err);
          })
      }
    });

  router.route('/:digest/status')
    .get((req, res) => {
      PetitionService.status(req.params.digest)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/:plip_id/signatures')
    .get((req, res) => {
      PetitionService.findAllBlockchainSignaturesProcessed(req.params.plip_id)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route('/:version_id/:group/votes/friends')
    .get((req, res) => {

      if (req.headers && req.headers.authorization) {
        if (req.params.group == 'true') {
          var result = {
            "users": {
              "Outros": [
                {
                  "id": "19428",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/19428.jpg",
                  "name": "Andréa C. L. Oliveira ",
                  "signedAt": "2017-04-15 03:43:13"
                },
                {
                  "id": "82108",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg",
                  "name": "Paulo Douglas Teles Pereira",
                  "signedAt": "2017-04-12 17:32:18"
                },
                {
                  "id": "84351",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/84351.jpg",
                  "name": "Acacio Soares de Carvalho ",
                  "signedAt": "2017-04-12 23:54:52"
                },
                {
                  "id": "118590",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/118590.jpg",
                  "name": "alexandre Passini ",
                  "signedAt": "2017-04-27 22:48:28"
                },
                {
                  "id": "129019",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/129019.jpg",
                  "name": "Marcelo Batista de Almeida",
                  "signedAt": "2017-05-10 02:07:24"
                },
                {
                  "id": "145477",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg",
                  "name": "Alexandre Freitas Azambuja",
                  "signedAt": "2017-05-10 09:54:38"
                }
              ]
            }
          };

          SendResponse.send(res, new SuccessModel('success', result));
          // MessageService.getMessagePlipUserFriendsGroup(req.params.version_id, req.headers.authorization.split(" ")[1])
          //   .then(result => {
          //     SendResponse.send(res, result);
          //   })
          //   .catch(err => {
          //     SendResponse.send(res, err);
          //   });
        } else {
          var result = {
            "users": [
              {
                "id": "19428",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/19428.jpg"
              },
              {
                "id": "10207184099639531",
                "pictureUrl": "https://graph.facebook.com/v3.2/10207184099639531/picture?type=large"
              },
              {
                "id": "82108",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              },
              {
                "id": "84351",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/84351.jpg"
              },
              {
                "id": "118590",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/118590.jpg"
              },
              {
                "id": "1297368170361059",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              },
              {
                "id": "129019",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/129019.jpg"
              },
              {
                "id": "1343292109099051",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              },
              {
                "id": "145477",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              },
              {
                "id": "792807677562942",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              }
            ],
            "total": 10
          };

          SendResponse.send(res, new SuccessModel('success', result));
          // MessageService.getMessagePlipUserFriends(req.params.version_id, req.headers.authorization.split(" ")[1])
          //   .then(result => {
          //     SendResponse.send(res, result);
          //   })
          //   .catch(err => {
          //     SendResponse.send(res, err);
          //   });
        }
      } else {
        if (req.params.group == 'true') {
          var result = {
            "users": {
              "Outros": [
                {
                  "id": "84351",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/84351.jpg",
                  "name": "Acacio Soares de Carvalho ",
                  "signedAt": "2017-04-12 23:54:52"
                },
                {
                  "id": "145477",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg",
                  "name": "Alexandre Freitas Azambuja",
                  "signedAt": "2017-05-10 09:54:38"
                },
                {
                  "id": "118590",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/118590.jpg",
                  "name": "alexandre Passini ",
                  "signedAt": "2017-04-27 22:48:28"
                },
                {
                  "id": "129019",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/129019.jpg",
                  "name": "Marcelo Batista de Almeida",
                  "signedAt": "2017-05-10 02:07:24"
                },
                {
                  "id": "115853",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg",
                  "name": "Manoel Pereira da Silva Martins ",
                  "signedAt": "2017-04-25 01:36:31"
                },
                {
                  "id": "107986",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/107986.jpg",
                  "name": "António de padua toscano barreto",
                  "signedAt": "2017-04-20 18:04:37"
                },
                {
                  "id": "131096",
                  "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg",
                  "name": "Ruth Maria de Oliveira Pantoja ",
                  "signedAt": "2017-05-08 12:31:36"
                }
              ]
            }
          };

          SendResponse.send(res, new SuccessModel('success', result));

          // MessageService.getMessagePlipUserGroup(req.params.version_id)
          //   .then(result => {
          //     SendResponse.send(res, result);
          //   })
          //   .catch(err => {
          //     SendResponse.send(res, err);
          //   });

        } else {
          var result = {
            "users": [
              {
                "id": "145477",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              },
              {
                "id": "118590",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/118590.jpg"
              },
              {
                "id": "1343292109099051",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              },
              {
                "id": "1297368170361059",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              },
              {
                "id": "129019",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/129019.jpg"
              },
              {
                "id": "792807677562942",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              },
              {
                "id": "115853",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              },
              {
                "id": "107986",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/107986.jpg"
              },
              {
                "id": "131096",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              },
              {
                "id": "10154634446359071",
                "pictureUrl": "https://s3-sa-east-1.amazonaws.com/mudamos-images/images/profile/pictures/picture_defaul_normal.jpg"
              }
            ],
            "total": 10
          };

          SendResponse.send(res, new SuccessModel('success', result));
          // MessageService.getMessagePlipUsers(req.params.version_id)
          //   .then(result => {
          //     SendResponse.send(res, result);
          //   })
          //   .catch(err => {
          //     SendResponse.send(res, err);
          //   });

        }
      }
    });
}
