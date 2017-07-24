// games-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;


  const playerSchema = new Schema({
    name: { type: Schema.Types.String, ref: 'users' },
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    score: { type: Number },
  });

  const pitSchema = new Schema({
    value: { type: Number },
    belongsToOwner: { type: Boolean },
  });

  const games = new Schema({
    pits: [pitSchema],
    players: [playerSchema],
    started: { type: Boolean, 'default': false },
    winnerId: { type: Schema.Types.ObjectId, ref: 'users' },
    turn: { type: Number, 'default': 0 },
    createdAt: { type: Date, 'default': Date.now },
    updatedAt: { type: Date, 'default': Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
  });

  return mongooseClient.model('games', games);
};
