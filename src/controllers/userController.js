// src/controllers/userController.js
// Admin-only operations: list users, change roles, activate/deactivate

const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/users — List all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users, exclude password field, sort newest first
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, { count: users.length, users });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// PUT /api/users/:id/role — Change a user's role (admin only)
const updateUserRole = async (req, res) => {
  const { role } = req.body;

  // Validate the role value before hitting the DB
  const validRoles = ['viewer', 'analyst', 'admin'];
  if (!validRoles.includes(role)) {
    return sendError(res, `Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true } // new:true returns the updated document
    ).select('-password');

    if (!user) return sendError(res, 'User not found', 404);

    return sendSuccess(res, { user }, 'User role updated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// PUT /api/users/:id/status — Activate or deactivate a user (admin only)
const updateUserStatus = async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return sendError(res, 'isActive must be a boolean value', 400);
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) return sendError(res, 'User not found', 404);

    return sendSuccess(res, { user }, `User ${isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = { getAllUsers, updateUserRole, updateUserStatus };