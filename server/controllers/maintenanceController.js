const { Op } = require('sequelize');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Asset = require('../models/Asset');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get maintenance requests for the logged-in employee
 * @route   GET /api/employee/maintenance
 * @access  Private (Employee)
 */
const getMyMaintenanceRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { user_id: userId };
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await MaintenanceRequest.findAndCountAll({
      where,
      include: [{ model: Asset, as: 'asset', attributes: ['name', 'asset_tag'] }],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    return successResponse(res, 200, {
      maintenanceRequests: rows,
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

/**
 * @desc    Create a new maintenance request
 * @route   POST /api/employee/maintenance
 * @access  Private (Employee)
 */
const createMaintenanceRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { asset_id, issue, priority } = req.body;

    if (!asset_id || !issue) {
      return errorResponse(res, 400, 'Asset and issue description are required');
    }

    // Verify asset is assigned to this employee
    const asset = await Asset.findOne({
      where: { id: asset_id, assigned_to: userId },
    });

    if (!asset) {
      return errorResponse(res, 404, 'Asset not found or not assigned to you');
    }

    const request = await MaintenanceRequest.create({
      user_id: userId,
      asset_id,
      issue,
      priority: priority || 'Medium',
      requested_on: new Date().toISOString().split('T')[0],
    });

    // Create notification
    await Notification.create({
      user_id: userId,
      type: 'info',
      message: `Your maintenance request ${request.request_id} has been submitted successfully.`,
    });

    return successResponse(res, 201, {
      message: 'Maintenance request submitted successfully',
      maintenanceRequest: request,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyMaintenanceRequests, createMaintenanceRequest };
