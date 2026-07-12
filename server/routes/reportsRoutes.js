const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

router.get('/analytics', reportsController.getAnalytics);

module.exports = router;
