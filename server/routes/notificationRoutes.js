const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
<<<<<<< HEAD
const { listNotifications, markRead, markAllRead } = require('../controllers/notificationController');

router.use(verifyToken);
router.get('/', listNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
=======
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

router.use(verifyToken);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
>>>>>>> origin/jay

module.exports = router;
