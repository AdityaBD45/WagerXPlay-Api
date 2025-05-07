// models/Odds.js
const mongoose = require("mongoose");

const oddsSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate match IDs are stored
  },
  matchStatus: {
    type: String,
    enum: ["upcoming", "live", "completed"],
    required: true,
  },
  teams: [
    {
      teamName: String,
      odds: Number,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now, // Automatically sets the time when the odds are saved
  },
});

const Odds = mongoose.model("Odds", oddsSchema);

module.exports = Odds;
