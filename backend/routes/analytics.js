const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getMonthlyTrends,
  getSpendingPatterns,
  getBudgetAnalysis
} = require('../controllers/analyticsController');
const { 
  authenticateToken, 
  requireAnyRole 
} = require('../middleware/auth');
const { analyticsLimiter } = require('../middleware/security');
const { cacheAnalytics } = require('../middleware/cache');

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardAnalytics:
 *       type: object
 *       properties:
 *         period:
 *           type: string
 *         dateRange:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *             endDate:
 *               type: string
 *               format: date
 *         summary:
 *           type: object
 *           properties:
 *             income:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: number
 *             expense:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: number
 *             balance:
 *               type: number
 *         categoryBreakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               color:
 *                 type: string
 *               transactionCount:
 *                 type: integer
 *               totalAmount:
 *                 type: number
 *               percentage:
 *                 type: number
 */

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Only available for admin users
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardAnalytics'
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', 
  analyticsLimiter,
  authenticateToken, 
  requireAnyRole,
  cacheAnalytics,
  getDashboardAnalytics
);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: Get monthly trends data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 24
 *           default: 12
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Only available for admin users
 *     responses:
 *       200:
 *         description: Monthly trends retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/trends', 
  analyticsLimiter,
  authenticateToken, 
  requireAnyRole,
  getMonthlyTrends
);

/**
 * @swagger
 * /api/analytics/patterns:
 *   get:
 *     summary: Get spending patterns data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Only available for admin users
 *     responses:
 *       200:
 *         description: Spending patterns retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/patterns', 
  analyticsLimiter,
  authenticateToken, 
  requireAnyRole,
  getSpendingPatterns
);

/**
 * @swagger
 * /api/analytics/budget:
 *   get:
 *     summary: Get budget analysis data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *           default: month
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Only available for admin users
 *     responses:
 *       200:
 *         description: Budget analysis retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/budget', 
  analyticsLimiter,
  authenticateToken, 
  requireAnyRole,
  getBudgetAnalysis
);

module.exports = router;
