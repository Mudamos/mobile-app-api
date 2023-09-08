"use strict";

const { always, head, map, merge } = require("ramda");
const URL = require("url").URL;
const moment = require("moment");

const tables = require("../tables");
const { User } = require("../models");

const { isBlank, rejectIfFalsy } = require("../utils");

const userLegacyQuery = `
  SELECT
      u.Id AS user_id,
      u.Name AS user_name,
      DATE_FORMAT(u.Birthday, '%Y-%m-%d') AS user_birthday,
      u.VoteIdCard AS user_voteidcard,
      u.CPF AS user_cpf,
      u.ZipCode AS user_zipcode,
      u.State AS user_state,
      u.UF as user_uf,
      u.Lat as user_lat,
      u.Lng as user_lng,
      u.City as user_city,
      u.District as user_district,
      voteCity.id as voteCityId,
      voteCity.name as voteCityName,
      voteCity.uf as voteCityUf,
      c.id as user_city_id,
      DATE_FORMAT(u.Validate, '%Y-%m-%dT%TZ') AS user_validate,
      u.TermsAccepted AS terms_accepted,
      uw.Id AS user_wallet_id,
      uw.WalletId AS wallet_key,
      uw.Status AS wallet_status,
      m.Id AS mobile_id,
      m.Status AS mobile_status,
      m.Number AS mobile_number,
      m.Imei AS mobile_imei,
      m.Brand AS mobile_brand,
      m.Model AS mobile_model,
      m.SO AS mobile_so,
      m.SOVersion AS mobile_so_version,
      m.ScreenSize AS mobile_screensize,
      p.Type AS profile_type,
      p.Email AS profile_email,
      p.ProfileId AS profile_id,
      p.Picture AS profile_picture,
      p.IsAvatar AS has_saved_avatar,
      p.PictureUpdatedAt as picture_updated_at

    FROM user as u

    LEFT JOIN user_wallet as uw ON u.Id = uw.UserId
    LEFT JOIN user_mobile as um ON u.Id = um.UserId
    LEFT JOIN mobile as m ON m.Id = um.MobileId
    LEFT JOIN user_profile as up ON u.id = up.UserId
    LEFT JOIN profile as p ON up.ProfileId = p.Id
    LEFT JOIN city c ON c.name = u.city AND c.uf = u.uf
    LEFT JOIN city voteCity ON voteCity.id = u.voteCityId
`;

const buildUserPictureUrl = ({ profile_picture: picture, picture_updated_at: date }) => {
  if (isBlank(picture)) return;

  const url = new URL(picture);
  url.searchParams.append("updatedAt", moment(date).format("x"));

  return url.toString();
};

const deserializeLegacy = row => merge(row, {
  terms_accepted: Boolean(row.terms_accepted),
  mobile_status: Boolean(row.mobile_status),
  wallet_status: Boolean(row.wallet_status),
  has_saved_avatar: Boolean(row.has_saved_avatar),
  profile_picture: buildUserPictureUrl(row.profile_picture, row.picture_updated_at),
});

const deserializeUser = user => User({
  id: user.id ? String(user.id) : null,
  birthday: user.birthday,
  cityName: user.cityName,
  cpf: user.cpf,
  district: user.district,
  hasAcceptedTerms: user.hasAcceptedTerms,
  name: user.name,
  state: user.state,
  uf: user.uf,
  voteCardId: user.voteCardId,
  voteCity: user.voteCity,
  zipCode: user.zipCode,
});

const findById = ({ citiesTable, usersTable }) => (id, { legacy = false, transaction } = {}) =>
  legacy
    ? findByIdLegacy(usersTable.sequelize)(id, { transaction })
    : usersTable
        .findByPk(id, { transaction, include: [{ model: citiesTable, as: "voteCity", required: false }]})
        .then(rejectIfFalsy())
        .then(deserializeUser);

const findByIdLegacy = sequelize => (id, { transaction } = {}) => {
  const query = `
    ${userLegacyQuery}

    WHERE
      u.Id = ?

    ORDER BY
      u.Id desc,
      m.Id desc,
      p.Type desc,
      uw.Id desc
    LIMIT 1;
  `;

  return sequelize.query(query, { transaction, replacements: [id], type: sequelize.QueryTypes.SELECT })
    .then(head)
    .then(rejectIfFalsy())
};

const findByIdAndTypeLegacy = ({ usersTable }) => (id, type, { transaction } = {}) => {
  const sequelize = usersTable.sequelize;
  const query = `
    ${userLegacyQuery}

    WHERE
      u.Id = ?
      AND p.Type = ?

    ORDER BY
      u.Id desc,
      m.Id desc,
      p.Type desc,
      uw.Id desc
    LIMIT 1;
  `;

  return sequelize.query(query, { transaction, replacements: [id, type], type: sequelize.QueryTypes.SELECT })
    .then(head)
    .then(rejectIfFalsy())
};

const findAllWithZipCodeAndNoAddress = ({ usersTable }) => ({ limit = 100 } = {}) => {
  const { Op } = usersTable.sequelize;

  return usersTable.findAll({
    where: {
      zipcode: {
        [Op.ne]: "",
        [Op.not]: null,
      },
      [Op.and]: [
        {
          [Op.or]: [
            { city: "" },
            { uf: "" },
            { city: { [Op.is] : null }},
            { uf: { [Op.is] : null }},
          ],
        },
      ],
    },
    limit,
    order: [["id", "DESC"]],
  })
  .then(map(deserializeUser));
};

const findAllByEmailOrProfileIdLegacy = ({ usersTable }) => ({ email, profileId }) => {
  const where = () => {
    if (email && profileId) {
      return "p.Email = ? OR p.ProfileId = ?";
    } else if (profileId) {
      return "p.ProfileId = ?";
    } else {
      return "p.Email = ?";
    }
  };

  const query = `
    ${userLegacyQuery}

    WHERE
      ${where()}

    ORDER BY
      u.Id desc,
      m.Id desc,
      p.Type desc,
      uw.Id desc
  `;

  const replacements = [email, profileId].filter(Boolean);
  const sequelize = usersTable.sequelize;

  return sequelize.query(query, { replacements, type: sequelize.QueryTypes.SELECT })
    .map(deserializeLegacy);
};

const create = ({ usersTable }) => ({ name }, { transaction } = {}) =>
  usersTable
    .create({ name }, { transaction })
    .then(deserializeUser);

const updateById = ({ usersTable }) => (id, { transaction } = {}) => attrs =>
  usersTable
    .update(attrs, { transaction, where: { id }})
    .then(always(true));

module.exports = sequelize => {
  return {
    create: create(tables(sequelize)),
    findById: findById(tables(sequelize)),
    findByIdAndTypeLegacy: findByIdAndTypeLegacy(tables(sequelize)),
    findAllByEmailOrProfileIdLegacy: findAllByEmailOrProfileIdLegacy(tables(sequelize)),
    findAllWithZipCodeAndNoAddress: findAllWithZipCodeAndNoAddress(tables(sequelize)),
    transaction: callback => sequelize.transaction(callback),
    updateById: updateById(tables(sequelize)),
  };
};
