const { TransferRequest, Asset, User, Department, Allocation } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notifier');

const createTransferRequest = async (req, res, next) => {
  try {
    const { asset_id, requested_to_employee_id, requested_to_department_id } = req.body;
    if (!asset_id) return errorResponse(res, 400, 'Asset ID is required');

    const asset = await Asset.findByPk(asset_id);
    if (!asset) return errorResponse(res, 404, 'Asset not found');

    const activeAllocation = await Allocation.findOne({
      where: { asset_id, status: 'Active' },
    });
    const currentHolderId = activeAllocation ? activeAllocation.employee_id : null;
    if (!currentHolderId) return errorResponse(res, 400, 'Asset is not currently allocated to anyone');

    const transfer = await TransferRequest.create({
      asset_id,
      requested_by: req.user.id,
      current_holder_id: currentHolderId,
      requested_to_employee_id: requested_to_employee_id || null,
      requested_to_department_id: requested_to_department_id || null,
      status: 'Requested',
      requested_on: new Date(),
    });
    await logActivity(req.user.id, 'Transfer Requested', 'Allocations', `Asset ${asset.asset_tag}`);
    return successResponse(res, 201, { message: 'Transfer request created', transfer });
  } catch (err) { next(err); }
};

const getAllTransferRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: transfers } = await TransferRequest.findAndCountAll({
      where,
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'asset_tag', 'name'] },
        { model: User, as: 'requester', attributes: ['id', 'full_name'] },
        { model: User, as: 'currentHolder', attributes: ['id', 'full_name'] },
        { model: User, as: 'targetEmployee', attributes: ['id', 'full_name'] },
        { model: Department, as: 'targetDepartment', attributes: ['id', 'name'] },
        { model: User, as: 'approver', attributes: ['id', 'full_name'] },
      ],
      order: [['requested_on', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return successResponse(res, 200, {
      transfers,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

const approveTransfer = async (req, res, next) => {
  try {
    const transfer = await TransferRequest.findByPk(req.params.id, {
      include: [{ model: Asset, as: 'asset' }],
    });
    if (!transfer) return errorResponse(res, 404, 'Transfer request not found');
    if (transfer.status !== 'Requested') return errorResponse(res, 400, 'Transfer is not in Requested status');

    // Return from current holder
    const activeAllocation = await Allocation.findOne({
      where: { asset_id: transfer.asset_id, status: 'Active' },
    });
    if (activeAllocation) {
      await activeAllocation.update({ status: 'Returned', returned_on: new Date() });
    }

    // Create new allocation for target
    const newAllocation = await Allocation.create({
      asset_id: transfer.asset_id,
      employee_id: transfer.requested_to_employee_id || null,
      department_id: transfer.requested_to_department_id || null,
      allocated_on: new Date(),
      status: 'Active',
      allocated_by: req.user.id,
    });

    await transfer.update({ status: 'Approved', approved_by: req.user.id, resolved_on: new Date() });
    await transfer.asset.update({ status: 'Allocated' });

    await logActivity(req.user.id, 'Approved Transfer', 'Allocations', `Asset ${transfer.asset.asset_tag}`);
    await createNotification(transfer.requested_by, 'TransferApproved', `Transfer request for asset ${transfer.asset.asset_tag} has been approved`, 'Asset', transfer.asset_id);

    return successResponse(res, 200, { message: 'Transfer approved and asset re-allocated', transfer });
  } catch (err) { next(err); }
};

const rejectTransfer = async (req, res, next) => {
  try {
    const transfer = await TransferRequest.findByPk(req.params.id, {
      include: [{ model: Asset, as: 'asset' }],
    });
    if (!transfer) return errorResponse(res, 404, 'Transfer request not found');
    if (transfer.status !== 'Requested') return errorResponse(res, 400, 'Transfer is not in Requested status');
    await transfer.update({ status: 'Rejected', approved_by: req.user.id, resolved_on: new Date() });
    await logActivity(req.user.id, 'Rejected Transfer', 'Allocations', `Asset ${transfer.asset.asset_tag}`);
    return successResponse(res, 200, { message: 'Transfer request rejected', transfer });
  } catch (err) { next(err); }
};

module.exports = { createTransferRequest, getAllTransferRequests, approveTransfer, rejectTransfer };
