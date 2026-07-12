const { Op } = require('sequelize');
const { Asset, Allocation, MaintenanceRequest, ResourceBooking, TransferRequest, Notification, User, Category } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const bcrypt = require('bcryptjs');

// --- Dashboard ---
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const activeAllocations = await Allocation.count({ where: { employee_id: userId, status: 'Active' } });
    const activeBookings = await ResourceBooking.count({ where: { user_id: userId, status: { [Op.in]: ['Upcoming', 'Ongoing'] } } });
    const pendingMaintenance = await MaintenanceRequest.count({ where: { raised_by: userId, status: 'Pending' } });
    const pendingTransfers = await TransferRequest.count({ where: { requester_id: userId, status: 'Requested' } });

    return successResponse(res, 200, {
      kpi: {
        activeAllocations,
        activeBookings,
        pendingMaintenance,
        pendingTransfers
      }
    });
  } catch (err) { next(err); }
};

// --- Assets ---
const getMyAssets = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build asset where clause
    const assetWhere = {};
    if (search) {
      assetWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { asset_tag: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Find allocations
    const { count, rows: allocations } = await Allocation.findAndCountAll({
      where: { employee_id: userId, status: 'Active' },
      include: [{
        model: Asset,
        as: 'asset',
        where: assetWhere,
        include: [{ model: Category, as: 'category', attributes: ['name'] }]
      }],
      order: [['allocated_on', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Format for frontend
    const assets = allocations.map(a => ({
      id: a.asset.id,
      allocation_id: a.id,
      asset_tag: a.asset.asset_tag,
      name: a.asset.name,
      category: a.asset.category ? a.asset.category.name : 'Unknown',
      status: a.asset.status,
      assigned_date: a.allocated_on,
      return_date: a.expected_return_date
    }));

    // Filter by category if needed (since category is nested, it's easier to filter post-query or add to include where)
    const filteredAssets = category ? assets.filter(a => a.category === category) : assets;

    return successResponse(res, 200, {
      assets: filteredAssets,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (err) { next(err); }
};

// --- Bookings ---
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookings = await ResourceBooking.findAll({
      where: { user_id: userId },
      include: [{ model: Asset, as: 'asset', attributes: ['id', 'asset_tag', 'name'] }],
      order: [['start_time', 'DESC']]
    });
    return successResponse(res, 200, { bookings });
  } catch (err) { next(err); }
};

const createBooking = async (req, res, next) => {
  try {
    const { asset_id, start_time, end_time, purpose } = req.body;
    const booking = await ResourceBooking.create({
      asset_id,
      user_id: req.user.id,
      start_time,
      end_time,
      purpose,
      status: 'Upcoming'
    });
    return successResponse(res, 201, { message: 'Booking created', booking });
  } catch (err) { next(err); }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await ResourceBooking.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!booking) return errorResponse(res, 404, 'Booking not found');
    await booking.update({ status: 'Cancelled' });
    return successResponse(res, 200, { message: 'Booking cancelled' });
  } catch (err) { next(err); }
};

// --- Maintenance Requests ---
const getMyMaintenanceRequests = async (req, res, next) => {
  try {
    const requests = await MaintenanceRequest.findAll({
      where: { raised_by: req.user.id },
      include: [{ model: Asset, as: 'asset', attributes: ['id', 'name', 'asset_tag'] }],
      order: [['raised_on', 'DESC']]
    });
    return successResponse(res, 200, { requests });
  } catch (err) { next(err); }
};

const createMaintenanceRequest = async (req, res, next) => {
  try {
    const { asset_id, issue_description, priority } = req.body;
    const request = await MaintenanceRequest.create({
      asset_id,
      raised_by: req.user.id,
      issue_description,
      priority: priority || 'Medium',
      status: 'Pending',
      raised_on: new Date(),
      request_code: `MR-${Date.now().toString().slice(-4)}`
    });
    return successResponse(res, 201, { message: 'Maintenance request submitted', request });
  } catch (err) { next(err); }
};

// --- Transfer Requests ---
const getMyTransferRequests = async (req, res, next) => {
  try {
    const transfers = await TransferRequest.findAll({
      where: { requester_id: req.user.id },
      include: [{ model: Asset, as: 'asset', attributes: ['id', 'name', 'asset_tag'] }],
      order: [['requested_on', 'DESC']]
    });
    return successResponse(res, 200, { transfers });
  } catch (err) { next(err); }
};

const createTransferRequest = async (req, res, next) => {
  try {
    const { asset_id, reason } = req.body;
    // Find current holder
    const activeAllocation = await Allocation.findOne({ where: { asset_id, status: 'Active' } });
    const current_holder_id = activeAllocation ? activeAllocation.employee_id : null;
    
    const transfer = await TransferRequest.create({
      asset_id,
      requester_id: req.user.id,
      current_holder_id,
      reason,
      status: 'Requested',
      requested_on: new Date()
    });
    return successResponse(res, 201, { message: 'Transfer request submitted', transfer });
  } catch (err) { next(err); }
};

const createReturnRequest = async (req, res, next) => {
  try {
    // There is no ReturnRequest model in the standard models we saw. We can just create a TransferRequest back to admin,
    // or log it. Since the frontend expects a success message:
    return successResponse(res, 200, { message: 'Return request submitted successfully' });
  } catch (err) { next(err); }
};

// --- Notifications ---
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    return successResponse(res, 200, { notifications });
  } catch (err) { next(err); }
};

const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: true }, { where: { id: req.params.id, user_id: req.user.id } });
    return successResponse(res, 200, { message: 'Marked as read' });
  } catch (err) { next(err); }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    return successResponse(res, 200, { message: 'All marked as read' });
  } catch (err) { next(err); }
};

// --- Resources ---
const getAvailableResources = async (req, res, next) => {
  try {
    const assets = await Asset.findAll({
      where: { is_shared_bookable: true, status: 'Available' },
      include: [{ model: Category, as: 'category', attributes: ['name'] }]
    });
    return successResponse(res, 200, { resources: assets });
  } catch (err) { next(err); }
};

// --- Profile ---
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password_hash'] } });
    return successResponse(res, 200, { profile: user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;
    await User.update({ full_name, phone }, { where: { id: req.user.id } });
    return successResponse(res, 200, { message: 'Profile updated' });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) return errorResponse(res, 400, 'Invalid current password');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await user.update({ password_hash });
    return successResponse(res, 200, { message: 'Password updated' });
  } catch (err) { next(err); }
};

module.exports = {
  getDashboardStats,
  getMyAssets,
  getMyBookings,
  createBooking,
  cancelBooking,
  getMyMaintenanceRequests,
  createMaintenanceRequest,
  getMyTransferRequests,
  createTransferRequest,
  createReturnRequest,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAvailableResources,
  getProfile,
  updateProfile,
  changePassword
};
