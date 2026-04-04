// src/middleware/roleCheck.js
// This middleware restricts routes based on user roles
// Usage: router.post('/users', protect, authorize('admin'), createUser)

const { sendError } = require('../utils/apiResponse');

// authorize() returns a middleware function
// It accepts multiple roles: authorize('admin', 'analyst')
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware (must run first)
    if (!roles.includes(req.user.role)) {
      // User's role is not in the allowed roles list
      return sendError(
        res,
        `Role '${req.user.role}' is not authorized to perform this action.`,
        403 // 403 = Forbidden (authenticated but not allowed)
      );
    }
    next(); // Role is allowed, proceed
  };
};

module.exports = { authorize };