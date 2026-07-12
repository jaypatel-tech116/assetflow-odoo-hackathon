const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

router.get('/logs', activityController.getLogs);
router.get('/notifications', activityController.getNotifications);
router.put('/notifications/read-all', activityController.markNotificationsRead);

module.exports = router;
