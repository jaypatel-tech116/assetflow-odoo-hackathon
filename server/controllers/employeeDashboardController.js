const { Op } = require('sequelize');
const Asset = require('../models/Asset');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const TransferRequest = require('../models/TransferRequest');
const Notification = require('../models/Notification');
const Resource = require('../models/Resource');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get employee dashboard stats and recent data
 * @route   GET /api/employee/dashboard
 * @access  Private (Employee)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // --- Counts ---
    const myAssetsCount = await Asset.count({
      where: { assigned_to: userId, status: 'Allocated' },
    });

    const upcomingReturnsCount = await Asset.count({
      where: {
        assigned_to: userId,
        status: 'Allocated',
        return_date: {
          [Op.not]: null,
          [Op.gte]: today,
          [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      },
    });

    const activeBookingsCount = await Booking.count({
      where: { user_id: userId, status: 'Upcoming' },
    });

    const maintenanceRequestsCount = await MaintenanceRequest.count({
      where: { user_id: userId, status: { [Op.in]: ['Pending', 'Approved', 'In Progress'] } },
    });

    const pendingTransfersCount = await TransferRequest.count({
      where: { user_id: userId, status: 'Pending' },
    });

    // --- Recent data ---
    const recentAssets = await Asset.findAll({
      where: { assigned_to: userId, status: 'Allocated' },
      limit: 3,
      order: [['assigned_date', 'DESC']],
    });

    const recentBookings = await Booking.findAll({
      where: { user_id: userId, status: 'Upcoming' },
      include: [{ model: Resource, as: 'resource', attributes: ['name', 'type'] }],
      limit: 3,
      order: [['booking_date', 'ASC']],
    });

    const recentMaintenance = await MaintenanceRequest.findAll({
      where: { user_id: userId },
      include: [{ model: Asset, as: 'asset', attributes: ['name', 'asset_tag'] }],
      limit: 2,
      order: [['created_at', 'DESC']],
    });

    const recentNotifications = await Notification.findAll({
      where: { user_id: userId },
      limit: 3,
      order: [['created_at', 'DESC']],
    });

    return successResponse(res, 200, {
      stats: {
        myAssets: myAssetsCount,
        upcomingReturns: upcomingReturnsCount,
        activeBookings: activeBookingsCount,
        maintenanceRequests: maintenanceRequestsCount,
        pendingTransfers: pendingTransfersCount,
      },
      recentAssets,
      recentBookings,
      recentMaintenance,
      recentNotifications,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };
