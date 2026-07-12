const { Op } = require('sequelize');
<<<<<<< HEAD
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
=======
const { MaintenanceRequest, Asset, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notifier');

const createMaintenanceRequest = async (req, res, next) => {
  try {
    const { asset_id, issue_description, priority } = req.body;
    if (!asset_id || !issue_description) return errorResponse(res, 400, 'Asset and issue description are required');
    const asset = await Asset.findByPk(asset_id);
    if (!asset) return errorResponse(res, 404, 'Asset not found');
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
    const mr = await MaintenanceRequest.create({
      asset_id, raised_by: req.user.id, issue_description, priority: priority || 'Medium', photo_url, status: 'Pending', raised_on: new Date(),
    });
    await logActivity(req.user.id, 'Raised Maintenance Request', 'Maintenance', `${mr.request_code} for ${asset.asset_tag}`);
    return successResponse(res, 201, { message: 'Maintenance request created', maintenanceRequest: mr });
  } catch (err) { next(err); }
};

const getAllMaintenanceRequests = async (req, res, next) => {
  try {
    const { status, priority, asset_id, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (asset_id) where.asset_id = asset_id;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await MaintenanceRequest.findAndCountAll({
      where,
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'asset_tag', 'name', 'status', 'location'] },
        { model: User, as: 'raisedByUser', attributes: ['id', 'full_name'] },
        { model: User, as: 'approver', attributes: ['id', 'full_name'] },
        { model: User, as: 'technician', attributes: ['id', 'full_name'] },
      ],
      order: [['raised_on', 'DESC']],
      limit: parseInt(limit), offset,
    });
    return successResponse(res, 200, { maintenanceRequests: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const getMaintenanceRequestById = async (req, res, next) => {
  try {
    const mr = await MaintenanceRequest.findByPk(req.params.id, {
      include: [
        { model: Asset, as: 'asset' },
        { model: User, as: 'raisedByUser', attributes: ['id', 'full_name'] },
        { model: User, as: 'approver', attributes: ['id', 'full_name'] },
        { model: User, as: 'technician', attributes: ['id', 'full_name'] },
      ],
    });
    if (!mr) return errorResponse(res, 404, 'Maintenance request not found');
    return successResponse(res, 200, { maintenanceRequest: mr });
  } catch (err) { next(err); }
};

const approveMaintenanceRequest = async (req, res, next) => {
  try {
    const mr = await MaintenanceRequest.findByPk(req.params.id, { include: [{ model: Asset, as: 'asset' }] });
    if (!mr) return errorResponse(res, 404, 'Maintenance request not found');
    if (mr.status !== 'Pending') return errorResponse(res, 400, 'Request is not in Pending status');
    await mr.update({ status: 'Approved', approved_by: req.user.id });
    await mr.asset.update({ status: 'Under Maintenance' });
    await logActivity(req.user.id, 'Approved Maintenance Request', 'Maintenance', `${mr.request_code}`);
    await createNotification(mr.raised_by, 'MaintenanceApproved', `Maintenance request ${mr.request_code} has been approved`, 'MaintenanceRequest', mr.id);
    return successResponse(res, 200, { message: 'Maintenance request approved', maintenanceRequest: mr });
  } catch (err) { next(err); }
};

const rejectMaintenanceRequest = async (req, res, next) => {
  try {
    const { rejection_reason } = req.body;
    const mr = await MaintenanceRequest.findByPk(req.params.id, { include: [{ model: Asset, as: 'asset' }] });
    if (!mr) return errorResponse(res, 404, 'Maintenance request not found');
    if (mr.status !== 'Pending') return errorResponse(res, 400, 'Request is not in Pending status');
    await mr.update({ status: 'Rejected', approved_by: req.user.id, rejection_reason: rejection_reason || null });
    await logActivity(req.user.id, 'Rejected Maintenance Request', 'Maintenance', `${mr.request_code}`);
    await createNotification(mr.raised_by, 'MaintenanceRejected', `Maintenance request ${mr.request_code} has been rejected${rejection_reason ? ': ' + rejection_reason : ''}`, 'MaintenanceRequest', mr.id);
    return successResponse(res, 200, { message: 'Maintenance request rejected', maintenanceRequest: mr });
  } catch (err) { next(err); }
};

const assignTechnician = async (req, res, next) => {
  try {
    const { technician_id, eta } = req.body;
    if (!technician_id) return errorResponse(res, 400, 'Technician ID is required');
    const mr = await MaintenanceRequest.findByPk(req.params.id);
    if (!mr) return errorResponse(res, 404, 'Maintenance request not found');
    if (mr.status !== 'Approved') return errorResponse(res, 400, 'Request must be Approved first');
    await mr.update({ status: 'Technician Assigned', technician_id, eta: eta || null });
    await logActivity(req.user.id, 'Assigned Technician', 'Maintenance', `${mr.request_code}`);
    return successResponse(res, 200, { message: 'Technician assigned', maintenanceRequest: mr });
  } catch (err) { next(err); }
};

const startMaintenance = async (req, res, next) => {
  try {
    const mr = await MaintenanceRequest.findByPk(req.params.id);
    if (!mr) return errorResponse(res, 404, 'Maintenance request not found');
    if (mr.status !== 'Technician Assigned') return errorResponse(res, 400, 'Technician must be assigned first');
    await mr.update({ status: 'In Progress', started_on: new Date() });
    await logActivity(req.user.id, 'Started Maintenance', 'Maintenance', `${mr.request_code}`);
    return successResponse(res, 200, { message: 'Maintenance started', maintenanceRequest: mr });
  } catch (err) { next(err); }
};

const resolveMaintenance = async (req, res, next) => {
  try {
    const mr = await MaintenanceRequest.findByPk(req.params.id, { include: [{ model: Asset, as: 'asset' }] });
    if (!mr) return errorResponse(res, 404, 'Maintenance request not found');
    if (mr.status !== 'In Progress') return errorResponse(res, 400, 'Request must be In Progress to resolve');
    await mr.update({ status: 'Resolved', resolved_on: new Date() });
    await mr.asset.update({ status: 'Available' });
    await logActivity(req.user.id, 'Resolved Maintenance', 'Maintenance', `${mr.request_code}`);
    return successResponse(res, 200, { message: 'Maintenance resolved', maintenanceRequest: mr });
  } catch (err) { next(err); }
};

const closeMaintenance = async (req, res, next) => {
  try {
    const mr = await MaintenanceRequest.findByPk(req.params.id);
    if (!mr) return errorResponse(res, 404, 'Maintenance request not found');
    if (mr.status !== 'Resolved') return errorResponse(res, 400, 'Request must be Resolved to close');
    await mr.update({ status: 'Closed' });
    await logActivity(req.user.id, 'Closed Maintenance', 'Maintenance', `${mr.request_code}`);
    return successResponse(res, 200, { message: 'Maintenance closed', maintenanceRequest: mr });
  } catch (err) { next(err); }
};

module.exports = { createMaintenanceRequest, getAllMaintenanceRequests, getMaintenanceRequestById, approveMaintenanceRequest, rejectMaintenanceRequest, assignTechnician, startMaintenance, resolveMaintenance, closeMaintenance };
>>>>>>> origin/jay
