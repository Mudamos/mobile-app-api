let Chance = require('chance');
let chance = new Chance();
module.exports = Object.defineProperties({}, {
    'VALID': {
        get() {
            return {
                "user": {
                    "name": chance.name(),
                    "email": chance.email(),
                    "password": chance.word({ syllables: 3 }) + chance.integer()
                }
            }
        }
    },
    'RESET_REMOVE': {
        get() {
            return {
                "user": {
                    "email": chance.email()
                }
            }
        }
    },
    'UPDATE_EMAIL': {
        get() {
            return {
                "user": {
                    "profile_email": chance.email()
                }
            }
        }
    },
    'EMPTY_EMAIL': {
        get() {
            return {
                "user": {
                    "name": chance.name(),
                    "email": '',
                    "password": chance.word({ syllables: 3 }) + chance.integer()
                }
            }
        }
    },
    'INVALID_EMAIL': {
        get() {
            return {
                "user": {
                    "name": chance.name(),
                    "email": 'xurupita',
                    "password": chance.word({ syllables: 3 }) + chance.integer()
                }
            }
        }
    },'NULL_EMAIL': {
        get() {
            return {
                "user": {
                    "name": chance.name(),
                    "email": null,
                    "password": chance.word({ syllables: 3 }) + chance.integer()
                }
            }
        }
    },
    'EMPTY_NAME': {
        get() {
            return {
                "user": {
                    "name": '',
                    "email": chance.email(),
                    "password": chance.word({ syllables: 3 }) + chance.integer()
                }
            }
        }
    },
    'INVALID_NAME': {
        get() {
            return {
                "user": {
                    "name": '------------/**/',
                    "email": chance.email(),
                    "password": chance.word({ syllables: 3 }) + chance.integer()
                }
            }
        }
    },'NULL_NAME': {
        get() {
            return {
                "user": {
                    "name": null,
                    "email": chance.email(),
                    "password": chance.word({ syllables: 3 }) + chance.integer()
                }
            }
        }
    },
    'EMPTY_PASSWORD': {
        get() {
            return {
                "user": {
                    "name": chance.name(),
                    "email": chance.email(),
                    "password": ''
                }
            }
        }
    },
    'INVALID_PASSWORD': {
        get() {
            return {
                "user": {
                    "name": chance.name(),
                    "email": chance.email(),
                    "password": '-'
                }
            }
        }
    },'NULL_PASSWORD': {
        get() {
            return {
                "user": {
                    "name": chance.name(),
                    "email": chance.email(),
                    "password": null
                }
            }
        }
    }
});