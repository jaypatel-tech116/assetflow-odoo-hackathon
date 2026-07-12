const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { verifyToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createAuditCycle,
  getAllAuditCycles,
  getAuditCycleById,
  updateAuditCycle,
  verifyAsset,
  closeAuditCycle,
  getDiscrepancyReport,
} = require('../controllers/auditController');

router.use(verifyToken);

router.get('/', getAllAuditCycles);
router.get('/:id', getAuditCycleById);
router.get('/:id/discrepancies', getDiscrepancyReport);
router.post('/', roleMiddleware('Admin', 'Asset Manager'), createAuditCycle);
router.put('/:id', roleMiddleware('Admin', 'Asset Manager'), updateAuditCycle);
router.post('/:id/verify', verifyAsset);
router.patch('/:id/close', roleMiddleware('Admin', 'Asset Manager'), closeAuditCycle);
=======
const auditController = require('../controllers/auditController');

router.get('/cycles', auditController.getCycles);
router.post('/cycles', auditController.createCycle);
router.get('/discrepancies', auditController.getDiscrepancies);
>>>>>>> origin/kashyap

module.exports = router;
