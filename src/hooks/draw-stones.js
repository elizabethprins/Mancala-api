// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // Hooks can either return nothing or a promise
    // that resolves with the `hook` object for asynchronous operations

    if (hook.data.draw === undefined) return Promise.resolve(hook);

    console.log(hook.data.draw.index)
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

        if (turn === 0 && hook.data.draw.belongsToOwner === false) {
          throw new errors.Unprocessable('Stick to your own side!')
        }

        if (turn === 1 && hook.data.draw.belongsToOwner === true) {
          throw new errors.Unprocessable('Stick to your own side!')
        }


        const drawIndex = (turn === 0) ? (hook.data.draw.index) : (hook.data.draw.index + 6)
        const x = (pits.filter((pit, index) => drawIndex === index))[0].value
        const goal = (turn === 0) ? 6 : 0


        let nextIndex = (Array.from({length: x}, (v, i) => i)).map((a) => a + drawIndex + 1)
          let upperRow = nextIndex.slice(0, (nextIndex.indexOf(12)))
          let restLength = (nextIndex.slice(nextIndex.indexOf(12))).length
          let bottomRow = Array.from({length: restLength}, (v, i) => i)
          let nextFromTop = upperRow.concat(bottomRow)
        let indexNextPits = nextIndex.includes(12) ? nextFromTop : nextIndex


        let nextPits = pits.filter((pit, index) => indexNextPits.includes(index))
          let bottomHalf = nextPits.filter((pit) => pit.belongsToOwner === true)
          let topHalf = nextPits.filter((pit) => pit.belongsToOwner === false)
        let otherwisePits = (turn === 0) ? nextPits.slice(0, nextPits.length-1) : topHalf.concat(bottomHalf).slice(0, nextPits.length-1)



        let lastPit = (indexNextPits.includes(goal)) ? otherwisePits[otherwisePits.length-1] : nextPits[nextPits.length-1]


        if (turn === 0) {
          if (lastPit.value === 0 && lastPit.belongsToOwner === true) {
            // return something, like: find oppositePit() => {
          //   return Object.assign({}, pit, { value: x-x })
          // and collect the score
          // }
          }
        }





        const newPits = pits.map((pit, index) => {
          if (drawIndex === index) {
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

        if (indexNextPits.includes(goal)) {
          let newPlayers = players
          players[turn].score ++
          hook.data.players = newPlayers
        }

        let newTurn = (turn === 0) ? 1 : 0
        if (indexNextPits.lastIndexOf(goal) === indexNextPits.length-1) newTurn = newTurn + 1
        if (newTurn + 1 > players.length) newTurn = 0
        hook.data.turn = newTurn




        console.log('**************************************************', newPits, "bottomHalf", bottomHalf, "POPOPOPOP",lastPit )
        console.log('**************************************************', "nextIndex", nextIndex,"indexNextPits", "goal", goal, indexNextPits, indexNextPits.includes(goal), "and nextPits", nextPits, "and otherwisePits", otherwisePits)
        console.log('**************************************************', players, "turn", turn)


        hook.data.pits = newPits

        return Promise.resolve(hook);
      })
  };
};
