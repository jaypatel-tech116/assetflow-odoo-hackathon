const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
=======
const { register, login } = require('../controllers/authController');
>>>>>>> 879dbf2bd635ae5d9b416f4693c99acc2a2408c9

// POST /api/auth/register — Create a new Employee account
router.post('/register', register);

// POST /api/auth/login — Authenticate and receive JWT
router.post('/login', login);

<<<<<<< HEAD
// GET /api/auth/me — Get current user (requires auth)
router.get('/me', verifyToken, getMe);

// POST /api/auth/forgot-password — Request password reset
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password — Reset password with token
router.post('/reset-password', resetPassword);

=======
>>>>>>> 879dbf2bd635ae5d9b416f4693c99acc2a2408c9
module.exports = router;
