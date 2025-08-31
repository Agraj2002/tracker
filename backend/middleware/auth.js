const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists in database
    const userResult = await query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check user roles
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Specific role middleware functions
const requireAdmin = requireRole(['admin']);
const requireUserOrAdmin = requireRole(['user', 'admin']);
const requireAnyRole = requireRole(['admin', 'user', 'read-only']);

// Middleware to check if user can access specific data
const checkDataOwnership = async (req, res, next) => {
  try {
    // Admin can access any data
    if (req.user.role === 'admin') {
      return next();
    }

    // For other roles, check if they're accessing their own data
    const { id } = req.params;
    const userId = req.user.id;

    // If accessing transactions, verify ownership
    if (req.route.path.includes('/transactions')) {
      if (id) {
        const transactionResult = await query(
          'SELECT user_id FROM transactions WHERE id = $1',
          [id]
        );

        if (transactionResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Transaction not found'
          });
        }

        if (transactionResult.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied - not your transaction'
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('Data ownership check error:', error);
    res.status(500).json({
      success: false,
      message: 'Access verification failed'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireUserOrAdmin,
  requireAnyRole,
  checkDataOwnership
};
