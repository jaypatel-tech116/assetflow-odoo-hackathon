const { Op } = require('sequelize');
const Asset = require('../models/Asset');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get all assets assigned to the logged-in employee
 * @route   GET /api/employee/assets
 * @access  Private (Employee)
 */
const getMyAssets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, category, page = 1, limit = 10 } = req.query;

    const where = { assigned_to: userId, status: 'Allocated' };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { asset_tag: { [Op.like]: `%${search}%` } },
        { serial_number: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Asset.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['assigned_date', 'DESC']],
    });

    return successResponse(res, 200, {
      assets: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyAssets };
