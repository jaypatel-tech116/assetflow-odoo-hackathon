const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * @desc    Get all notifications for the logged-in employee
 * @route   GET /api/employee/notifications
 * @access  Private (Employee)
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Notification.findAndCountAll({
      where: { user_id: userId },
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    const unreadCount = await Notification.count({
      where: { user_id: userId, is_read: false },
    });

    return successResponse(res, 200, {
      notifications: rows,
      unreadCount,
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
 * @desc    Mark a notification as read
 * @route   PATCH /api/employee/notifications/:id/read
 * @access  Private (Employee)
 */
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

    notification.is_read = true;
    await notification.save();

    return successResponse(res, 200, { message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/employee/notifications/read-all
 * @access  Private (Employee)
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } },
    );

    return successResponse(res, 200, { message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
