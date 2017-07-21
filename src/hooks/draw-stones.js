// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // Hooks can either return nothing or a promise
    // that resolves with the `hook` object for asynchronous operations

    if (hook.data.draw === undefined) return Promise.resolve(hook);

    console.log("hook.data:",hook.data);
    console.log("hook.id:", hook.id)


    const { user } = hook.params;

    // see if user is a player
    return hook.app.service('games').get(hook.id)
      .then((game) => {

      })
    //     const { players, turn, pits } = game;
    //     const playerIds = players.map((p) => (p.userId.toString()));
    //     const joined = playerIds.includes(user._id.toString());
    //     const hasTurn = playerIds.indexOf(user._id.toString()) === turn;
    //
    //     if (!joined) {
    //       throw new errors.Unprocessable('You are not a player in this game, so you can not play!');
    //     }
    //
    //     if (!hasTurn) {
    //       throw new errors.Unprocessable('It is not your turn!');
    //     }
    //
    //     const emptyPits = pits.map((pit, index) => {
    //       if (index === hook.data.draw) {
    //         return Object.assign({}, pit, {value: 0});
    //       }
    //       return pit;
    //     })
    //
    //
    //
    //
    //   console.log("draw stones>>>", hook.data.draw)
    //
    //   });
    return Promise.resolve(hook);
  };
};
