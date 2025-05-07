// routes/oddsRoutes.js
const express = require("express");
const router = express.Router();
const { getMatchOdds, getCompletedMatchesForDeclaration} = require("../controllers/oddsController");
const verifyAdmin = require('../middleware/verifyAdmin');
const verifyToken = require('../middleware/verifyToken');


router.get("/odds", getMatchOdds);
router.get('/completed', verifyToken,verifyAdmin, getCompletedMatchesForDeclaration);

module.exports = router;
