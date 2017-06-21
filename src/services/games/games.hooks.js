const { authenticate } = require('feathers-authentication').hooks;
const { restrictToAuthenticated } = require('feathers-authentication-hooks');
const { populate } = require('feathers-hooks-common');

const createGame = require('../../hooks/create-game');

// Configure where we will get the author data from (the users service),
// how to fetch it (by authorId), and where to put it (author).
const ownerSchema = {
  include: {
    service: 'users',
    nameAs: 'owner',
    parentField: 'ownerId',
    childField: '_id',
  }
};


const restrict = [
  authenticate('jwt'),
  restrictToAuthenticated(),
];


const drawStones = require('../../hooks/draw-stones');


const joinGame = require('../../hooks/join-game');


module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [createGame()],
    update: [drawStones(), joinGame()],
    patch: [drawStones(), joinGame()],
    remove: []
  },

  after: {
    all: [
      populate({ schema: ownerSchema }),
    ],
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
