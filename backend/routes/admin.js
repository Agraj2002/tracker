const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { 
  authenticateToken, 
  requireAdmin 
} = require('../middleware/auth');
const { generalLimiter } = require('../middleware/security');

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
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
 *           default: 20
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user, read-only]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/users', 
  generalLimiter,
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        search
      } = req.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      if (role) {
        paramCount++;
        whereConditions.push(`role = $${paramCount}`);
        queryParams.push(role);
      }

      if (search) {
        paramCount++;
        whereConditions.push(`(name ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
        queryParams.push(`%${search}%`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get users
      const usersQuery = `
        SELECT 
          id, email, name, role, created_at, updated_at,
          (SELECT COUNT(*) FROM transactions WHERE user_id = users.id) as transaction_count
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      queryParams.push(limitNum, offset);
      const usersResult = await query(usersQuery, queryParams);

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
      const countResult = await query(countQuery, queryParams.slice(0, -2));
      const totalCount = parseInt(countResult.rows[0].total);

      const totalPages = Math.ceil(totalCount / limitNum);

      res.json({
        success: true,
        data: {
          users: usersResult.rows.map(user => ({
            ...user,
            transaction_count: parseInt(user.transaction_count)
          })),
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalCount,
            limit: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
          }
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Admin]
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
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, user, read-only]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put('/users/:id/role', 
  generalLimiter,
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate role
      const validRoles = ['admin', 'user', 'read-only'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }

      // Check if user exists
      const userResult = await query(
        'SELECT id, email, role FROM users WHERE id = $1',
        [id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      // Prevent admin from changing their own role
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change your own role'
        });
      }

      // Update user role
      const updatedUser = await query(`
        UPDATE users 
        SET role = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, email, name, role, updated_at
      `, [role, id]);

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: {
          user: updatedUser.rows[0]
        }
      });

    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
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
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', 
  generalLimiter,
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user exists
      const userResult = await query(
        'SELECT id FROM users WHERE id = $1',
        [id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent admin from deleting their own account
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      // Delete user (transactions will be deleted due to CASCADE)
      await query('DELETE FROM users WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/stats', 
  generalLimiter,
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      // Get user statistics
      const userStats = await query(`
        SELECT 
          role,
          COUNT(*) as count
        FROM users
        GROUP BY role
      `);

      // Get transaction statistics
      const transactionStats = await query(`
        SELECT 
          type,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as total
        FROM transactions
        GROUP BY type
      `);

      // Get recent activity
      const recentActivity = await query(`
        SELECT 
          u.name as user_name,
          u.email as user_email,
          COUNT(t.id) as transaction_count,
          MAX(t.created_at) as last_transaction
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id
        GROUP BY u.id, u.name, u.email
        ORDER BY last_transaction DESC NULLS LAST
        LIMIT 10
      `);

      // Get monthly transaction trends
      const monthlyTrends = await query(`
        SELECT 
          DATE_TRUNC('month', date) as month,
          type,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
        GROUP BY DATE_TRUNC('month', date), type
        ORDER BY month ASC
      `);

      res.json({
        success: true,
        data: {
          userStats: userStats.rows.reduce((acc, row) => {
            acc[row.role] = parseInt(row.count);
            return acc;
          }, {}),
          transactionStats: transactionStats.rows.reduce((acc, row) => {
            acc[row.type] = {
              count: parseInt(row.count),
              total: parseFloat(row.total)
            };
            return acc;
          }, {}),
          recentActivity: recentActivity.rows.map(row => ({
            userName: row.user_name,
            userEmail: row.user_email,
            transactionCount: parseInt(row.transaction_count),
            lastTransaction: row.last_transaction
          })),
          monthlyTrends: monthlyTrends.rows
        }
      });

    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

module.exports = router;
