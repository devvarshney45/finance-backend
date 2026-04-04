// src/controllers/authController.js
// Handles user registration and login

const jwt  = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─── HELPER: Generate JWT Token ───────────────────────────────────────────────
// Encodes the user's ID into a signed token that expires based on .env setting
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },                   // Payload: what we store inside the token
    process.env.JWT_SECRET,           // Secret key to sign the token
    { expiresIn: process.env.JWT_EXPIRES_IN } // Token expiry (e.g., '7d')
  );
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  // Check if express-validator found any errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }

  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already registered.', 409); // 409 = Conflict
    }

    // Create new user — password hashing happens automatically in pre-save hook
    const user = await User.create({ name, email, password, role });

    // Generate token for immediate login after registration
    const token = generateToken(user._id);

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      'User registered successfully',
      201 // 201 = Created
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }

  const { email, password } = req.body;

  try {
    // We need the password for comparison, but our schema has select:false
    // So we explicitly select it here with '+password'
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Don't reveal whether email exists — always give a generic message
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Use our custom comparePassword method defined in the User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated. Contact admin.', 403);
    }

    const token = generateToken(user._id);

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 'Login successful');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
// GET /api/auth/me  — Returns the currently logged-in user's info
const getMe = async (req, res) => {
  // req.user is set by protect middleware
  return sendSuccess(res, { user: req.user }, 'Current user fetched');
};

module.exports = { register, login, getMe };