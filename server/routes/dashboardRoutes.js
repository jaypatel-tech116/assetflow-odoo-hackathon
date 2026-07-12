const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getStats, getActivity } = require('../controllers/dashboardController');

router.use(verifyToken);
router.get('/stats', getStats);
router.get('/activity', getActivity);

module.exports = router;
