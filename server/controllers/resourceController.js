const Resource = require('../models/Resource');
const { successResponse } = require('../utils/responseHelper');

/**
 * @desc    Get all available resources for booking
 * @route   GET /api/employee/resources
 * @access  Private (Employee)
 */
const getAvailableResources = async (req, res, next) => {
  try {
    const { type } = req.query;

    const where = { availability_status: 'Available' };
    if (type) where.type = type;

    const resources = await Resource.findAll({
      where,
      order: [['type', 'ASC'], ['name', 'ASC']],
    });

    return successResponse(res, 200, { resources });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAvailableResources };
