"use strict";

const PetitionAddedNotifier = ({ petitionNotifier, petitionRepository }) => {
  return async ({ id }) => {
    const isFirstVersion = await petitionRepository.isFirstVersionById(id);

    if (!isFirstVersion) return;

    const petition = await petitionRepository.findById(id);

    return petitionNotifier({
      title: "Novo projeto de lei",
      body: `Olá, um novo projeto de lei "${petition.name}" já está disponível. Participe!`,
      petition,
    });
  };
};

module.exports.PetitionAddedNotifier = PetitionAddedNotifier;
