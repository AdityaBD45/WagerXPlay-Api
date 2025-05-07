// services/oddsUpdater.js
const axios = require("axios");
const Odds = require("../models/Odds");

const updateOdds = async () => {
  try {
    const currentUTC = new Date();
    console.log(`[CRON] Running odds update at ${currentUTC.toISOString()}`);

    const response = await axios.get("https://api.the-odds-api.com/v4/sports/cricket/odds", {
      params: {
        apiKey: process.env.ODDS_API_KEY,
        regions: "us",
        markets: "h2h",
        oddsFormat: "decimal",
      },
    });

    const iplMatches = response.data
      .filter((match) => match.sport_key === "cricket_ipl")
      .map((match) => {
        const matchTime = new Date(match.commence_time);
        const matchTimeUTC = new Date(matchTime.toISOString());

        const timeDiffInMs = currentUTC - matchTimeUTC;
        const timeDiffInHours = timeDiffInMs / (1000 * 60 * 60);

        let matchStatus = "upcoming";
        if (timeDiffInHours >= 0 && timeDiffInHours < 1) {
          matchStatus = "live";
        } else if (timeDiffInHours >= 1 && timeDiffInHours < 4) {
          matchStatus = "upcoming";
        } else if (timeDiffInHours >= 4) {
          matchStatus = "completed";
        }

        return {
          ...match,
          matchStatus,
        };
      });

    for (const match of iplMatches) {
      const existingOdds = await Odds.findOne({ matchId: match.id });
      const outcomes = match.bookmakers?.[0]?.markets?.[0]?.outcomes || [];
      const teams = outcomes.map((outcome) => ({
        teamName: outcome.name,
        odds: outcome.price,
      }));

      if (existingOdds) {
        existingOdds.matchStatus = match.matchStatus;
        existingOdds.teams = teams;
        existingOdds.timestamp = new Date();
        await existingOdds.save();
      } else {
        const odds = new Odds({
          matchId: match.id,
          matchStatus: match.matchStatus,
          teams,
          timestamp: new Date(),
        });
        await odds.save();
      }
    }

    const allOdds = await Odds.find({});
    for (const odds of allOdds) {
      const timeDiffInMs = currentUTC - new Date(odds.timestamp);
      const timeDiffInHours = timeDiffInMs / (1000 * 60 * 60);

      if (timeDiffInHours > 4 && odds.matchStatus !== "completed") {
        odds.matchStatus = "completed";
        await odds.save();
        console.log(`[CRON] Marked match ${odds.matchId} as completed`);
      }
    }

    console.log("[CRON] Odds update completed.");
  } catch (error) {
    console.error("[CRON] Error updating odds:", error.response?.data || error.message);
  }
};

module.exports = updateOdds;
