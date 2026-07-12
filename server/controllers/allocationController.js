const { Op } = require('sequelize');
const { Allocation, Asset, User, Department } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notifier');

const allocateAsset = async (req, res, next) => {
  try {
    const { asset_id, employee_id, department_id, expected_return_date } = req.body;
    if (!asset_id) return errorResponse(res, 400, 'Asset ID is required');
    if (!employee_id && !department_id) return errorResponse(res, 400, 'Employee or department is required');

    const asset = await Asset.findByPk(asset_id);
    if (!asset) return errorResponse(res, 404, 'Asset not found');

    // Double-allocation guard
    if (asset.status === 'Allocated') {
      const activeAllocation = await Allocation.findOne({
        where: { asset_id, status: 'Active' },
        include: [{ model: User, as: 'employee', attributes: ['id', 'full_name'] }],
      });
      const holderName = activeAllocation?.employee?.full_name || 'Unknown';
      return errorResponse(res, 409, `Asset is currently allocated to ${holderName}. Use Transfer Request to reassign.`);
    }
    if (!['Available', 'Reserved'].includes(asset.status)) {
      return errorResponse(res, 400, `Cannot allocate an asset with status: ${asset.status}`);
    }

    const allocation = await Allocation.create({
      asset_id,
      employee_id: employee_id || null,
      department_id: department_id || null,
      allocated_on: new Date(),
      expected_return_date: expected_return_date || null,
      status: 'Active',
      allocated_by: req.user.id,
    });
    await asset.update({ status: 'Allocated', department_id: department_id || asset.department_id });

    await logActivity(req.user.id, 'Allocated Asset', 'Allocations', `${asset.asset_tag} allocated`);
    if (employee_id) {
      await createNotification(employee_id, 'AssetAssigned', `Asset ${asset.asset_tag} (${asset.name}) has been assigned to you`, 'Asset', asset.id);
    }
    return successResponse(res, 201, { message: 'Asset allocated successfully', allocation });
  } catch (err) { next(err); }
};

const returnAsset = async (req, res, next) => {
  try {
    const allocation = await Allocation.findByPk(req.params.id, {
      include: [{ model: Asset, as: 'asset' }],
    });
    if (!allocation) return errorResponse(res, 404, 'Allocation not found');
    if (allocation.status !== 'Active' && allocation.status !== 'Overdue') {
      return errorResponse(res, 400, 'This allocation is not active');
    }
    const { condition_on_return, condition_check_in_notes } = req.body;
    await allocation.update({
      returned_on: new Date(),
      condition_on_return: condition_on_return || null,
      condition_check_in_notes: condition_check_in_notes || null,
      status: 'Returned',
    });
    await allocation.asset.update({ status: 'Available' });

    await logActivity(req.user.id, 'Returned Asset', 'Allocations', `${allocation.asset.asset_tag} returned`);
    return successResponse(res, 200, { message: 'Asset returned successfully', allocation });
  } catch (err) { next(err); }
};

const getAllAllocations = async (req, res, next) => {
  try {
    const { status, asset_id, employee_id, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (asset_id) where.asset_id = asset_id;
    if (employee_id) where.employee_id = employee_id;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: allocations } = await Allocation.findAndCountAll({
      where,
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'asset_tag', 'name', 'status'] },
        { model: User, as: 'employee', attributes: ['id', 'full_name', 'email'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
        { model: User, as: 'allocator', attributes: ['id', 'full_name'] },
      ],
      order: [['allocated_on', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    return successResponse(res, 200, {
      allocations,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

const getOverdueAllocations = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Also update status to Overdue for any active allocation past due
    await Allocation.update(
      { status: 'Overdue' },
      { where: { status: 'Active', expected_return_date: { [Op.not]: null, [Op.lt]: today } } }
    );
    const overdue = await Allocation.findAll({
      where: { status: 'Overdue' },
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'asset_tag', 'name'] },
        { model: User, as: 'employee', attributes: ['id', 'full_name', 'email'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
      ],
      order: [['expected_return_date', 'ASC']],
    });
    return successResponse(res, 200, { allocations: overdue });
  } catch (err) { next(err); }
};

module.exports = { allocateAsset, returnAsset, getAllAllocations, getOverdueAllocations };
