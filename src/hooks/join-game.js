// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // Hooks can either return nothing or a promise
    // that resolves with the `hook` object for asynchronous operations

    // see if hook.data has { join: boolean }
    if (hook.data.join === undefined) return Promise.resolve(hook);

    const { user } = hook.params;

    // see if player already present
    return hook.app.service('games').get(hook.id)
      .then((game) => {
        const { players } = game;
        const wantsToJoin = hook.data.join;
        const joined = players.map((p) => (p.userId)).includes(user._id);

        hook.data = {};

        if (!joined && wantsToJoin) {
          hook.data = {
            players: players.concat({ userId: user._id, pairs: [] })
          }
        }

        if (joined && !wantsToJoin) {
          hook.data = {
            players: players.filter((p) => (p.userId !== user._id))
          }
        }

        return Promise.resolve(hook);
    });
  };
};
