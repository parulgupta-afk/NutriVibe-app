const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — JWT Bearer required.
 * Hardened with:
 *  - Strict Bearer token regex matching
 *  - Explicit algorithm pinning (HS256)
 *  - Production secret strength enforcement
 *  - Safe redaction (never logs token values)
 */
const auth = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer\s+([A-Za-z0-9\-_.]+)$/);
    if (match) {
      token = match[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
        error: { code: 'UNAUTHORIZED', message: 'Not authorized, no token' }
      });
    }

    const secret = process.env.JWT_SECRET || 'dev_secret_key_change_in_production_12345';
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('dev_secret')) {
        throw new Error('Insecure JWT_SECRET in production environment');
      }
    }

    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });

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
