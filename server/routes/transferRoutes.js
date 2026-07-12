const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createTransferRequest,
  getAllTransferRequests,
  approveTransfer,
  rejectTransfer,
} = require('../controllers/transferController');

router.use(verifyToken);

router.get('/', getAllTransferRequests);
router.post('/', createTransferRequest);
router.patch('/:id/approve', roleMiddleware('Admin', 'Asset Manager', 'Department Head'), approveTransfer);
router.patch('/:id/reject', roleMiddleware('Admin', 'Asset Manager', 'Department Head'), rejectTransfer);

module.exports = router;
