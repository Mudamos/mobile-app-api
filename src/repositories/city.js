"use strict";

const tables = require("../tables");
const { City } = require("../models");

const { rejectIfFalsy } = require("../utils");

const deserializeCity = city => new City({
  id: city.id,
  name: city.name,
  uf: city.uf,
});

const findCityById = ({ citiesTable }) => id =>
  citiesTable
    .findByPk(id)
    .then(rejectIfFalsy())
    .then(deserializeCity);

module.exports = sequelize => {
  return {
    findById: findCityById(tables(sequelize)),
  };
};
