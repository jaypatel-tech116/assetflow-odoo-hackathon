const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware to verify JWT from Authorization header.
 * Attaches decoded payload (id, role) to req.user.
 * NOT applied to public routes like login/register.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token has expired. Please log in again.');
    }
    return errorResponse(res, 401, 'Invalid token.');
  }
};

module.exports = { verifyToken };
