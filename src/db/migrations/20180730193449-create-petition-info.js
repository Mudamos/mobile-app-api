"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable("petition_info", {
      VersionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        unique: true,
      },
      PetitionCreatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      PetitionId:    { type: Sequelize.INTEGER, allowNull: false },
      DocumentUrl:   { type: Sequelize.STRING, allowNull: false },
      PetitionUrl:   { type: Sequelize.STRING, allowNull: false },
      Content:       { type: Sequelize.TEXT, allowNull: false },
      Presentation:  { type: Sequelize.TEXT, allowNull: false },
      TotalSignaturesRequired: { type: Sequelize.INTEGER, allowNull: false },
      CallToAction:  { type: Sequelize.STRING, allowNull: false },
      VideoId:       { type: Sequelize.STRING },
      ShareLink:     { type: Sequelize.STRING },
      PictureOriginalUrl: { type: Sequelize.STRING, allowNull: false },
      PictureThumbUrl:    { type: Sequelize.STRING, allowNull: false },
      PictureHeaderUrl:   { type: Sequelize.STRING, allowNull: false },
      Title:         { type: Sequelize.STRING, allowNull: false },
      Subtitle:      { type: Sequelize.STRING, allowNull: false },
      InitialDate:   { type: Sequelize.DATE, allowNull: false },
      FinalDate:     { type: Sequelize.DATE, allowNull: false },
      ScopeCoverage: { type: Sequelize.STRING, allowNull: false },
      Uf:            { type: Sequelize.STRING },
      Latest:        { type: Sequelize.BOOLEAN, defaultValue: 0, allowNull: false },
      CityId: {
        type: Sequelize.INTEGER,
        references: {
          model: "city",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      SyncAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
    }, {
      charset: "utf8",
    }),

  down: (queryInterface, _Sequelize) =>
    queryInterface.dropTable("petition_info"),
};
