

const createGame = require('../../hooks/create-game');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [createGame()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
