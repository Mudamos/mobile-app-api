let chance = new require('chance')();
module.exports = Object.defineProperties({}, {
    'VALID': {
        get() {
            return {"user":{"cpf":chance.cpf().replace(/\./g, '').replace('-', ''),"voteidcard":generateVoteIdCard(),"termsAccepted":true}}
        }
    }
});

function generateVoteIdCard() {
  let numero = [];

  for (i = 0; i <= 7; i++) {
    numero[i] = Math.floor(Math.random() * 9);
  }

  numero[9] = Math.floor(Math.random() * 2);
  numero[10] = Math.floor(Math.random() * 8);

  let firstSum = ((numero[0] * 2) +
    (numero[1] * 3) +
    (numero[2] * 4) +
    (numero[3] * 5) +
    (numero[4] * 6) +
    (numero[5] * 7) +
    (numero[6] * 8) +
    (numero[7] * 9));
  let firstPart = Math.floor(firstSum / 11);
  let secondPart = (firstPart * 11);
  let firstDigit = (firstSum - secondPart);
  if (firstDigit > 9) firstDigit = 0;
  let soma2 = ((numero[9] * 7) +
    (numero[10] * 8) +
    (firstDigit * 9));
  parte3 = Math.floor(soma2 / 11);
  parte4 = (parte3 * 11);
  dig2 = (soma2 - parte4);
  if (dig2 > 9) dig2 = 0;

  return `${numero.join('')}${firstDigit}${dig2}`;
}