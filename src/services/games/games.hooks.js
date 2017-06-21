// src/services/recipes/recipes.hooks.js

const { authenticate } = require('feathers-authentication').hooks;
const { restrictToOwner, associateCurrentUser, restrictToAuthenticated } = require('feathers-authentication-hooks');
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


module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [createGame(),
      authenticate('jwt'),
      restrictToAuthenticated(),
      associateCurrentUser({ as: 'ownerId' })],
    update: [drawStones()],
    patch: [drawStones()],
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
