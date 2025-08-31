const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');

// Validation rules
const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code')
];

// Get all categories
const getCategories = async (req, res) => {
  try {
    const { type } = req.query;

    let categoriesQuery = 'SELECT id, name, type, color, created_at FROM categories';
    let queryParams = [];

    if (type) {
      categoriesQuery += ' WHERE type = $1';
      queryParams.push(type);
    }

    categoriesQuery += ' ORDER BY type, name';

    const result = await query(categoriesQuery, queryParams);

    res.json({
      success: true,
      data: {
        categories: result.rows
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single category
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, name, type, color, created_at FROM categories WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new category (Admin only)
const createCategory = async (req, res) => {
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

    const { name, type, color = '#6366f1' } = req.body;

    // Check if category with same name already exists
    const existingCategory = await query(
      'SELECT id FROM categories WHERE name = $1',
      [name]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Create category
    const newCategory = await query(`
      INSERT INTO categories (name, type, color)
      VALUES ($1, $2, $3)
      RETURNING id, name, type, color, created_at
    `, [name, type, color]);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category: newCategory.rows[0]
      }
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
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
    const { name, type, color } = req.body;

    // Check if category exists
    const existingCategory = await query(
      'SELECT id FROM categories WHERE id = $1',
      [id]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if another category with same name exists
    const duplicateCategory = await query(
      'SELECT id FROM categories WHERE name = $1 AND id != $2',
      [name, id]
    );

    if (duplicateCategory.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Another category with this name already exists'
      });
    }

    // Update category
    const updatedCategory = await query(`
      UPDATE categories 
      SET name = $1, type = $2, color = $3
      WHERE id = $4
      RETURNING id, name, type, color, created_at
    `, [name, type, color, id]);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category: updatedCategory.rows[0]
      }
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete category (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await query(
      'SELECT id FROM categories WHERE id = $1',
      [id]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category is being used in transactions
    const transactionCount = await query(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = $1',
      [id]
    );

    if (parseInt(transactionCount.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that is being used in transactions'
      });
    }

    // Delete category
    await query('DELETE FROM categories WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get category usage statistics
const getCategoryStats = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? req.query.user_id : req.user.id;
    const { start_date, end_date } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (userId) {
      paramCount++;
      whereConditions.push(`t.user_id = $${paramCount}`);
      queryParams.push(userId);
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

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const statsQuery = `
      SELECT 
        c.id,
        c.name,
        c.type,
        c.color,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_amount
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id ${whereClause ? 'AND ' + whereConditions.join(' AND ') : ''}
      ${whereClause}
      GROUP BY c.id, c.name, c.type, c.color
      ORDER BY total_amount DESC
    `;

    const result = await query(statsQuery, queryParams);

    res.json({
      success: true,
      data: {
        categoryStats: result.rows.map(row => ({
          ...row,
          transaction_count: parseInt(row.transaction_count),
          total_amount: parseFloat(row.total_amount)
        }))
      }
    });

  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  categoryValidation
};
