const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// Controllers
const { getDashboardStats } = require('../controllers/employeeDashboardController');
const { getMyAssets } = require('../controllers/assetController');
const { getMyBookings, createBooking, cancelBooking } = require('../controllers/bookingController');
const { getMyMaintenanceRequests, createMaintenanceRequest } = require('../controllers/maintenanceController');
const { getMyTransferRequests, createTransferRequest, createReturnRequest } = require('../controllers/transferController');
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { getAvailableResources } = require('../controllers/resourceController');
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');

// All employee routes require authentication
router.use(verifyToken);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Assets
router.get('/assets', getMyAssets);

// Bookings
router.get('/bookings', getMyBookings);
router.post('/bookings', createBooking);
router.delete('/bookings/:id', cancelBooking);

// Maintenance Requests
router.get('/maintenance', getMyMaintenanceRequests);
router.post('/maintenance', createMaintenanceRequest);

// Transfer / Return Requests
router.get('/transfers', getMyTransferRequests);
router.post('/transfers', createTransferRequest);
router.post('/returns', createReturnRequest);

// Notifications
router.get('/notifications', getMyNotifications);
router.patch('/notifications/read-all', markAllAsRead);
router.patch('/notifications/:id/read', markAsRead);

// Resources
router.get('/resources', getAvailableResources);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

module.exports = router;
