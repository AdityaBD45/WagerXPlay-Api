const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');



// GET /api/users/me - Get current logged-in user's info
router.get('/me', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

module.exports = router;

