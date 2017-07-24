// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // Hooks can either return nothing or a promise
    // that resolves with the `hook` object for asynchronous operations

    if (hook.data.draw === undefined) return Promise.resolve(hook);

    console.log("hook.data:",hook.data);

    const { user } = hook.params;

    // see if user is a player
    return hook.app.service('games').get(hook.id)
      .then((game) => {
        console.log("game", game)
        const { players, turn, pits } = game;
        const playerIds = players.map((p) => (p.userId.toString()));
        const joined = playerIds.includes(user._id.toString());
        const hasTurn = playerIds.indexOf(user._id.toString()) === turn;

        if (!joined) {
          throw new errors.Unprocessable('You are not a player in this game, so you can not play!');
        }

        if (!hasTurn) {
          throw new errors.Unprocessable('It is not your turn!');
        }


        const x = (pits.filter((pit, index) => hook.data.draw === index))[0].value

        let nextPits = pits.slice(hook.data.draw + 1, hook.data.draw + x + 1)
        let otherwisePits = pits.slice(hook.data.draw + 1, hook.data.draw + x)

        let indexNextPits = (Array.from({length: x}, (v, i) => i)).map((a) => a + hook.data.draw + 1)

        let goal = (turn === 0) ? 6 : 0


        const newPits = pits.map((pit, index) => {
          if (hook.data.draw === index) {
            return Object.assign({}, pit, { value: x-x })
          }
          if (indexNextPits.includes(goal)) {
            if (otherwisePits.includes(pit)) {
              return Object.assign({}, pit, { value: pit.value + 1 })
            }
          }
          if (indexNextPits.includes(goal) === false) {
            if (nextPits.includes(pit)) {
              return Object.assign({}, pit, { value: pit.value + 1 })
            }
          }
          return pit
        })


        if (indexNextPits.includes(goal)) { players[turn].score ++ }

        // const nextPits = for (var i = (hook.data.draw+1); i = (hook.data.draw+x+1); i++) {
        //   return Object.assign({}, pit, { value: 6 })
        // }
        // const nextPits = pits.fill( 6, (hook.data.draw+1), (hook.data.draw+x+1))

        // let nextPits = pits.slice(hook.data.draw+1, hook.data.draw+1+x)
        //
        // const fillPits = pits.map((pit, index) => {
        //   if (nextPits.includes(pit)) {
        //     return Object.assign({}, pit, { value: pit.value + 1 })
        //   }
        //   return pit
        // })



        console.log('**************************************************', newPits)
        console.log('**************************************************', indexNextPits)
        console.log('**************************************************', players[turn])

        // const selectedPit = pits.filter((pit) => pit._id.toString() === hook.data.draw._id)
        // let x = hook.data.draw.value
        // const newPit = Object.assign({}, selectedPit[0], { value: x-x })
        //
        // console.log("yaya", selectedPit, "turn", turn, "newPit", newPit, "pit>>", hook.data.draw,"pit value>>", hook.data.draw.value, "hook.data", hook.data)
        //
        // hook.data.draw.value = newPit.value
        //
        // console.log(hook.data, newPit)
        // hook.data.pits = selectedPit

        return Promise.resolve(hook);
      })
  };
};
