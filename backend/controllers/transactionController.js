const { body, validationResult, query: expressQuery } = require('express-validator');
const { query } = require('../config/database');

// Validation rules
const transactionValidation = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('category_id')
    .isInt({ gt: 0 })
    .withMessage('Category ID must be a positive integer'),
  body('date')
    .isDate()
    .withMessage('Date must be a valid date')
];

// Get all transactions for a user
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? req.query.user_id || req.user.id : req.user.id;
    const {
      page = 1,
      limit = 10,
      category,
      type,
      search,
      start_date,
      end_date,
      sort_by = 'date',
      sort_order = 'desc'
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    let whereConditions = ['t.user_id = $1'];
    let queryParams = [userId];
    let paramCount = 1;

    if (category) {
      paramCount++;
      whereConditions.push(`t.category_id = $${paramCount}`);
      queryParams.push(category);
    }

    if (type) {
      paramCount++;
      whereConditions.push(`t.type = $${paramCount}`);
      queryParams.push(type);
    }

    if (search) {
      paramCount++;
      whereConditions.push(`t.description ILIKE $${paramCount}`);
      queryParams.push(`%${search}%`);
    }

    if (start_date) {
      paramCount++;
      whereConditions.push(`t.date >= $${paramCount}`);
      queryParams.push(start_date);
    }

    if (end_date) {
      paramCount++;
      whereConditions.push(`t.date <= $${paramCount}`);
      queryParams.push(end_date);
    }

    const whereClause = whereConditions.join(' AND ');

    // Validate sort parameters
    const validSortColumns = ['date', 'amount', 'description', 'type', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'date';
    const sortOrderValue = validSortOrders.includes(sort_order.toLowerCase()) ? sort_order.toUpperCase() : 'DESC';

    // Get transactions with category details
    const transactionsQuery = `
      SELECT 
        t.id,
        t.amount,
        t.description,
        t.type,
        t.date,
        t.created_at,
        t.updated_at,
        c.name as category_name,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE ${whereClause}
      ORDER BY t.${sortColumn} ${sortOrderValue}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limitNum, offset);
    const transactionsResult = await query(transactionsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams.slice(0, -2)); // Remove limit and offset
    const totalCount = parseInt(countResult.rows[0].total);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        transactions: transactionsResult.rows,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single transaction
const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.role === 'admin' ? null : req.user.id;

    let transactionQuery = `
      SELECT 
        t.id,
        t.user_id,
        t.amount,
        t.description,
        t.type,
        t.date,
        t.created_at,
        t.updated_at,
        c.name as category_name,
        c.color as category_color,
        c.id as category_id
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1
    `;

    let queryParams = [id];

    if (userId) {
      transactionQuery += ' AND t.user_id = $2';
      queryParams.push(userId);
    }

    const result = await query(transactionQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: {
        transaction: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, description, type, category_id, date } = req.body;
    const userId = req.user.id;

    // Verify category exists and matches transaction type
    const categoryResult = await query(
      'SELECT id, type FROM categories WHERE id = $1',
      [category_id]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    if (categoryResult.rows[0].type !== type) {
      return res.status(400).json({
        success: false,
        message: 'Category type does not match transaction type'
      });
    }

    // Create transaction
    const newTransaction = await query(`
      INSERT INTO transactions (user_id, amount, description, type, category_id, date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, amount, description, type, date, created_at
    `, [userId, amount, description, type, category_id, date]);

    const transaction = newTransaction.rows[0];

    // Get complete transaction details with category
    const completeTransaction = await query(`
      SELECT 
        t.id,
        t.amount,
        t.description,
        t.type,
        t.date,
        t.created_at,
        c.name as category_name,
        c.color as category_color,
        c.id as category_id
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1
    `, [transaction.id]);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        transaction: completeTransaction.rows[0]
      }
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { amount, description, type, category_id, date } = req.body;
    const userId = req.user.role === 'admin' ? null : req.user.id;

    // Check if transaction exists and user has permission
    let checkQuery = 'SELECT id, user_id FROM transactions WHERE id = $1';
    let checkParams = [id];

    if (userId) {
      checkQuery += ' AND user_id = $2';
      checkParams.push(userId);
    }

    const existingTransaction = await query(checkQuery, checkParams);

    if (existingTransaction.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify category exists and matches transaction type
    const categoryResult = await query(
      'SELECT id, type FROM categories WHERE id = $1',
      [category_id]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    if (categoryResult.rows[0].type !== type) {
      return res.status(400).json({
        success: false,
        message: 'Category type does not match transaction type'
      });
    }

    // Update transaction
    await query(`
      UPDATE transactions 
      SET amount = $1, description = $2, type = $3, category_id = $4, date = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [amount, description, type, category_id, date, id]);

    // Get updated transaction details
    const updatedTransaction = await query(`
      SELECT 
        t.id,
        t.amount,
        t.description,
        t.type,
        t.date,
        t.created_at,
        t.updated_at,
        c.name as category_name,
        c.color as category_color,
        c.id as category_id
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1
    `, [id]);

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: {
        transaction: updatedTransaction.rows[0]
      }
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.role === 'admin' ? null : req.user.id;

    // Check if transaction exists and user has permission
    let checkQuery = 'SELECT id FROM transactions WHERE id = $1';
    let checkParams = [id];

    if (userId) {
      checkQuery += ' AND user_id = $2';
      checkParams.push(userId);
    }

    const existingTransaction = await query(checkQuery, checkParams);

    if (existingTransaction.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Delete transaction
    await query('DELETE FROM transactions WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get transaction summary for user
const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? req.query.user_id || req.user.id : req.user.id;
    const { start_date, end_date } = req.query;

    let whereConditions = ['user_id = $1'];
    let queryParams = [userId];
    let paramCount = 1;

    if (start_date) {
      paramCount++;
      whereConditions.push(`date >= $${paramCount}`);
      queryParams.push(start_date);
    }

    if (end_date) {
      paramCount++;
      whereConditions.push(`date <= $${paramCount}`);
      queryParams.push(end_date);
    }

    const whereClause = whereConditions.join(' AND ');

    const summaryQuery = `
      SELECT 
        type,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE ${whereClause}
      GROUP BY type
    `;

    const result = await query(summaryQuery, queryParams);

    const summary = {
      income: { count: 0, total: 0 },
      expense: { count: 0, total: 0 },
      balance: 0
    };

    result.rows.forEach(row => {
      summary[row.type] = {
        count: parseInt(row.count),
        total: parseFloat(row.total)
      };
    });

    summary.balance = summary.income.total - summary.expense.total;

    res.json({
      success: true,
      data: { summary }
    });

  } catch (error) {
    console.error('Get transaction summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  transactionValidation
};
