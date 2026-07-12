const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { listNotifications, markRead, markAllRead } = require('../controllers/notificationController');

router.use(verifyToken);
router.get('/', listNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);

module.exports = router;
