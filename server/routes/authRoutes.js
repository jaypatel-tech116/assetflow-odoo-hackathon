const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, switchSelfRole } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/register — Create a new Employee account
router.post('/register', register);

// POST /api/auth/login — Authenticate and receive JWT
router.post('/login', login);

// GET /api/auth/me — Get current user (requires auth)
router.get('/me', verifyToken, getMe);

// POST /api/auth/forgot-password — Request password reset
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password — Reset password with token
router.post('/reset-password', resetPassword);

// PATCH /api/auth/self-role — Switch own role for testing
router.patch('/self-role', verifyToken, switchSelfRole);

module.exports = router;
