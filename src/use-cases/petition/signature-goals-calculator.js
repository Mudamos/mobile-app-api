"use strict";

const SignatureGoalsCalculator = ({ ratio = 1.25 } = {}) => ({ initialGoal, finalGoal, signatureCount }) =>
  new Promise(resolve => {
    signatureCount = Math.abs(signatureCount || 0);
    finalGoal = Math.abs(finalGoal);

    let currentGoal = Math.ceil(Math.abs(initialGoal || ratio));
    let adjust;

    const result = currentSignatureGoal => ({
      currentSignatureGoal,
      finalSignatureGoal: finalGoal,
      initialSignatureGoal: initialGoal,
    });

    /*
     * Double the signature target until the target is greater than the current signature count
     *
     * @example
     *   signatureCount = 58
     *   initialGoal = 15
     *   initialGoal * 2 ^ ceil(ln(signatureCount / initialGoal) / ln(2)) => 60
     *
     *   The target would try 15, 30 and finally 60
     *
     * @see https://www.wolframalpha.com/input/?i=x+*+2+%5E+ceil(ln(y+%2F+x)+%2F+ln(2)) for a visual equation
     *
     * A loop representaion of this equation resolving equal terms is
     * @example
     *   while(true) {
     *     if (signaturesCount >= currentGoal)
     *       currentGoal *= 2
     *     else
     *       return Math.min(currentGoal, finalGoal);
     *   }
     */
    const lowMethod = () => {
      let target = currentGoal * Math.pow(2, Math.ceil(Math.log(signatureCount / currentGoal) / Math.log(2)));
      target = target === signatureCount ? target * 2 : target;

      resolve(result(
        Math.min(finalGoal, Math.ceil(target) || currentGoal)
      ));
    };

    const highMethod = () => {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (signatureCount >= currentGoal) {
          currentGoal = Math.round(currentGoal * ratio)
        } else {
          adjust = currentGoal % 1000;
          adjust = adjust > 0 ? 1000 - adjust : adjust;
          currentGoal = currentGoal + adjust;

          return resolve(result(
            Math.min(currentGoal, finalGoal)
          ));
        }
      }
    };

    currentGoal < 1000 ? lowMethod() : highMethod();
  });

module.exports.SignatureGoalsCalculator = SignatureGoalsCalculator;
