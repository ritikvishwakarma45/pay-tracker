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
        budgetLimit: user.budgetLimit,
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
        budgetLimit: user.budgetLimit,
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

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { name, email, password, budgetLimit } = req.body;

    if (name) user.name = name.trim();
    
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use.' });
      }
      user.email = email.toLowerCase().trim();
    }

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      }
      user.password = password;
    }

    if (budgetLimit !== undefined) {
      const parsedBudget = Number(budgetLimit);
      if (isNaN(parsedBudget) || parsedBudget < 0) {
        return res.status(400).json({ error: 'Please enter a valid positive number for budget limit.' });
      }
      user.budgetLimit = parsedBudget;
    }

    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      budgetLimit: user.budgetLimit,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message || 'Error updating profile.' });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile
};
