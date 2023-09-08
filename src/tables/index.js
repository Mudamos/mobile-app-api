"use strict";

const memoize = require("lru-memoize").default(1);

const appConfigTable = require("./app-config");
const batchTable = require("./batch");
const batchVoteTable = require("./batch-vote");
const cityTable = require("./city");
const favoriteTable = require("./favorite");
const petitionTable = require("./petition");
const petitionInfoTable = require("./petition-info");
const petitionMobileTable = require("./petition-mobile");
const profileTable = require("./profile");
const userProfileTable = require("./user-profile");
const userTable = require("./user");
const voteTable = require("./vote");

module.exports = memoize(sequelize => {
  const AppConfig = appConfigTable(sequelize);
  const Batch = batchTable(sequelize);
  const BatchVote = batchVoteTable(sequelize);
  const City = cityTable(sequelize);
  const Favorite = favoriteTable(sequelize);
  const Petition = petitionTable(sequelize);
  const PetitionInfo = petitionInfoTable(sequelize);
  const PetitionMobile = petitionMobileTable(sequelize);
  const Profile = profileTable(sequelize);
  const User = userTable(sequelize);
  const UserProfile = userProfileTable(sequelize);
  const Vote = voteTable(sequelize);

  User.belongsTo(City, { as: "voteCity" });

  return {
    appConfigsTable: AppConfig,
    batchesTable: Batch,
    batchVotesTable: BatchVote,
    citiesTable: City,
    favoriteTable: Favorite,
    petitionsTable: Petition,
    petitionInfoTable: PetitionInfo,
    petitionMobileTable: PetitionMobile,
    profilesTable: Profile,
    usersProfilesTable: UserProfile,
    usersTable: User,
    votesTable: Vote,
  };
});
