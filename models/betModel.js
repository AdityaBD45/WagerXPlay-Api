const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to user
  matchId: { type: String, required: true }, // The match ID being bet on
  betAmount: { type: Number, required: true }, // Bet amount
  betOutcome: { type: String, required: true }, // Whether the user bet on the home or away team
  betOdds: { type: Number, required: true }, // Odds of the outcome
  betStatus: { type: String, enum: ['pending', 'won', 'lost'], default: 'pending' }, // Bet status
  matchStatus: { type: String, enum: ['upcoming','live', 'completed'], required: true }, // Match status (live or completed)
}, { timestamps: true });

module.exports = mongoose.model('Bet', betSchema);
