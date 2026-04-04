// src/controllers/dashboardController.js
// Provides aggregated data for the finance dashboard

const Transaction = require('../models/Transaction');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// GET /api/dashboard/summary
// Returns: total income, total expenses, net balance
const getSummary = async (req, res) => {
  try {
    // MongoDB aggregation pipeline — processes data in stages
    const result = await Transaction.aggregate([
      { $match: { isDeleted: false } }, // Stage 1: Only non-deleted records

      // Stage 2: Group all records together and sum by type using $cond
      {
        $group: {
          _id: null, // null means group ALL documents together
          totalIncome: {
            $sum: {
              // $cond is like an if-else: if type is 'income', add amount, else add 0
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          totalTransactions: { $sum: 1 }, // Count total records
        },
      },
    ]);

    // If no transactions exist, result will be empty array — handle gracefully
    const summary = result[0] || { totalIncome: 0, totalExpenses: 0, totalTransactions: 0 };
    summary.netBalance = summary.totalIncome - summary.totalExpenses;

    return sendSuccess(res, { summary });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// GET /api/dashboard/by-category
// Returns spending and income grouped by category
const getByCategory = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { isDeleted: false } },

      // Group by both category AND type, sum the amounts
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },

      // Sort by total amount descending
      { $sort: { total: -1 } },
    ]);

    return sendSuccess(res, { categories: result });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// GET /api/dashboard/monthly-trends
// Returns monthly income vs expense breakdown
const getMonthlyTrends = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { isDeleted: false } },

      {
        $group: {
          // Extract year and month from the date field
          _id: {
            year:  { $year: '$date' },   // e.g., 2024
            month: { $month: '$date' },  // e.g., 3 (March)
            type:  '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },

      // Sort by year and month ascending
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return sendSuccess(res, { trends: result });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// GET /api/dashboard/recent
// Returns last 5 transactions for quick overview
const getRecentActivity = async (req, res) => {
  try {
    const recent = await Transaction
      .find({ isDeleted: false })
      .sort({ createdAt: -1 }) // Newest first
      .limit(5)
      .populate('createdBy', 'name');

    return sendSuccess(res, { recent });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = { getSummary, getByCategory, getMonthlyTrends, getRecentActivity };