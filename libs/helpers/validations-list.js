var validator = require('validator')
	, Document = require('./documents')
	, moment = require('moment');

const {
	allPass,
  anyPass,
	complement,
	isEmpty,
  isNil,
	pipe,
	props,
  test,
	values,
} = require("ramda");

const isNotNil = complement(isNil);
const isNotEmpty = complement(isEmpty);
const isNotPresent = anyPass([isNil, isEmpty]);
const isPresent = allPass([isNotNil, test(/\S/)]);

let Validations = {
  plipRequiresValidation: {
    userId: {
      message: 'Usuário inválido',
      validate: value => isPresent(value),
    },
    plipId: {
      message: 'Projeto inválido',
      validate: value => isPresent(value),
    },
    deviceUniqueId: {
      message: 'Código do dispositivo inválido',
      validate: value => isPresent(value),
    },
  },
  userVoteAddress: {
    id: {
      message: 'Cidade inválida',
      validate: isPresent,
    },
    name: {
      message: 'Nome da cidade inválido',
      validate: isPresent,
    },
    uf: {
      message: 'Estado inválido',
      validate: isPresent,
    },
  },
  plipMobileValidationSender: {
    deviceUniqueId: {
      message: 'Código do dispositivo inválido',
      validate: value => isPresent(value),
    },
    userId: {
      message: 'Usuário inválido',
      validate: value => isPresent(value),
    },
    plipId: {
      message: 'Projeto inválido',
      validate: value => isPresent(value),
    },
    phone: {
      message: 'Telefone inválido',
      validate: value => isPresent(value) && validator.isNumeric(value) && validator.isLength(value, { min: 10, max: 11 }),
    },
  },
	'userProfile': {
		'name': {
			message: 'Nome inválido'
			, validate: (value) => !validator.isEmpty(value)
		}
		, 'zipcode': {
			message: 'Cep inválido'
			, validate: (value) => validator.isNumeric(value) && validator.isLength(value, { max: 8, min: 8 })
		}
		// 'district': {
		// 	message: 'Bairro inválido'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { max: 100, min: 1 })
		// },
		// 'state': {
		// 	message: 'Estado inválido'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { max: 60, min: 1 })
		// },
		// 'uf': {
		// 	message: 'UF inválida'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { max: 2, min: 2 })
		// },
		// 'city': {
		// 	message: 'Cidade inválida'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { max: 60, min: 1 })
		// },
		// 'lat': {
		// 	message: 'Latitude inválida'
		// 	, validate: (value) => validator.isFloat(value.toString())
		// },
		// 'lng': {
		// 	message: 'Longitude inválida'
		// 	, validate: (value) => validator.isFloat(value.toString())
		// }
		, 'birthday': {
			message: 'Data de Nascimento inválida'
			, validate: (value) => moment(value, ["YYYY-MM-DD"]).isValid() && validator.isLength(value, { max: 10 }) && moment().diff(value, 'years') >= 16
		}
	},
	'userInfo': {
		'birthday': {
			message: 'Data de Nascimento inválida',
			validate: (value) => validator.isEmpty(value.toString()) || moment(value, ["YYYY-MM-DD"]).isValid() && validator.isLength(value, { max: 10 }) && moment().diff(value, 'years') >= 16
		},
		'voteidcard': {
			message: 'Título de eleitor inválido',
			validate: (value) => validator.isEmpty(value.toString()) || validator.isLength(value, { max: 12, min: 12 }) && Document.validateVoteIdCard(value)
		},
		'zipcode': {
			message: 'Cep inválido',
			validate: (value) => validator.isEmpty(value.toString()) || validator.isNumeric(value) && validator.isLength(value, { max: 8, min: 8 })
		},
	},
	'userPhoto': {
		'avatar': {
				message: 'Foto não enviada'
				, validate: (value) => !(validator.isEmpty(value.filename) && validator.isEmpty(value.avatar_url))
		}
	},
	'user': {
		'name': {
			message: 'Nome inválido'
			, validate: (value) => !validator.isEmpty(value)
		}
		, 'email': {
			message: 'Email inválido'
			, validate: (value) => validator.isEmail(value)
		}
		, 'password': {
			message: 'Senha inválida'
			, validate: (value) => !validator.isEmpty(value.trim()) && validator.isLength(value.trim(), { min: 1, max: 80 })
		}
	},
	'userSignUp': {
		'cpf': {
      message: 'CPF inválido'
      , validate: (value) => validator.isLength(value, { max: 11, min: 11 }) && Document.validateCPF(value)
    }
		, 'email': {
			message: 'Email inválido'
			, validate: (value) => validator.isEmail(value)
		}
		, 'password': {
			message: 'Senha inválida'
			, validate: (value) => !validator.isEmpty(value.trim()) && validator.isLength(value.trim(), { min: 1, max: 80 })
		}
		, 'termsAccepted': {
			message: 'Termo de aceite inválido'
			, validate: (value) => !validator.isEmpty(value.toString())
		}
	},
	'userSignUpUpdate': {
		'cpf': {
      message: 'CPF inválido'
      , validate: (value) => validator.isLength(value, { max: 11, min: 11 }) && Document.validateCPF(value)
    }
		, 'email': {
			message: 'Email inválido'
			, validate: (value) => validator.isEmpty(value.toString()) || validator.isEmail(value)
		}
		, 'termsAccepted': {
			message: 'Termo de aceite inválido'
			, validate: (value) => !validator.isEmpty(value.toString())
		}
	},
	'userPassword': {
		'currentPassword': {
			message: 'Senha atual inválida'
			, validate: (value) => !validator.isEmpty(value)
		}
		, 'newPassword': {
			message: 'Nova senha inválida'
			, validate: (value) => !validator.isEmpty(value)
		}
	},
	'userPasswordPinCode': {
		'pincode': {
			message: 'Pincode inválido'
			, validate: (value) => validator.isNumeric(value) && validator.isLength(value, { min: 5, max: 5 })
		}
		, 'password': {
			message: 'Senha inválida'
			, validate: (value) => !validator.isEmpty(value)
		}
	},
	'userUpdate': {
		'name': {
			message: 'Nome inválido'
			, validate: (value) => !validator.isEmpty(value)
		},
		'email': {
			message: 'Email inválido'
			, validate: (value) => validator.isEmail(value)
		}
	},
	'userProfileEmail': {
		'profile_email': {
			message: 'Email inválido'
			, validate: (value) => validator.isEmail(value)
		}
	},
	'birthday': {
		'birthday': {
			message: 'Data de Nascimento inválida'
			, validate: (value) => moment(value, ["YYYY-MM-DD"]).isValid() && validator.isLength(value, { max: 10 }) && moment().diff(value, 'years') >= 16
		}
	},
	'address': {
		'zipcode': {
			message: 'Cep inválido'
			, validate: (value) => validator.isNumeric(value) && validator.isLength(value, { max: 8, min: 8 })
		},
	},
	'zipcode': {
		'zipcode': {
			message: 'Cep inválido'
			, validate: (value) => validator.isNumeric(value) && validator.isLength(value, { max: 8, min: 8 })
		},
		// 'district': {
		// 	message: 'Bairro inválido'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { max: 100, min: 1 })
		// },
		// 'state': {
		// 	message: 'Estado inválido'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { max: 60, min: 1 })
		// },
		// 'uf': {
		// 	message: 'UF inválida'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { max: 2, min: 2 })
		// },
		// 'city': {
		// 	message: 'Cidade inválida'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { max: 60, min: 1 })
		// },
		'lat': {
			message: 'Latitude inválida'
			, validate: (value) => isNotPresent(value) || validator.isFloat(value.toString())
		},
		'lng': {
			message: 'Longitude inválida'
			, validate: (value) => isNotPresent(value) || validator.isFloat(value.toString())
		}
	},
	'cpf': {
		'cpf': {
			message: 'CPF inválido'
			, validate: (value) => validator.isLength(value, { max: 11, min: 11 }) && Document.validateCPF(value)
		}
	},
	'documents': {
		'cpf': {
			message: 'CPF inválido'
			, validate: (value) => validator.isLength(value, { max: 11, min: 11 }) && Document.validateCPF(value)
		},
		'voteidcard': {
			message: 'Título de eleitor inválido'
			, validate: (value) => validator.isLength(value, { max: 12, min: 12 }) && Document.validateVoteIdCard(value)
		},
		'termsAccepted': {
			message: 'Termo de aceite inválido'
			, validate: (value) => !validator.isEmpty(value.toString())
		}

	},
	'wallet': {
		'walletKey': {
			message: 'Wallet inválida'
			, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { max: 88 })
		}
	},
	'mobileNumber': {
		'number': {
			message: 'Número do telefone celular inválido'
			, validate: (value) => validator.isNumeric(value) && validator.isLength(value, { min: 10, max: 11 })
		}
	},
	'mobile': {
		'number': {
			message: 'Número do telefofe celular inválido'
			, validate: (value) => validator.isNumeric(value)
		}
		// , 'imei': {
		// 	message: 'Imei inválido'
		// 	, validate: (value) => validator.isAlphanumeric(value)
		// }
		// , 'brand': {
		// 	message: 'Marca de celular inválida'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { min: 1, max: 50 })
		// }
		// , 'model': {
		// 	message: 'Modelo de celular inválido'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { min: 1, max: 50 })
		// }
		// , 'so': {
		// 	message: 'SO inválido'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { min: 1, max: 30 })
		// }
		// , 'soVersion': {
		// 	message: 'Versão do SO inválida'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { min: 1, max: 20 })
		// }
		// , 'screenSize': {
		// 	message: 'Tamanho de tela inválida'
		// 	, validate: (value) => !validator.isEmpty(value) && validator.isLength(value, { min: 1, max: 10 })
		// }
		, 'pinCode': {
			message: 'Token de celular inválidado'
			, validate: (value) => validator.isNumeric(value) && validator.isLength(value, { min: 5, max: 5 })
		}
	},
	'emailNotification': {
		'profile_email': {
			message: 'Email inválido'
			, validate: (value) => validator.isEmail(value)
		}
	},
	'accountRemoveNotification': {
		'user_name': {
			message: 'Nome inválido'
			, validate: (value) => !validator.isEmpty(value)
		}
	},
	'link': {
		'link': {
			message: 'Link inválido'
			, validate: (value) => !validator.isEmpty(value)
		}
	},
	'mobileNotification': {
		'number': {
			message: 'Número do telefone celular inválido'
			, validate: (value) => validator.isNumeric(value) && validator.isLength(value, { min: 10, max: 11 })
		},
		'pinCode': {
			message: 'Pincode inválido'
			, validate: (value) => validator.isNumeric(value) && validator.isLength(value, { min: 5, max: 5 })
		}
	},
	'pinCode': {
		'pinCode': {
			message: 'Pincode inválido'
			, validate: (value) => validator.isNumeric(value) && validator.isLength(value, { min: 5, max: 5 })
		}
	},
	'accessToken': {
		'access_token': {
			message: 'Access Token inválido'
				, validate: (value) => !validator.isEmpty(value)
		}
	},
	'petition': {
			// name : {
			// 	message: 'Nome inválido'
			// 	, validate: (value) => !validator.isEmpty(value)
			// },
			'id_version': {
				message: 'Versão inválida'
				, validate: (value) => validator.isNumeric(value) && validator.isLength(value, { min: 1, max: 11 })
			},
			'id_petition': {
				message: 'Petição inválida'
				, validate: (value) => validator.isNumeric(value) && validator.isLength(value, { min: 1, max: 11 })
			},
			'sha': {
					message: 'Sha do PDF inválido'
				, validate: (value) => validator.isBase64(value)
			},
			'url': {
					message: 'Url do PDF inválida'
				, validate: (value) => validator.isURL(value, { protocols: ['http','https'] } )
			},
			'page_url': {
					message: 'Url da Página inválida'
				, validate: (value) => validator.isURL(value, { protocols: ['http','https'] } )
			}
	},
	'petitionInfo': {
			'id': {
				message: 'Id da versão inválido'
				, validate: pipe(validator.toString, allPass([isNotEmpty, validator.isNumeric]))
			},
			'detail_id': {
				message: 'Id do detalhe inválido'
				, validate: pipe(validator.toString, allPass([isNotEmpty, validator.isNumeric]))
			},
			'created_at': {
				message: 'Data da criação inválida'
				, validate: value => isNotEmpty(value) && moment(value).isValid()
			},
			'document_url': {
					message: 'Url do documento inválido'
				, validate: value => validator.isURL(validator.toString(value), { protocols: ['http','https'] })
			},
			'plip_url': {
					message: 'Url da petição inválido'
				, validate: value => validator.isURL(validator.toString(value), { protocols: ['http','https'] })
			},
			'content': {
					message: 'Conteúdo inválido'
				, validate: isNotEmpty
			},
			'presentation': {
					message: 'Apresentação inválida'
				, validate: isNotEmpty
			},
			'total_signatures_required': {
					message: 'Total de assinaturas inválido'
				, validate: pipe(validator.toString, allPass([isNotEmpty, validator.isNumeric]))
			},
			'call_to_action': {
					message: 'Chamada para ação inválida'
				, validate: isNotEmpty
			},
			'pictures': {
				  message: 'Imagem inválida'
				, validate: object => values(object).map(pipe(validator.toString, url => validator.isURL(url, { protocols: ['http','https'] }))).every(Boolean)
			},
			'title': {
					message: 'Título inválido'
				, validate: isNotEmpty
			},
			'subtitle': {
					message: 'Subtítulo inválido'
				, validate: isNotEmpty
			},
			'initial_date': {
					message: 'Data inicial inválida'
				, validate: value => isNotEmpty(value) && moment(value).isValid()
			},
			'final_date': {
					message: 'Data final inválida'
				, validate: value => isNotEmpty(value) && moment(value).isValid()
			},
			'scope_coverage': {
					message: 'Abrangência inválida'
				, validate: pipe(props("scope"), validator.toString, isNotEmpty)
			},
	},
	'petitionFavorite': {
			'id': {
					message: 'Versão da petição inválida'
				, validate: pipe(validator.toString, allPass([isNotEmpty, validator.isNumeric]))
			},
	},
	'voteNotification' : {
			'user_name': {
				message: 'Nome inválido'
				, validate: (value) => !validator.isEmpty(value)
			},
			// petition_name: {
			// 	message: 'Nome da petição inválida'
			// 	, validate: (value) => !validator.isEmpty(value)
			// },
			'petition_page_url': {
					message: 'Página da Petição inválida'
				, validate: (value) => validator.isURL(value, { protocols: ['http','https'] } )
			}
	},
	'email' : {
			'email': {
				message: 'Email inválido'
				, validate: (value) => validator.isEmail(value)
			}
	}
};

module.exports.Validations = Validations;
