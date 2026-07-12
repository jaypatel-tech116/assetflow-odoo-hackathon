const jwt = require('jsonwebtoken');

/**
 * Generate a JWT for the given user.
 * Payload contains only user id and role — never password or sensitive data.
 *
 * @param {object} user - The user object (must have id and role)
 * @returns {string} Signed JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
