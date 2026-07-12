/**
 * Centralized error-handling middleware for Express.
 * Must be registered AFTER all routes (4-arg signature tells Express this is an error handler).
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code set
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    const messages = err.errors.map((e) => e.message);
    message = messages.join(', ');
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    const messages = err.errors.map((e) => e.message);
    message = messages.length > 0 ? messages.join(', ') : 'A record with this value already exists';
  }

  // Handle JSON parse errors
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // Log stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
