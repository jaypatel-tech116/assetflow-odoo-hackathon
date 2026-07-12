const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

router.get('/cycles', auditController.getCycles);
router.post('/cycles', auditController.createCycle);
router.get('/discrepancies', auditController.getDiscrepancies);

module.exports = router;
