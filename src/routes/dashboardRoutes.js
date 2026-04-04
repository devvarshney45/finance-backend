// src/routes/dashboardRoutes.js
const express = require('express');
const {
  getSummary,
  getByCategory,
  getMonthlyTrends,
  getRecentActivity,
} = require('../controllers/dashboardController');
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// All roles can view dashboard — viewers, analysts, admins
const allRoles = authorize('viewer', 'analyst', 'admin');

router.get('/summary',        protect, allRoles, getSummary);
router.get('/by-category',    protect, allRoles, getByCategory);
router.get('/monthly-trends', protect, allRoles, getMonthlyTrends);
router.get('/recent',         protect, allRoles, getRecentActivity);

module.exports = router;