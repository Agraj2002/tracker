const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');

// XSS Protection middleware
const xssProtection = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }

  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    }
  }

  next();
};

// SQL Injection Protection - Input validation
const validateInput = (req, res, next) => {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi,
    /(\'|\"|;|--|\*|\/\*|\*\/)/g,
    /(\bOR\b.*=.*\bOR\b)/gi,
    /(\bAND\b.*=.*\bAND\b)/gi
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return dangerousPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  // Check request body
  if (req.body) {
    for (const key in req.body) {
      if (checkValue(req.body[key])) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input detected'
        });
      }
    }
  }

  // Check query parameters
  if (req.query) {
    for (const key in req.query) {
      if (checkValue(req.query[key])) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameter detected'
        });
      }
    }
  }

  next();
};

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in test environment
    skip: (req) => process.env.NODE_ENV === 'test'
  });
};

// Auth endpoints rate limiting: 5 requests per 15 minutes
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many authentication attempts, please try again later'
);

// Transaction endpoints rate limiting: 100 requests per hour
const transactionLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  100,
  'Too many transaction requests, please try again later'
);

// Analytics endpoints rate limiting: 50 requests per hour
const analyticsLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  50,
  'Too many analytics requests, please try again later'
);

// General API rate limiting: 1000 requests per hour
const generalLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  1000,
  'Too many requests, please try again later'
);

// Helmet configuration for security headers
const helmetConfig = helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = {
  xssProtection,
  validateInput,
  authLimiter,
  transactionLimiter,
  analyticsLimiter,
  generalLimiter,
  helmetConfig
};
