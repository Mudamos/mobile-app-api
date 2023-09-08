"use strict";

module.exports = {
  up: (queryInterface, _Sequelize) =>
    Promise.all([
      queryInterface.addIndex("city", {
        fields: ["name"],
      }),
      queryInterface.addIndex("city", {
        fields: ["uf"],
      }),
    ]),
  down: (queryInterface, _Sequelize) =>
    Promise.all([
      queryInterface.removeIndex("city", ["name"]),
      queryInterface.removeIndex("city", ["uf"]),
    ]),
};
