<<<<<<< HEAD
const { Op } = require('sequelize');
const { Asset, User, Department, Request, Booking, Notification } = require('../config/associations');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * GET /api/dashboard/stats
 */
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    const deptId = user?.department_id;

    const whereAsset = deptId ? { department_id: deptId } : {};
    const whereRequest = deptId ? { department_id: deptId } : {};

    const [
      totalAssets,
      allocatedAssets,
      availableAssets,
      underMaintenance,
      lostAssets,
      retiredAssets,
      pendingRequests,
      pendingTransfers,
      pendingReturns,
      pendingMaintenance,
      pendingBookings,
      upcomingBookings,
      unreadNotifications,
    ] = await Promise.all([
      Asset.count({ where: whereAsset }),
      Asset.count({ where: { ...whereAsset, status: 'Allocated' } }),
      Asset.count({ where: { ...whereAsset, status: 'Available' } }),
      Asset.count({ where: { ...whereAsset, status: 'Under Maintenance' } }),
      Asset.count({ where: { ...whereAsset, status: 'Lost' } }),
      Asset.count({ where: { ...whereAsset, status: 'Retired' } }),
      Request.count({ where: { ...whereRequest, status: 'Pending' } }),
      Request.count({ where: { ...whereRequest, type: 'Transfer', status: 'Pending' } }),
      Request.count({ where: { ...whereRequest, type: 'Return', status: 'Pending' } }),
      Request.count({ where: { ...whereRequest, type: 'Maintenance', status: 'Pending' } }),
      Request.count({ where: { ...whereRequest, type: 'Booking', status: 'Pending' } }),
      Booking.count({ where: { user_id: userId, status: 'Upcoming' } }),
      Notification.count({ where: { user_id: userId, is_read: false } }),
    ]);

    // Asset category breakdown
    const categories = await Asset.findAll({
      where: whereAsset,
      attributes: ['category', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      group: ['category'],
      raw: true,
    });

    return successResponse(res, 200, {
      stats: {
        totalAssets,
        allocatedAssets,
        availableAssets,
        underMaintenance,
        lostAssets,
        retiredAssets,
        pendingRequests,
        pendingTransfers,
        pendingReturns,
        pendingMaintenance,
        pendingBookings,
        upcomingBookings,
        unreadNotifications,
      },
      categoryBreakdown: categories,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * GET /api/dashboard/activity
 * Recent requests and bookings combined as activity feed.
 */
const getActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    const deptId = user?.department_id;
    const whereRequest = deptId ? { department_id: deptId } : {};

    const [recentRequests, recentBookings] = await Promise.all([
      Request.findAll({
        where: whereRequest,
        include: [
          { model: User, as: 'employee', attributes: ['id', 'full_name', 'role'] },
          { model: Asset, as: 'asset', attributes: ['id', 'tag', 'name'] },
        ],
        order: [['created_at', 'DESC']],
        limit: 5,
      }),
      Booking.findAll({
        where: { user_id: userId },
        include: [{ model: require('../models/Resource'), as: 'resource', attributes: ['id', 'name', 'type'] }],
        order: [['created_at', 'DESC']],
        limit: 5,
      }),
    ]);

    return successResponse(res, 200, { recentRequests, recentBookings });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = { getStats, getActivity };
=======
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
>>>>>>> origin/jay
