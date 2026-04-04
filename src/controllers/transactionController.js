// src/controllers/transactionController.js
// Create, Read, Update, Delete financial transactions

const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─── CREATE ───────────────────────────────────────────────────────────────────
// POST /api/transactions
const createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, 'Validation failed', 422, errors.array());

  const { amount, type, category, date, notes } = req.body;

  try {
    const transaction = await Transaction.create({
      amount,
      type,
      category,
      date: date || Date.now(),
      notes,
      createdBy: req.user._id, // Link transaction to the logged-in user
    });

    return sendSuccess(res, { transaction }, 'Transaction created', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── READ ALL (with filters) ──────────────────────────────────────────────────
// GET /api/transactions?type=income&category=Salary&startDate=2024-01-01&page=1&limit=10
const getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      page  = 1,   // Default page 1
      limit = 10,  // Default 10 records per page
    } = req.query;

    // Build the filter object dynamically based on query params
    const filter = { isDeleted: false }; // Never show soft-deleted records

    if (type)     filter.type     = type;
    if (category) filter.category = new RegExp(category, 'i'); // Case-insensitive search

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate); // $gte = greater than or equal
      if (endDate)   filter.date.$lte = new Date(endDate);   // $lte = less than or equal
    }

    // Pagination math
    const skip  = (Number(page) - 1) * Number(limit); // How many records to skip
    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction
      .find(filter)
      .populate('createdBy', 'name email')  // Replace ObjectId with actual user data
      .sort({ date: -1 })                   // Newest first
      .skip(skip)
      .limit(Number(limit));

    return sendSuccess(res, {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      transactions,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── READ ONE ─────────────────────────────────────────────────────────────────
// GET /api/transactions/:id
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction
      .findOne({ _id: req.params.id, isDeleted: false })
      .populate('createdBy', 'name email');

    if (!transaction) return sendError(res, 'Transaction not found', 404);

    return sendSuccess(res, { transaction });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendError(res, 'Validation failed', 422, errors.array());

  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) return sendError(res, 'Transaction not found', 404);

    return sendSuccess(res, { transaction }, 'Transaction updated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── SOFT DELETE ──────────────────────────────────────────────────────────────
// DELETE /api/transactions/:id
// We don't actually delete from DB — we set isDeleted: true
// This preserves data integrity and allows recovery
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!transaction) return sendError(res, 'Transaction not found', 404);

    return sendSuccess(res, null, 'Transaction deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};