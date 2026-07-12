const { Notification } = require('../config/associations');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * GET /api/notifications
 */
const listNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Notification.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
    });

    const unreadCount = await Notification.count({ where: { user_id: req.user.id, is_read: false } });

    return successResponse(res, 200, {
      notifications: rows,
      unreadCount,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * PUT /api/notifications/:id/read
 */
const markRead = async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return errorResponse(res, 404, 'Notification not found');
    if (notif.user_id !== req.user.id) return errorResponse(res, 403, 'Not authorized');
    await notif.update({ is_read: true });
    return successResponse(res, 200, { message: 'Marked as read' });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

/**
 * PUT /api/notifications/read-all
 */
const markAllRead = async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    return successResponse(res, 200, { message: 'All notifications marked as read' });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

module.exports = { listNotifications, markRead, markAllRead };
