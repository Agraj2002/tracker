const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  categoryValidation
} = require('../controllers/categoryController');
const { 
  authenticateToken, 
  requireAdmin, 
  requireAnyRole 
} = require('../middleware/auth');
const { generalLimiter } = require('../middleware/security');
const { 
  cacheCategories, 
  invalidateCategoriesCacheAfterModification 
} = require('../middleware/cache');

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [income, expense]
 *         color:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CategoryRequest:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         type:
 *           type: string
 *           enum: [income, expense]
 *         color:
 *           type: string
 *           pattern: '^#[0-9A-F]{6}$'
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', 
  generalLimiter,
  authenticateToken, 
  requireAnyRole,
  cacheCategories,
  getCategories
);

/**
 * @swagger
 * /api/categories/stats:
 *   get:
 *     summary: Get category usage statistics
 *     tags: [Categories]
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
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Only available for admin users
 *     responses:
 *       200:
 *         description: Category statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', 
  generalLimiter,
  authenticateToken, 
  requireAnyRole,
  getCategoryStats
);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a specific category
 *     tags: [Categories]
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
 *         description: Category retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.get('/:id', 
  generalLimiter,
  authenticateToken, 
  requireAnyRole,
  getCategory
);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryRequest'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Category already exists
 */
router.post('/', 
  generalLimiter,
  authenticateToken, 
  requireAdmin,
  categoryValidation,
  invalidateCategoriesCacheAfterModification,
  createCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/CategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 */
router.put('/:id', 
  generalLimiter,
  authenticateToken, 
  requireAdmin,
  categoryValidation,
  invalidateCategoriesCacheAfterModification,
  updateCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Categories]
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
 *         description: Category deleted successfully
 *       400:
 *         description: Category is being used in transactions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 */
router.delete('/:id', 
  generalLimiter,
  authenticateToken, 
  requireAdmin,
  invalidateCategoriesCacheAfterModification,
  deleteCategory
);

module.exports = router;
