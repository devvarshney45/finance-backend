// src/routes/userRoutes.js
const express = require('express');
const { getAllUsers, updateUserRole, updateUserStatus } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// All user management routes require login AND admin role
// protect runs first (checks JWT), then authorize checks role
router.get('/',           protect, authorize('admin'), getAllUsers);
router.put('/:id/role',   protect, authorize('admin'), updateUserRole);
router.put('/:id/status', protect, authorize('admin'), updateUserStatus);

module.exports = router;