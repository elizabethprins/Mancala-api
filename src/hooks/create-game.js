// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {

    const { user } = hook.params

    // assign the owner of the game
    hook.data.userId = user._id,
    // add the owner to the players, as the first player in the game
    hook.data.players = [{
      userId: user._id,
      score: 0
    }]




    //create the board with initial values
    const pit = 4





    hook.data.pit = pit


    return Promise.resolve(hook);
  };
};
