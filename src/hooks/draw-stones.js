// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // Hooks can either return nothing or a promise
    // that resolves with the `hook` object for asynchronous operations

    if (hook.data.draw === undefined) return Promise.resolve(hook);

    const { user } = hook.params;

    // see if user is a player
    return hook.app.service('games').get(hook.id)
      .then((game) => {

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

        // start finding the index numbers of the pits in which to drop the stones that a player has drawn
        let nextIndex = x > 0 ? (Array.from({length: x}, (v, i) => i)).map((a) => a + drawIndex + 1) : [drawIndex]
          // make sure you start at 0 again after index number 11
          let upperRow = nextIndex.slice(0, (nextIndex.indexOf(12)))
          let restLength = (nextIndex.slice(nextIndex.indexOf(12))).length
          let bottomRow = Array.from({length: restLength}, (v, i) => i)
          let nextFromTop = upperRow.concat(bottomRow)
        // the index numbers are thus:
        let indexNextPits = nextIndex.includes(12) ? nextFromTop : nextIndex

        // find the pits with the corresponding index numbers
        let nextPits = pits.filter((pit, index) => indexNextPits.includes(index))
          let bottomHalf = nextPits.filter((pit) => pit.belongsToOwner === true)
          let topHalf = nextPits.filter((pit) => pit.belongsToOwner === false)
        // if you have to drop a stone (when passing the scorepit OR when capturing opponent's pit):
        // (THERE IS STILL AN ISSUE HERE: if you go all round the board and BACK to your own side, the wrong pit is omitted).
        let otherwisePits = (turn === 0) ? nextPits.slice(0, nextPits.length-1) : topHalf.concat(bottomHalf).slice(0, nextPits.length-1)
        // and if you have to drop two (when passing the scorepit AND when capturing opponent's pit):
        let otherOtherwisePits = otherwisePits.slice(0, otherwisePits.length-1)
        // for capturing:
        let lastPit = indexNextPits.includes(goal) ? otherwisePits[otherwisePits.length-1] : nextPits[nextPits.length-1]
          if (indexNextPits.indexOf(goal) === indexNextPits.length-1) { lastPit = undefined }
        let oppositePit = pits.filter((pit, index) => index === (11 - pits.indexOf(lastPit)))[0]

        // set the requirements for capturing an opponent's pit
        let gettingLucky = lastPit && (lastPit.value === 0 && oppositePit.value > 0) ? true : false
        let endOnOwnSide = lastPit && ((turn === 0 && lastPit.belongsToOwner === true) || (turn === 1 && lastPit.belongsToOwner === false)) ? true : false
        const capture = (gettingLucky && endOnOwnSide)

        //see if all the pits on one side are empty
        let outOfStones1 = (pits.filter((pit) => pit.belongsToOwner === true && pit.value === 0)).length
        let outOfStones2 = (pits.filter((pit) => pit.belongsToOwner === false && pit.value === 0)).length
          if (outOfStones1 === 6) { outOfStones1 = true }
          if (outOfStones2 === 6) { outOfStones2 = true }
        let outOfStones = (outOfStones1 === true) || (outOfStones2 === true)


        // redistribute all the stones according to the play
        const newPits = pits.map((pit, index) => {

          if (drawIndex === index) {
            return Object.assign({}, pit, { value: x-x })
          }

          if (indexNextPits.includes(goal)) {
            if (capture && (x !== 0)) {
              if (Array(lastPit, oppositePit).includes(pit)) {
                return Object.assign({}, pit, { value: 0 })
              }
              if (otherOtherwisePits.includes(pit)) {
                return Object.assign({}, pit, { value: pit.value + 1 })
              }
            } else {
              if (otherwisePits.includes(pit)) {
                return Object.assign({}, pit, { value: pit.value + 1 })
              }
            }
          }

          if (indexNextPits.includes(goal) === false) {
            if (capture && (x !== 0)) {
              if (Array(lastPit, oppositePit).includes(pit)) {
                return Object.assign({}, pit, { value: 0 })
              }
              if (otherwisePits.includes(pit)) {
                return Object.assign({}, pit, { value: pit.value + 1 })
              }
            } else {
              if (nextPits.includes(pit)) {
                return Object.assign({}, pit, { value: pit.value + 1 })
              }
            }
          }

          return pit
        })


        // player gets a point when passing own scorepit
        if (indexNextPits.includes(goal)) {
          players[turn].score ++
        }

        // player gets points when capturing opponent's pit
        if (capture) {
          players[turn].score = players[turn].score + oppositePit.value + 1
        }

        // declare a winner
        let newPlayers = players
        if (newPlayers[turn].score > 24) {
          hook.data.winnerId = newPlayers[turn]._id
        }
        if (outOfStones === true) {
          if (newPlayers[0].score > newPlayers[1].score) {
            hook.data.winnerId = newPlayers[0]._id
          } else {
            hook.data.winnerId = newPlayers[1]._id
          }
        }
        hook.data.players = newPlayers

        // player keeps the turn if play ends in own scorepit
        let newTurn = (turn === 0) ? 1 : 0
        if (nextIndex[0] === drawIndex) { newTurn = newTurn + 1 }
        if (indexNextPits.lastIndexOf(goal) === indexNextPits.length-1) { newTurn = newTurn + 1 }
        if (newTurn + 1 > players.length) { newTurn = 0 }
        hook.data.turn = newTurn


        hook.data.pits = newPits

        return Promise.resolve(hook);
      })
  };
};
