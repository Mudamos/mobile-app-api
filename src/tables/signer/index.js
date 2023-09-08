"use strict";

const memoize = require("lru-memoize").default(1);

const signedMessageTable = require("./signed-message");

module.exports = memoize(sequelize => {
  const SignedMessage = signedMessageTable(sequelize);

  return {
    signedMessagesTable: SignedMessage,
  };
});
