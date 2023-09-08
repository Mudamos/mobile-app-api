var SendResponse = require("../../libs/helpers/send-response")
  , FavoriteService = require("../services/favorites")

const {
  complement,
  isNil,
} = require("ramda");

const isNotNil = complement(isNil)

module.exports = (router, passport, app, { withUser }) => {
  router.route("/update")
    .post(withUser(), (req, res) => {
      if (!req.user) {
        return res.status(401).send("Unauthorized");
      }

      const { petition } = req.body;
      const { userId } = req.user;

      FavoriteService.toggleFavorite(petition, userId)
        .then(result => SendResponse.send(res, result))
        .catch(err => SendResponse.send(res, err))
  });

  router.route('/:petition_id/info')
    .get(withUser(), (req, res) => {
      if (!req.user) {
        return res.status(401).send("Unauthorized");
      }

      const { userId } = req.user;

      FavoriteService.favoriteInfo(req.params.petition_id, { userId })
        .then(result => SendResponse.send(res, result))
        .catch(err => SendResponse.send(res, err));
    });
}
