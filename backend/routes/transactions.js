const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  transactionValidation
} = require('../controllers/transactionController');
const { 
  authenticateToken, 
  requireUserOrAdmin, 
  requireAnyRole,
  checkDataOwnership 
} = require('../middleware/auth');
const { transactionLimiter } = require('../middleware/security');
const { 
  cacheTransactions, 
  invalidateUserCacheAfterTransaction 
} = require('../middleware/cache');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         amount:
 *           type: number
 *           format: float
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [income, expense]
 *         date:
 *           type: string
 *           format: date
 *         categoryName:
 *           type: string
 *         categoryColor:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     TransactionRequest:
 *       type: object
 *       required:
 *         - amount
 *         - description
 *         - type
 *         - category_id
 *         - date
 *       properties:
 *         amount:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *         type:
 *           type: string
 *           enum: [income, expense]
 *         category_id:
 *           type: integer
 *           minimum: 1
 *         date:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions for the authenticated user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [date, amount, description, type, created_at]
 *           default: date
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', 
  transactionLimiter,
  authenticateToken, 
  requireAnyRole,
  cacheTransactions,
  getTransactions
);

/**
 * @swagger
 * /api/transactions/summary:
 *   get:
 *     summary: Get transaction summary for the authenticated user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Transaction summary retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', 
  transactionLimiter,
  authenticateToken, 
  requireAnyRole,
  getTransactionSummary
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a specific transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', 
  transactionLimiter,
  authenticateToken, 
  requireAnyRole,
  checkDataOwnership,
  getTransaction
);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionRequest'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', 
  transactionLimiter,
  authenticateToken, 
  requireUserOrAdmin,
  transactionValidation,
  invalidateUserCacheAfterTransaction,
  createTransaction
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionRequest'
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Transaction not found
 */
router.put('/:id', 
  transactionLimiter,
  authenticateToken, 
  requireUserOrAdmin,
  checkDataOwnership,
  transactionValidation,
  invalidateUserCacheAfterTransaction,
  updateTransaction
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Transaction not found
 */
router.delete('/:id', 
  transactionLimiter,
  authenticateToken, 
  requireUserOrAdmin,
  checkDataOwnership,
  invalidateUserCacheAfterTransaction,
  deleteTransaction
);

module.exports = router;
