const axios = require("axios");
const Odds = require("../models/Odds");
const Bet = require("../models/betModel");

const getMatchOdds = async (req, res) => {
  try {
    const currentUTC = new Date();

    // Check if we already fetched within the last 4 hours
    const latestOdds = await Odds.findOne().sort({ timestamp: -1 });

    if (latestOdds) {
      const lastFetched = new Date(latestOdds.timestamp);
      const timeDiffInHours = (currentUTC - lastFetched) / (1000 * 60 * 60);

      if (timeDiffInHours < 4) {
        console.log(`Using cached data. Last fetched ${timeDiffInHours.toFixed(2)} hours ago.`);
        const cachedData = await Odds.find({});
        return res.status(200).json(cachedData); // Return cached data if it was fetched recently
      }
    }

    // Fetch from Odds API
    console.log("Fetching match odds from the API...");
    const response = await axios.get("https://api.the-odds-api.com/v4/sports/cricket/odds", {
      params: {
        apiKey: process.env.ODDS_API_KEY,
        regions: "us,eu,uk,au",
        markets: "h2h",
        oddsFormat: "decimal",
      },
    });

    console.log("Current UTC time:", currentUTC);
    console.log("API Response Data:", response.data);  // Log the entire API response for inspection

    // Process the fetched data and ensure no missing odds or teams
    const allMatches = response.data
      .filter((match) => match.sport_key === "cricket_ipl" || "cricket_psl")  // Remove IPL filter
      .map((match) => {
        const matchTime = new Date(match.commence_time);
        const matchTimeUTC = new Date(matchTime.toISOString());

        const timeDiffInMs = currentUTC - matchTimeUTC;
        const timeDiffInHours = timeDiffInMs / (1000 * 60 * 60);

        let matchStatus = "upcoming";
        if (timeDiffInHours < -1) {
          matchStatus = "upcoming"; // More than 1 hour in future
        } else if (timeDiffInHours >= -1 && timeDiffInHours < 4) {
          matchStatus = "live"; // From 1 hour before start to 4 hours after
        } else if (timeDiffInHours >= 4) {
          matchStatus = "completed";
        }


        // Ensure teams and odds exist before returning the match
        const outcomes = match.bookmakers?.[0]?.markets?.[0]?.outcomes || [];
        const teams = outcomes.map((outcome) => ({
          teamName: outcome.name,
          odds: outcome.price,
        }));

        if (teams.length === 0 || !teams[0].odds) {
          console.log(`Skipping match with missing odds: ${match.id}`);
          return null;  // Skip matches that have no odds data
        }

        return {
          ...match,
          matchStatus,
          teams,  // Attach teams and odds to match
        };
      })
      .filter((match) => match !== null);  // Filter out any null entries (incomplete matches)

    console.log(`Fetched ${allMatches.length} valid cricket matches from the API`);

    // Save the fetched match odds to the database
    for (const match of allMatches) {
      const existingOdds = await Odds.findOne({ matchId: match.id });
      const teams = match.teams || [];

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

    // Mark old odds as completed if older than 4 hours
    const allOdds = await Odds.find({});
    for (const odds of allOdds) {
      const timeDiffInMs = currentUTC - new Date(odds.timestamp);
      const timeDiffInHours = timeDiffInMs / (1000 * 60 * 60);

      if (timeDiffInHours > 4 && odds.matchStatus !== "completed") {
        odds.matchStatus = "completed";
        await odds.save();
        console.log(`Updated match ID: ${odds.matchId} status to completed`);
      }
    }

    // Send all stored odds as the response
    const storedOdds = await Odds.find({});
    console.log("Fetched cricket matches from database:", storedOdds.length);

    res.status(200).json(storedOdds); // Return stored odds after processing

  } catch (error) {
    console.error("Error fetching odds:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch match odds" });
  }
};



const getCompletedMatchesForDeclaration = async (req, res) => {
  try {
    const completedMatches = await Odds.find({ matchStatus: "completed" });

    const matchesWithPendingBets = [];

    for (const match of completedMatches) {
      const pendingBets = await Bet.findOne({
        matchId: match.matchId,
        betStatus: "pending"
      });

      if (pendingBets) {
        matchesWithPendingBets.push(match);
      }
    }

    res.json(matchesWithPendingBets);
  } catch (error) {
    console.error("Error fetching completed matches for declaration:", error);
    res.status(500).json({ message: "Error fetching matches", error });
  }
};





module.exports = { getMatchOdds, getCompletedMatchesForDeclaration };
