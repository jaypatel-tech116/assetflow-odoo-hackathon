const { Notification } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Notification.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit), offset,
    });
    return successResponse(res, 200, {
      notifications: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.count({ where: { user_id: req.user.id, is_read: false } });
    return successResponse(res, 200, { unreadCount: count });
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!notification) return errorResponse(res, 404, 'Notification not found');
    await notification.update({ is_read: true });
    return successResponse(res, 200, { message: 'Notification marked as read' });
  } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    return successResponse(res, 200, { message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
