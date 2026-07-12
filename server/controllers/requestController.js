const { Op } = require('sequelize');
const { Request, User, Asset, Notification } = require('../config/associations');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Generate human-readable request ID like TR-0007
const genRequestId = async (type) => {
  const prefixMap = { Transfer: 'TR', Return: 'RR', Maintenance: 'MR', Booking: 'BK', 'New Asset': 'NA' };
  const prefix = prefixMap[type] || 'RQ';
  const count = await Request.count({ where: { type } });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * GET /api/requests
 * List requests. Department Head sees dept requests; Employee sees own.
 */
const listRequests = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const user = await User.findByPk(req.user.id);

    const where = {};
    if (req.user.role === 'Employee') {
      where.employee_id = req.user.id;
    } else if (req.user.role === 'Department Head' && user?.department_id) {
      where.department_id = user.department_id;
    }

    if (type) where.type = type;
    if (status) where.status = status;

    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await Request.findAndCountAll({
      where,
      include: [
        { model: User, as: 'employee', attributes: ['id', 'full_name', 'role'] },
        { model: Asset, as: 'asset', attributes: ['id', 'tag', 'name', 'category'] },
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
    });

    return successResponse(res, 200, { requests: rows, total: count, page: Number(page), pages: Math.ceil(count / Number(limit)) });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * POST /api/requests
 * Submit a new request.
 */
const createRequest = async (req, res) => {
  try {
    const { type, asset_id, resource_id, reason, notes } = req.body;
    if (!type || !reason) return errorResponse(res, 400, 'type and reason are required');

    const user = await User.findByPk(req.user.id);
    const request_id = await genRequestId(type);

    const newReq = await Request.create({
      request_id,
      type,
      employee_id: req.user.id,
      asset_id: asset_id || null,
      resource_id: resource_id || null,
      reason,
      notes: notes || null,
      status: 'Pending',
      department_id: user?.department_id || null,
    });

    // Notify dept head (if exists)
    if (user?.department_id) {
      const head = await User.findOne({ where: { department_id: user.department_id, role: 'Department Head' } });
      if (head) {
        await Notification.create({
          user_id: head.id,
          title: `New ${type} Request`,
          body: `${user.full_name} submitted ${request_id}: ${reason}`,
          type: 'info',
          entity_type: 'request',
          entity_id: newReq.id,
        });
      }
    }

    return successResponse(res, 201, { message: 'Request submitted', request: newReq });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * PUT /api/requests/:id/approve
 */
const approveRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: [{ model: User, as: 'employee', attributes: ['id', 'full_name'] }],
    });
    if (!request) return errorResponse(res, 404, 'Request not found');
    if (request.status !== 'Pending') return errorResponse(res, 400, 'Request is not pending');

    await request.update({
      status: 'Approved',
      approved_by: req.user.id,
      approved_at: new Date(),
      notes: req.body.notes || request.notes,
    });

    // Notify employee
    await Notification.create({
      user_id: request.employee_id,
      title: `${request.type} Request Approved`,
      body: `Your request ${request.request_id} has been approved.`,
      type: 'success',
      entity_type: 'request',
      entity_id: request.id,
    });

    return successResponse(res, 200, { message: 'Request approved', request });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * PUT /api/requests/:id/reject
 */
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return errorResponse(res, 404, 'Request not found');
    if (request.status !== 'Pending') return errorResponse(res, 400, 'Request is not pending');

    await request.update({
      status: 'Rejected',
      approved_by: req.user.id,
      approved_at: new Date(),
      notes: req.body.notes || request.notes,
    });

    await Notification.create({
      user_id: request.employee_id,
      title: `${request.type} Request Rejected`,
      body: `Your request ${request.request_id} has been rejected. ${req.body.notes || ''}`,
      type: 'error',
      entity_type: 'request',
      entity_id: request.id,
    });

    return successResponse(res, 200, { message: 'Request rejected', request });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = { listRequests, createRequest, approveRequest, rejectRequest };
