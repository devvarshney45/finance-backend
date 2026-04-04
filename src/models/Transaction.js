// src/models/Transaction.js
// Defines the shape of financial transaction records

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'], // Prevent zero or negative amounts
    },

    type: {
      type: String,
      enum: ['income', 'expense'],            // Only these two types
      required: [true, 'Transaction type is required'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      // Examples: 'Salary', 'Rent', 'Food', 'Travel', 'Utilities'
    },

    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now, // Default to current date if not provided
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },

    // Reference to the User who created this transaction
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId reference
      ref: 'User',                          // Points to the User model
      required: true,
    },

    // Soft delete flag — instead of deleting, we mark as deleted
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── INDEX FOR FASTER QUERIES ─────────────────────────────────────────────────
// When users filter by date or category frequently, indexes speed up queries
TransactionSchema.index({ date: -1 });      // -1 = descending (newest first)
TransactionSchema.index({ category: 1 });   // 1 = ascending (alphabetical)
TransactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);