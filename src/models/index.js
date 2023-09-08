"use strict";

const UserProfile = require("./user-profile");
const { UserProfileJoinTable } = require("./user-profile");

module.exports = {
  AppConfig: require("./app-config"),
  Batch: require("./batch"),
  BatchVote: require("./batch-vote"),
  City: require("./city"),
  Favorite: require("./favorite"),
  PaginatedResult: require("./paginated-result"),
  Petition: require("./petition"),
  PetitionInfo: require("./petition-info"),
  PetitionMobile: require("./petition-mobile"),
  Profile: require("./profile"),
  User: require("./user"),
  UserProfile,
  UserProfileJoinTable,
  Vote: require("./vote"),
};
