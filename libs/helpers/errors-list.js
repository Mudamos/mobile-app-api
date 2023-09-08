let Errors = {
  'ErrorUserPassword': {
    message: 'Usuário ou senha inválidos',
    errorCode: 1001
  },
  'ErrorUserCreate': {
    message: 'Erro ao criar o usuário',
    errorCode: 1002
  },
  'ErrorUserValidate': {
    message: 'Erro na validação de cadastro do usuário',
    errorCode: 1003
  },
  'ErrorUserNotFound': {
    message: 'Usuário não encontrado',
    errorCode: 1004
  },
  'ErrorUserDuplicate': {
    message: 'Usuário já existente',
    errorCode: 1005
  },
  'ErrorUserBirthday': {
    message: 'Data de nascimento inválida',
    errorCode: 1006
  },
  'ErrorUserZipCode': {
    message: 'CEP inválido',
    errorCode: 1007
  },
  'ErrorUserDocuments': {
    message: 'Erro ao atualizar os documentos',
    errorCode: 1008
  },
  'ErrorUserReset': {
    message: 'Erro na validação da troca de senha',
    errorCode: 1009
  },
  'ErrorAddressSearch': {
    message: 'Erro ao buscar endereço',
    errorCode: 1010
  },
  'ErrorAddressNotFound': {
    message: 'Endereço não encontrado',
    errorCode: 1011
  },
  'ErrorMobile': {
    message: 'Erro ao armazenar dados do aparelho celular',
    errorCode: 1012
  },
  'ErrorMobileCreate': {
    message: 'Erro na validação do celular',
    errorCode: 1013
  },
  'ErrorPinCode': {
    message: 'Código de verificação inválido',
    errorCode: 1014
  },
  'ErrorWallet': {
    message: 'Erro na validação da identidade do usuário (wallet)',
    errorCode: 1015
  },
  'ErrorWalletDuplicate': {
    message: 'Esta identidade de usuário já existe (wallet)',
    errorCode: 1016
  },
  'ErrorWalletExists': {
    message: 'Usuário já possui uma identidade (wallet)',
    errorCode: 1017
  },
  'ErrorConfigNotExists': {
    message: 'Configuração não existente',
    errorCode: 1018
  },
  'ErrorSignMessageDuplicate': {
    message: 'Petição já assinada',
    errorCode: 1019
  },
  'ErrorSignWalletNotFound': {
    message: 'Usuário não possui uma identidade cadastrada (wallet)',
    errorCode: 1020
  },
  'ErrorSignMobileNotFound': {
    message: 'Usuário sem celular cadastrado',
    errorCode: 1021
  },
  'ErrorNotification': {
    message: 'E-mail já validado',
    errorCode: 1021
  },
  'ErrorNotificationToken': {
    message: 'Token de validação expirado',
    errorCode: 1022
  },
  'ErrorSMSSend': {
    message: 'Erro ao enviar SMS',
    errorCode: 1023
  },
  'ErrorSignWallet': {
    message: 'Identidade do usuário (wallet) diferente da esperada',
    errorCode: 1024
  },
  'ErrorUserDocumentsCPF': {
    message: 'Já existe um cadastro com este CPF',
    errorCode: 1025
  },
  'ErrorUserDocumentsVoteIdCard': {
    message: 'Já existe um cadastro com este Título de Eleitor',
    errorCode: 1026
  },
  'ErrorUserProfile': {
    message: 'Erro ao atualizar o perfil do usuário',
    errorCode: 1027
  },
  'ErrorUserValidateFlag': {
    message: 'Usuário com perfil pendente de validação',
    errorCode: 1028
  },
  'ErrorPetitionNotFound': {
    message: 'Petição não existente',
    errorCode: 1029
  },
  'ErrorUserBlackList': {
    message: 'Usuário bloqueado',
    errorCode: 1030
  },
  'ErrorVoteBlockchainNotFound': {
    message: 'Assinatura inválida',
    errorCode: 1031
  },
  'ErrorSignMessage': {
    message: 'Erro ao validar a mensagem assinada',
    errorCode: 1032
  },
  'ErrorUserEmailDuplicate': {
    message: 'Já existe um cadastro com esse E-mail. Gostaria de entrar?',
    errorCode: 1033
  },
  'ErrorUserPhoto': {
    message: 'Erro ao atualizar a foto de perfil do usuário',
    errorCode: 1034
  },
  'ErrorSignIp': {
    message: 'Erro ao validar mensagem , restrição de IP',
    errorCode: 1035
  },
  'ErrorSignBlock': {
    message: 'Erro ao validar mensagem , restrição de IP',
    errorCode: 1036
  },
  'ErrorRemoveAccount': {
    message: 'Cadastro já removido',
    errorCode: 1037
  },
  'ErrorEmailUpdate': {
    message: 'Email é igual a email atual',
    errorCode: 1038
  },
  'ErrorScoreRecovery': {
    message: 'Score insuficiente para recuperação de dados',
    errorCode: 1039
  },
  'ErrorEmailInvalid': {
    message: 'Email inválido',
    errorCode: 1040
  },
  'ErrorUserCpfDuplicate': {
    message: 'Já existe um cadastro com esse CPF. Gostaria de entrar?',
    errorCode: 1041
  },
  'ErrorUserVoteIdCardDuplicate': {
    message: 'Já existe um cadastro com esse título de eleitor.',
    errorCode: 1042
  },
  'ErrorSyncPetition': {
    message: 'Erro ao sincronizar a petição',
    errorCode: 1043
  },
  'ErrorPetitionVersionInvalid': {
    message: 'Versão da petição inválida',
    errorCode: 1044
  },
  'ErrorFavoriteUpdate': {
    message: 'Erro ao alterar status favorito',
    errorCode: 1045
  },
  'ErrorFavoriteInfo': {
    message: 'Erro ao recuperar as informações de favoritos da petição',
    errorCode: 1046
  },
  'ErrorPetitionCreate': {
    message: 'Erro ao criar a petição',
    errorCode: 1102
  },
  'ErrorPetitionExists': {
    message: 'Petição já registrada no Blockchain',
    errorCode: 1102
  },
  'ErrorParameter': {
    message: 'Erro na validação dos parâmetros',
    errorCode: 1101
  },
  'ErrorAccessToken': {
    message: 'Erro na validação do token de acesso',
    errorCode: 1102
  },
  'ErrorCacheEmpty': {
    message: 'Erro ao recuperar a informação (cache)',
    errorCode: 1104
  },
  'ErrorDataBaseConnection': {
    message: 'Erro ao recuperar a conexão do banco de dados',
    errorCode: 1105
  },
  'ErrorDataBaseQuery': {
    message: 'Erro ao e executar a Query no banco de dados',
    errorCode: 11060
  },
  'ErrorCPFNotFound': {
    message: 'CPF não cadastrado ou inválido',
    errorCode: 11061
  },
  'ErrorPlipMobileAlreadyValidated': {
    message: 'Telefone já validado',
    errorCode: 11062,
  },
  'ErrorPlipMobileSender': {
    message: 'Dados inválidos',
    errorCode: 11063,
  },
  'ErrorPlipMobileValidationInvalid': {
    message: 'Código inválido',
    errorCode: 11064,
  },
  'ErrorPlipMobileValidationInvalidPinCode': {
    message: 'Código inválido',
    errorCode: 11065,
  },
  ErrorProfileInvalidVoteCity: {
    message: 'Cidade inválida',
    errorCode: 11066,
  },
  ErrorPlipCheckRequiresMobileValidation: {
    message: 'Não foi possível assinar o projeto',
    errorCode: 11067,
  },
  ErrorUserCity: {
    message: 'Cidade inválida',
    errorCode: 11068
  },
};

module.exports = Errors;
