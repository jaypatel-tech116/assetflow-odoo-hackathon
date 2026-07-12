const { Op } = require('sequelize');
const TransferRequest = require('../models/TransferRequest');
const Asset = require('../models/Asset');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get transfer/return requests for the logged-in employee
 * @route   GET /api/employee/transfers
 * @access  Private (Employee)
 */
const getMyTransferRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, status, page = 1, limit = 10 } = req.query;

    const where = { user_id: userId };
    if (type) where.type = type;
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await TransferRequest.findAndCountAll({
      where,
      include: [{ model: Asset, as: 'asset', attributes: ['name', 'asset_tag'] }],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    return successResponse(res, 200, {
      transferRequests: rows,
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
 * @desc    Create a transfer request
 * @route   POST /api/employee/transfers
 * @access  Private (Employee)
 */
const createTransferRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { asset_id, to_from } = req.body;

    if (!asset_id || !to_from) {
      return errorResponse(res, 400, 'Asset and transfer destination are required');
    }

    const asset = await Asset.findOne({
      where: { id: asset_id, assigned_to: userId },
    });

    if (!asset) {
      return errorResponse(res, 404, 'Asset not found or not assigned to you');
    }

    const request = await TransferRequest.create({
      user_id: userId,
      asset_id,
      type: 'Transfer',
      to_from,
      requested_on: new Date().toISOString().split('T')[0],
    });

    await Notification.create({
      user_id: userId,
      type: 'info',
      message: `Transfer request ${request.request_id} for ${asset.name} has been submitted.`,
    });

    return successResponse(res, 201, {
      message: 'Transfer request submitted successfully',
      transferRequest: request,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a return request
 * @route   POST /api/employee/returns
 * @access  Private (Employee)
 */
const createReturnRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { asset_id } = req.body;

    if (!asset_id) {
      return errorResponse(res, 400, 'Asset ID is required');
    }

    const asset = await Asset.findOne({
      where: { id: asset_id, assigned_to: userId },
    });

    if (!asset) {
      return errorResponse(res, 404, 'Asset not found or not assigned to you');
    }

    const request = await TransferRequest.create({
      user_id: userId,
      asset_id,
      type: 'Return',
      to_from: 'IT Department',
      requested_on: new Date().toISOString().split('T')[0],
    });

    await Notification.create({
      user_id: userId,
      type: 'info',
      message: `Return request ${request.request_id} for ${asset.name} has been submitted.`,
    });

    return successResponse(res, 201, {
      message: 'Return request submitted successfully',
      transferRequest: request,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyTransferRequests, createTransferRequest, createReturnRequest };
