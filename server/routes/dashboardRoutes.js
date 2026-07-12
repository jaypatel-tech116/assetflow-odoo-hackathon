const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
<<<<<<< HEAD
const { getStats, getActivity } = require('../controllers/dashboardController');

router.use(verifyToken);
router.get('/stats', getStats);
router.get('/activity', getActivity);
=======
const { getDashboardData } = require('../controllers/dashboardController');

// GET /api/dashboard — role-aware dashboard data
router.get('/', verifyToken, getDashboardData);
>>>>>>> origin/jay

module.exports = router;
