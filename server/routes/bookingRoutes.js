const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
  getResourceBookings,
} = require('../controllers/bookingController');

router.use(verifyToken);

router.get('/', getAllBookings);
router.get('/resource/:assetId', getResourceBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
