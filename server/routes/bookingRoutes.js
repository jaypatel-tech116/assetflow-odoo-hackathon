const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
<<<<<<< HEAD
const { listResources, checkAvailability, listBookings, createBooking, cancelBooking } = require('../controllers/bookingController');

router.use(verifyToken);

// Resources
router.get('/resources', listResources);
router.get('/resources/:id/availability', checkAvailability);

// Bookings
router.get('/bookings', listBookings);
router.post('/bookings', createBooking);
router.delete('/bookings/:id', cancelBooking);
=======
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
>>>>>>> origin/jay

module.exports = router;
