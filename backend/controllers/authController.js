const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT Token
const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET || 'paytracker_jwt_secret_key_2026';
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Please enter your name.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please enter your email.' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ error: 'Invalid user data.' });
    }
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: error.message || 'Error occurred during registration.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please enter your email.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Please enter your password.' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message || 'Error occurred during login.' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ error: 'Error retrieving user profile.' });
  }
};

module.exports = {
  signup,
  login,
  getMe
};
