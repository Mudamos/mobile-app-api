"use strict";

const {
  allPass,
  prop,
} = require("ramda");

const City = require("./city");

module.exports = user => {
  const voteCity = user.voteCity ? new City(user.voteCity) : null;

  return {
    id: user.id,
    birthday: user.birthday,
    cityName: user.cityName,
    cpf: user.cpf,
    district: user.district,
    hasAcceptedTerms: user.hasAcceptedTerms,
    name: user.name,
    state: user.state,
    uf: user.uf,
    voteCardId: user.voteCardId,
    voteCity,
    zipCode: user.zipCode,
  };
};

module.exports.isUserProfileComplete = ({ user, skipMobile, legacy = false }) => {
  if (!legacy) throw "NotImplemented";

  const isMainProfileComplete = user => user.user_name && user.profile_email;
  const isAvatarProfileComplete = prop("has_saved_avatar");
  const isBirthProfileComplete = user => !!user.user_birthday;
  const isAddressProfileComplete = user => !!user.user_zipcode;
  const isDocumentsProfileComplete = user => user.user_cpf && user.user_voteidcard;
  const isWalletProfileComplete = user => user.user_wallet_id && user.wallet_key;
  const isPhoneProfileComplete = user => user.mobile_id && user.mobile_status;

  const hasMobile = skipMobile ? true : isPhoneProfileComplete(user);
  return hasMobile && allPass([
    isMainProfileComplete,
    isAvatarProfileComplete,
    isBirthProfileComplete,
    isAddressProfileComplete,
    isDocumentsProfileComplete,
    isWalletProfileComplete,
  ], user);
};
