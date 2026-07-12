const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware factory that restricts access to specific roles.
 * Usage: roleMiddleware('Admin', 'Asset Manager')
 *
 * Must be placed AFTER authMiddleware (verifyToken) so req.user exists.
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
