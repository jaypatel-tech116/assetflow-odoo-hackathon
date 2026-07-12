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
