const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { listRequests, createRequest, approveRequest, rejectRequest } = require('../controllers/requestController');

router.use(verifyToken);
router.get('/', listRequests);
router.post('/', createRequest);
router.put('/:id/approve', approveRequest);
router.put('/:id/reject', rejectRequest);

module.exports = router;
