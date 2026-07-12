const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { listResources, checkAvailability, listBookings, createBooking, cancelBooking } = require('../controllers/bookingController');

router.use(verifyToken);

// Resources
router.get('/resources', listResources);
router.get('/resources/:id/availability', checkAvailability);

// Bookings
router.get('/bookings', listBookings);
router.post('/bookings', createBooking);
router.delete('/bookings/:id', cancelBooking);

module.exports = router;
