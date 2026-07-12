const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getMyAssets,
  getMyBookings,
  createBooking,
  cancelBooking,
  getMyMaintenanceRequests,
  createMaintenanceRequest,
  getMyTransferRequests,
  createTransferRequest,
  createReturnRequest,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAvailableResources,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/employeeController');

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

// Maintenance
router.get('/maintenance', getMyMaintenanceRequests);
router.post('/maintenance', createMaintenanceRequest);

// Transfers & Returns
router.get('/transfers', getMyTransferRequests);
router.post('/transfers', createTransferRequest);
router.post('/returns', createReturnRequest);

// Notifications
router.get('/notifications', getMyNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

// Resources
router.get('/resources', getAvailableResources);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/password', changePassword);

module.exports = router;
