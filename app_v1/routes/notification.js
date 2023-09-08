var NotificationService = require('../services/notification')
  , SendResponse = require('../../libs/helpers/send-response')
  , LogModel = require('../../libs/models/log/log');  

module.exports = function (router, passport, app) {
   router.route('/confirm/:accessToken')
    .get((req, res)  =>{

      NotificationService.validateNotification(req.params.accessToken)
        .then(function (validation) {
          res.render(NotificationService.getNotificationTemplate(validation.type), { user: validation.user});
        })
        .catch(err => {
          res.render(NotificationService.getNotificationTemplateError(err.data.message.type ? err.data.message.type : err.data.type), {message : err.data});
        });
    });
}
