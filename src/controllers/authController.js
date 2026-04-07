const jwt  = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {   // ✅ next add kiya
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }

  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already registered.', 409);
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);

    return sendSuccess(res, {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    }, 'User registered successfully', 201);

  } catch (error) {
    return next(error);   // ✅ next(error) use karo
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {   // ✅ next add kiya
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

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
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    }, 'Login successful');

  } catch (error) {
    return next(error);   // ✅ next(error) use karo
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {   // ✅ next add kiya
  try {
    return sendSuccess(res, { user: req.user }, 'Current user fetched');
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, getMe };