"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize => {
  const PetitionInfo = sequelize.define("petitionInfo", {
    versionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    petitionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    requiresMobileValidation: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
  }, {
    tableName: "petition_info",
    timestamps: false,
  });

  PetitionInfo.removeAttribute("id");

  return PetitionInfo;
};
