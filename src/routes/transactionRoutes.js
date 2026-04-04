// src/routes/transactionRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

const transactionValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('date').optional().isISO8601().withMessage('Date must be valid ISO format'),
];

router.get('/',    protect, authorize('viewer', 'analyst', 'admin'), getTransactions);
router.get('/:id', protect, authorize('viewer', 'analyst', 'admin'), getTransactionById);

router.post('/',      protect, authorize('admin', 'analyst'), transactionValidation, createTransaction);
router.put('/:id',    protect, authorize('admin', 'analyst'), transactionValidation, updateTransaction);
router.delete('/:id', protect, authorize('admin'), deleteTransaction);

module.exports = router;  // ← THIS WAS MISSING