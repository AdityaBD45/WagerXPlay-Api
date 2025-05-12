const User = require('../models/User');
const Bet = require('../models/betModel');
const Odds = require('../models/Odds');

async function placeBet(req, res) {
  try {
    const { matchId, teamSelected, amount } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check balance
    if (user.balance < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    // Get match odds
    const matchOdds = await Odds.findOne({ matchId });
    if (!matchOdds)
      return res.status(404).json({ message: "Match odds not found" });

    if (matchOdds.matchStatus === "completed") {
      return res.status(400).json({ message: "Bet cannot be placed on a completed match" });
    }

    // Find odds for selected team
    const outcome = matchOdds.teams.find(o => o.teamName === teamSelected);
    if (!outcome)
      return res.status(400).json({ message: "Team not found in odds" });

    const betOdds = outcome.odds;
    const potentialWinnings = amount * betOdds;

    // Deduct balance
    user.balance -= amount;
    await user.save();

    // Save bet as pending
    const newBet = new Bet({
      user: userId,
      matchId,
      betAmount: amount,
      betOutcome: teamSelected,
      betOdds,
      potentialWinnings,
      matchStatus: matchOdds.matchStatus,
      betStatus: 'pending',
    });

    await newBet.save();

    res.status(200).json({
      message: `Bet placed successfully. Awaiting result.`,
      updatedBalance: user.balance,
      data: newBet,
    });

  } catch (error) {
    console.error("Place bet error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get user's betting history
const getUserBets = async (req, res) => {
  try {
    const userId = req.user.id;
    const bets = await Bet.find({ user: userId }).sort({ createdAt: -1 });
    res.json(bets);
  } catch (err) {
    console.error('Error fetching bets:', err);
    res.status(500).json({ error: 'Failed to get bets' });
  }
};




const declareWinner = async (req, res) => {
  const { matchId, winnerTeam } = req.body;

  if (!matchId || !winnerTeam) {
    return res.status(400).json({ error: 'Match ID and winner team are required' });
  }

  try {
    // Step 1: Update the match status to completed
    const matchOdds = await Odds.findOneAndUpdate(
      { matchId },
      { matchStatus: 'completed' }
    );

    if (!matchOdds) {
      return res.status(404).json({ error: 'Match not found in odds collection' });
    }

    // Step 2: Fetch all bets for that match
    const bets = await Bet.find({ matchId });

    // Step 3: Update each bet's status + user balance
    const updateOps = bets.map(async (bet) => {
      const isWon = bet.betOutcome === winnerTeam;
      const newStatus = isWon ? 'won' : 'lost';

      if (isWon) {
        await User.findByIdAndUpdate(bet.user, {
          $inc: { balance: bet.potentialWinnings }
        });
      }

      return Bet.updateOne(
        { _id: bet._id },
        { betStatus: newStatus, matchStatus: 'completed' }
      );
    });

    await Promise.all(updateOps);

    res.json({ message: 'Winner declared and bets updated successfully' });
  } catch (err) {
    console.error('Error declaring winner:', err);
    res.status(500).json({ error: 'Server error while declaring winner' });
  }
};



module.exports = {
  placeBet,
  getUserBets,
  declareWinner
};
