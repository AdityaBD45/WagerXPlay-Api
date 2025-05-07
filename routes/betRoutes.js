const express = require('express');
const router = express.Router();
const { placeBet, getUserBets,  declareWinner} = require('../controllers/betController')
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
// POST route to place a bet

router.post('/place', verifyToken, placeBet);
router.get('/my-bets', verifyToken, getUserBets)
router.post('/declare-winner', verifyToken,verifyAdmin, declareWinner)

module.exports = router;
