const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — JWT Bearer required.
 * Phase 18: do not log token values; generic messages only.
 */
const auth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
        error: { code: 'UNAUTHORIZED', message: 'Not authorized, no token' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: { code: 'UNAUTHORIZED', message: 'User not found' }
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    // Phase 18: log error name only, never the token
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth error:', error.name, error.message);
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: { code: 'UNAUTHORIZED', message: 'Token expired' }
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: { code: 'UNAUTHORIZED', message: 'Authentication failed' }
    });
  }
};

module.exports = auth;
