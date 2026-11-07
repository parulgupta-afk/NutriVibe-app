/**
 * Role-based access control middleware.
 * Ensures req.user exists and has one of the allowed roles.
 */
function requireRole(...roles) {
  const allowed = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin only: access denied',
      });
    }

    next();
  };
}

module.exports = requireRole;

