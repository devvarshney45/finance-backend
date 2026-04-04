// src/middleware/auth.js
// This middleware runs before protected routes to verify the user's JWT token

const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  // JWT tokens are sent in the Authorization header as: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Extract just the token part
  }

  // If no token found, deny access immediately
  if (!token) {
    return sendError(res, 'Not authorized. No token provided.', 401);
  }

  try {
    // jwt.verify decodes the token and checks the signature using our secret key
    // If token is expired or tampered, it throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded.id is the user ID we stored when creating the token
    // We fetch the user from DB to make sure they still exist and are active
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 'User no longer exists.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated.', 403);
    }

    // Attach user to request object — available in all subsequent middleware/controllers
    req.user = user;
    next(); // Token is valid, proceed to the route handler
  } catch (error) {
    return sendError(res, 'Token is invalid or expired.', 401);
  }
};

module.exports = { protect };