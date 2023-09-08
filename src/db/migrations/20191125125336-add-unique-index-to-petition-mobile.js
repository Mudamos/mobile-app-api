"use strict";

module.exports = {
  up: (queryInterface, _Sequelize) =>
    queryInterface.addIndex("petition_mobile", {
      fields: ["userId", "petitionId"],
      unique: true,
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.removeIndex("petition_mobile", ["userId", "petitionId"]),
};

