// games-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const pitSchema = new Schema({
    value: { type: Number, required: true }, // string if img url
    belongsToOwner: { type: Boolean, required: true },
  });

  const playerSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    name: { type: String, required: true },
    score: { type: Number },
  });

  const games = new Schema({
    text: { type: String, required: true },
    pits: [pitSchema],
    players: [playerSchema],
    started: { type: Boolean, required: true, 'default': false },
    winnerId: { type: Schema.Types.ObjectId, ref: 'user' },
    turn: { type: Number, required: true, 'default': 0 },
    createdAt: { type: Date, 'default': Date.now },
    updatedAt: { type: Date, 'default': Date.now },
    ownerId: { type: Schema.Types.ObjectId, ref: 'user' },
  });

  return mongooseClient.model('games', games);
};
