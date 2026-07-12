const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getMe, updateMe, changePassword } = require('../controllers/userController');

router.use(verifyToken);
router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/me/password', changePassword);

module.exports = router;
