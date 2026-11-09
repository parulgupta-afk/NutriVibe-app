const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — JWT Bearer required.
 * - Strict "Bearer <token>" parse
 * - algorithms: ['HS256'] only
 * - tokenVersion must match user.tokenVersion (logout-all / password change)
 */
const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || typeof header !== 'string' || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
        error: { code: 'UNAUTHORIZED', message: 'Not authorized, no token' },
      });
    }

    const token = header.slice(7).trim();
    if (!token || token.split('.').length !== 3) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
      });
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          success: false,
          message: 'Server misconfigured',
          error: { code: 'SERVER_ERROR', message: 'Server misconfigured' },
        });
      }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: { code: 'UNAUTHORIZED', message: 'User not found' },
      });
    }

    const tokenVersion = typeof decoded.tokenVersion === 'number' ? decoded.tokenVersion : 0;
    const currentVersion = typeof user.tokenVersion === 'number' ? user.tokenVersion : 0;
    if (tokenVersion !== currentVersion) {
      return res.status(401).json({
        success: false,
        message: 'Token revoked',
        error: { code: 'UNAUTHORIZED', message: 'Token revoked' },
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth error:', error.name, error.message);
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: { code: 'UNAUTHORIZED', message: 'Token expired' },
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: { code: 'UNAUTHORIZED', message: 'Authentication failed' },
    });
  }
};

module.exports = auth;
