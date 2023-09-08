module.exports = (function () {
  function dv(cpf) {
    cpf = cpf.reverse();
    var v1 = 0,
      v2 = 0;

    var i = 0;

    while (i < 9) {
      v1 = v1 + cpf[i] * (9 - (i % 10));
      v2 = v2 + cpf[i] * (9 - ((i + 1) % 10));
      i = i + 1;
    }

    v1 = (v1 % 11) % 10;
    v2 = v2 + v1 * 9;
    v2 = (v2 % 11) % 10;

    return v1 + '' + v2;
  } 

  function format(cpf) {
    if (cpf === undefined) {
      return '';
    }

    cpf = cpf.toString().replace(/\D+/g, '');

    cpf = cpf.replace(/(\d{1,3})(\d{1,3})?(\d{1,3})?(\d{1,2})?/, '$1.$2.$3-$4');

    //Removes simbols at the end
    //Needed for backspace in browsers
    cpf = cpf.replace(/(\D+)$/, '');

    return cpf;
  }

  class Documents {

    constructor() { }

    static formatCPF(cpf) {
      if (cpf === undefined) {
        return '';
      }

      cpf = cpf.toString().replace(/\D+/g, '');

      cpf = cpf.replace(/(\d{1,3})(\d{1,3})?(\d{1,3})?(\d{1,2})?/, '$1.$2.$3-$4');

      cpf = cpf.replace(/(\D+)$/, '');

      return cpf;
    }

    static validateCPF(cpf) {
      cpf = cpf.toString();

      if (/^\d{11}$/.test(cpf)) {
        cpf = format(cpf);
      }

      var re = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

      if (re.test(cpf)) {
        var regex = /^(1{11}|2{11}|3{11}|4{11}|5{11}|6{11}|7{11}|8{11}|9{11})$/;

        if (regex.test(cpf.replace(/\.|-/g, ''))) {
          return false;
        }

        var digs = cpf.split('-')[1],
          nums = cpf.split('-')[0]
            .match(/\d/g);

        if (dv(nums) === digs) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    static validateVoteIdCard(inscricao) {

      var paddedInsc = inscricao;
      //alert("validando inscricao " + paddedInsc);
      var dig1 = 0;
      var dig2 = 0;

      var tam = paddedInsc.length;
      var digitos = paddedInsc.substr(tam - 2, 2);
      var estado = paddedInsc.substr(tam - 4, 2);
      var titulo = paddedInsc.substr(0, tam - 2);
      var exce = (estado == '01') || (estado == '02');
      dig1 = (titulo.charCodeAt(0) - 48) * 9 + (titulo.charCodeAt(1) - 48) * 8 +
        (titulo.charCodeAt(2) - 48) * 7 + (titulo.charCodeAt(3) - 48) * 6 +
        (titulo.charCodeAt(4) - 48) * 5 + (titulo.charCodeAt(5) - 48) * 4 +
        (titulo.charCodeAt(6) - 48) * 3 + (titulo.charCodeAt(7) - 48) * 2;
      var resto = (dig1 % 11);
      if (resto == 0) {
        if (exce) {
          dig1 = 1;
        } else {
          dig1 = 0;
        }
      } else {
        if (resto == 1) {
          dig1 = 0;
        } else {
          dig1 = 11 - resto;
        }
      }

      dig2 = (titulo.charCodeAt(8) - 48) * 4 + (titulo.charCodeAt(9) - 48) * 3 + dig1 * 2;
      resto = (dig2 % 11);
      if (resto == 0) {
        if (exce) {
          dig2 = 1;
        } else {
          dig2 = 0;
        }
      } else {
        if (resto == 1) {
          dig2 = 0;
        } else {
          dig2 = 11 - resto;
        }
      }

      return (digitos.charCodeAt(0) - 48 == dig1) && (digitos.charCodeAt(1) - 48 == dig2);
    }
  }
  return Documents;
})();
