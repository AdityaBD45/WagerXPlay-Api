const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET; // Replace with a secure secret in production

// Register user
const registerUser = async (req, res) => {
  const { username, password, isAdmin } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new User({
      username,
      password,
      isAdmin: isAdmin || false
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, isAdmin: newUser.isAdmin },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return token + user object (excluding password)
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        isAdmin: newUser.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { registerUser, loginUser };
