const { Op, fn, col, literal } = require('sequelize');
const { Asset, Allocation, MaintenanceRequest, ResourceBooking, TransferRequest, User, Department } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get role-aware dashboard data
 * @route   GET /api/dashboard
 * @access  Private
 */
const getDashboardData = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // KPI counts
    const assetsAvailable = await Asset.count({ where: { status: 'Available' } });
    const assetsAllocated = await Asset.count({ where: { status: 'Allocated' } });
    const maintenanceToday = await MaintenanceRequest.count({
      where: {
        status: { [Op.in]: ['In Progress', 'Approved', 'Technician Assigned'] },
      },
    });
    const activeBookings = await ResourceBooking.count({
      where: {
        status: { [Op.in]: ['Upcoming', 'Ongoing'] },
      },
    });
    const pendingApprovals = await MaintenanceRequest.count({ where: { status: 'Pending' } })
      + await TransferRequest.count({ where: { status: 'Requested' } });
    const upcomingReturns = await Allocation.count({
      where: {
        status: 'Active',
        expected_return_date: { [Op.not]: null, [Op.gte]: today },
      },
    });

    // Overdue allocations
    const overdueAllocations = await Allocation.findAll({
      where: {
        status: 'Active',
        expected_return_date: { [Op.not]: null, [Op.lt]: today },
      },
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'asset_tag', 'name'] },
        { model: User, as: 'employee', attributes: ['id', 'full_name', 'email'] },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
      ],
      order: [['expected_return_date', 'ASC']],
      limit: 10,
    });

    // Pending transfer requests
    const pendingTransfers = await TransferRequest.findAll({
      where: { status: 'Requested' },
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'asset_tag', 'name'] },
        { model: User, as: 'requester', attributes: ['id', 'full_name'] },
        { model: User, as: 'currentHolder', attributes: ['id', 'full_name'] },
      ],
      order: [['requested_on', 'DESC']],
      limit: 10,
    });

    // Pending maintenance requests
    const pendingMaintenance = await MaintenanceRequest.findAll({
      where: { status: 'Pending' },
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'asset_tag', 'name'] },
        { model: User, as: 'raisedByUser', attributes: ['id', 'full_name'] },
      ],
      order: [['raised_on', 'DESC']],
      limit: 10,
    });

    return successResponse(res, 200, {
      kpi: {
        assetsAvailable,
        assetsAllocated,
        maintenanceToday,
        activeBookings,
        pendingApprovals,
        upcomingReturns,
      },
      overdueAllocations,
      pendingTransfers,
      pendingMaintenance,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardData };
