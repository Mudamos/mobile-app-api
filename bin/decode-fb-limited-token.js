"use strict";

/*
 * This file should be run by a higher node version.
 * eg. node 10.18.0
 *
 * This won't work on node 7.
 *
 * See `src/use-cases/fb-limited-auth/index.js` for more information.
 */

const jsonwebtoken = require("jsonwebtoken")
const jwksClient = require("jwks-rsa");
const { promisify } = require("util");

const client = jwksClient({
  jwksUri: "https://www.facebook.com/.well-known/oauth/openid/jwks/",
});

const verifyToken = promisify(jsonwebtoken.verify);

const getKey = (client) => (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = err ? null : key.publicKey || key.rsaPublicKey;
    callback(err, signingKey);
  });
};

const [token] = process.argv.slice(2);

const verify = async (token) => {
  const decodedToken = await verifyToken(token, getKey(client));
  // Send result to STDOUT
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(decodedToken));
};

verify(token);
