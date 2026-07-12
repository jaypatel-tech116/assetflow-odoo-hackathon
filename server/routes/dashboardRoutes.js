const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getDashboardData } = require('../controllers/dashboardController');

// GET /api/dashboard — role-aware dashboard data
router.get('/', verifyToken, getDashboardData);

module.exports = router;
