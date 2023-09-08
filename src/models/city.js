"use strict";

module.exports = class City {
  constructor(props = {}) {
    this.id = props.id;
    this.name = props.name;
    this.uf = props.uf;
  }
};
