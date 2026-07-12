const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  allocateAsset,
  returnAsset,
  getAllAllocations,
  getOverdueAllocations,
} = require('../controllers/allocationController');

router.use(verifyToken);

router.get('/', getAllAllocations);
router.get('/overdue', getOverdueAllocations);
router.post('/', roleMiddleware('Admin', 'Asset Manager', 'Department Head'), allocateAsset);
router.patch('/:id/return', returnAsset);

module.exports = router;
