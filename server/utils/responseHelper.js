/**
 * Send a standardized success response.
 *
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g. 200, 201)
 * @param {object} data - Payload to include in the response
 */
const successResponse = (res, statusCode, data) => {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
};

/**
 * Send a standardized error response.
 *
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g. 400, 401, 409)
 * @param {string} message - Error message
 */
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { successResponse, errorResponse };
