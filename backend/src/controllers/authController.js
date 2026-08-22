const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register new writer
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, mpin, displayName } = req.body;

  try {
    // Check if username exists
    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    // Validate MPIN is digits only
    if (!/^\d{4,6}$/.test(mpin)) {
      return res.status(400).json({ success: false, message: 'MPIN must be 4-6 digits' });
    }

    const user = await User.create({
      username: username.toLowerCase(),
      mpin,
      displayName: displayName || username,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        preferredTheme: user.preferredTheme,
        customFonts: user.customFonts,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Login with username + MPIN
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, mpin } = req.body;

  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.compareMpin(mpin);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        preferredTheme: user.preferredTheme,
        customFonts: user.customFonts,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// @desc    Update preferences (theme, custom fonts)
// @route   PUT /api/auth/preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { preferredTheme, customFonts, displayName } = req.body;
    const user = await User.findById(req.user._id);

    if (preferredTheme) user.preferredTheme = preferredTheme;
    if (displayName) user.displayName = displayName;
    if (customFonts) user.customFonts = customFonts;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        preferredTheme: user.preferredTheme,
        customFonts: user.customFonts,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update preferences' });
  }
};
