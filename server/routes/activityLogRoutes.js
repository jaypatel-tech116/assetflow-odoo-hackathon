const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getActivityLogs,
  getActivityLogModules,
} = require('../controllers/activityLogController');

router.use(verifyToken);

router.get('/', getActivityLogs);
router.get('/modules', getActivityLogModules);

module.exports = router;
