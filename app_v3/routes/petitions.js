var SendResponse = require("../../libs/helpers/send-response")
  , PetitionService = require("../services/petitions")

const {
  complement,
  isNil,
} = require("ramda");

const {
  isDefaultScope,
} = require("../../src/models").Petition;

const isNotNil = complement(isNil)
const isTrue = v => /^(true)$/i.test(String(v));
const isValidScope = v => /^(all|causes)$/i.test(String(v)) || isDefaultScope(String(v));

const searchAttributes = ({ scope, includeCauses, page, limit, city, uf, search, path }) => ({
  scope: isValidScope(scope) ? scope : "all",
  includeCauses: isTrue(includeCauses),
  page: parseInt(page, 10) || 0,
  limit: parseInt(limit, 10) || 10,
  city,
  uf,
  search,
  path,
});

module.exports = (router, passport, app, { requiresMudamosWebAuth, withUser }) => {
  router.route("/sync")
    .post(requiresMudamosWebAuth(), (req, res) => {
      PetitionService.insertInfo(req.body.plip)
        .then(result => {
          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        });
    });

  router.route("/pagination")
    .get((req, res) => {
      const searchedParams = searchAttributes(req.query);

      PetitionService.plipsPaginated(searchedParams)
        .then(({ nextPage, page, result }) => {
          isNotNil(page) && res.set({ 'X-Page': page });
          isNotNil(nextPage) && res.set({ 'X-Next-Page': nextPage });

          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route("/pagination/sign")
    .get(withUser(), (req, res) => {
      const searchedParams = searchAttributes(req.query);
      const { voteCardId } = (req.user || {});

      PetitionService.userSignedPlipsPaginated(searchedParams, voteCardId)
        .then(({ nextPage, page, result }) => {
          isNotNil(page) && res.set({ 'X-Page': page });
          isNotNil(nextPage) && res.set({ 'X-Next-Page': nextPage });

          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });

  router.route("/pagination/favorite")
    .get(withUser(), (req, res) => {
      const searchedParams = searchAttributes(req.query);
      const { userId } = (req.user || {});

      PetitionService.userFavoritePlipsPaginated(searchedParams, userId)
        .then(({ nextPage, page, result }) => {
          isNotNil(page) && res.set({ 'X-Page': page });
          isNotNil(nextPage) && res.set({ 'X-Next-Page': nextPage });

          SendResponse.send(res, result);
        })
        .catch(err => {
          SendResponse.send(res, err);
        })
    });
}
