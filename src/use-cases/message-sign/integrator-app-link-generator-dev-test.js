"use strict";
const crypto = require("crypto");
const { compose, join, map, range } = require("ramda");

const { debug } = require("../../utils");

const generateSignature = ({ message, secret }) =>
  crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");

const encodeMessage = message => Buffer.from(message, "utf8").toString("hex");
const generateHugeMessage = () => compose(join(""), map(String))(range(0, 80));
const getValueOrDefault = (value, defaultFn) => value || defaultFn();

// This use case is only used for development purposes
module.exports.IntegratorAppLinkGeneratorDevTest = ({ config }) => ({ params }) => {
  debug({ params });

  const appId = "rxc";
  const appSecret = config("SIGNER_MESSAGE_INTEGRATOR_SECRET");
  const message = params.messageToSign || "user-666;signed-xyz;we-are-the-final-resistance";
  const encodedMessage = encodeMessage(message);
  const tooLongMessage = generateHugeMessage();
  const tooLongMessageEncodedMessage = encodeMessage(tooLongMessage);

  const firebaseSubdomain = getValueOrDefault(params.firebaseSubdomain, () => config("SIGNER_MESSAGE_DEV_TEST_APP_LINK_FIREBASE_SUBDOMAIN"));
  const androidPackageName = getValueOrDefault(params.androidPackageName, () => config("SIGNER_MESSAGE_DEV_TEST_ANDROID_PACKAGE_NAME"));
  const iosBundleIdentifier = getValueOrDefault(params.iosBundleIdentifier, () => config("SIGNER_MESSAGE_DEV_TEST_IOS_BUNDLE_ID"));
  const appStoreId = getValueOrDefault(params.appStoreId, () => config("SIGNER_MESSAGE_DEV_TEST_IOS_APP_STORE_ID"));

  const signature = generateSignature({ message, secret: appSecret });
  const wrongSignature = generateSignature({ message, secret: appSecret + "wrong" });
  const tooLongSignature = generateSignature({ message: tooLongMessage, secret: appSecret });

  const generateDeeplink = ({ signature, encodedMessage }) => {
    const deeplink = `https://sign.mudamos.org/signlink?message=${encodedMessage}&appid=${appId}&signature=${signature}`;
    const encodedDeepLink = encodeURIComponent(deeplink);
    const url = `https://${firebaseSubdomain}.app.goo.gl/?link=${encodedDeepLink}&apn=${androidPackageName}&ibi=${iosBundleIdentifier}&isi=${appStoreId}&efr=1`;

    return url;
  };

  const url = generateDeeplink({ signature, encodedMessage });
  const wrongSignatureUrl = generateDeeplink({ signature: wrongSignature, encodedMessage });
  const tooLongUrl = generateDeeplink({ signature: tooLongSignature, encodedMessage: tooLongMessageEncodedMessage });

  const urls = [
    { url, name: "Correct applink" },
    { url: wrongSignatureUrl, name: "Invalid signature" },
    { url: tooLongUrl, name: "Invalid too long" },
  ];

  // eg. https://f9d7p.app.goo.gl/?link=https%3A%2F%2Fsign.mudamos.org%2Fsignlink%3Fmessage%3D757365722d3132333b7369676e65642d78797a%26appid%3Drxc%26signature%3Dab19ed7d4c8ba673f06efcc5f51e8d222ce4a1b70a42563ce0c0bb4f192a1342&apn=br.com.tagview.petition.mudamos.beta&ibi=br.com.tagview.mudamosmobile&isi=1214485690&efr=1
  debug("URLs to be used", urls);

  return urls;
};
