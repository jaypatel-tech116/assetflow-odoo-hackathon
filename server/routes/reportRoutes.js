const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getAssetUtilization,
  getMaintenanceFrequency,
  getDepartmentAllocation,
  getBookingHeatmap,
  getOverviewStats,
} = require('../controllers/reportController');

router.use(verifyToken);

router.get('/overview', getOverviewStats);
router.get('/asset-utilization', getAssetUtilization);
router.get('/maintenance-frequency', getMaintenanceFrequency);
router.get('/department-allocation', getDepartmentAllocation);
router.get('/booking-heatmap', getBookingHeatmap);

module.exports = router;
