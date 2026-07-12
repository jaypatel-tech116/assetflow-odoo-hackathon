const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
<<<<<<< HEAD
const { getMe, updateMe, changePassword } = require('../controllers/userController');

router.use(verifyToken);
router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/me/password', changePassword);
=======
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  updateUserDepartment,
} = require('../controllers/userController');

router.use(verifyToken);

router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Role promotion — Admin only
router.patch('/:id/role', roleMiddleware('Admin'), updateUserRole);

// Status toggle — Admin only
router.patch('/:id/status', roleMiddleware('Admin'), updateUserStatus);

// Department assignment — Admin only
router.patch('/:id/department', roleMiddleware('Admin'), updateUserDepartment);
>>>>>>> origin/jay

module.exports = router;
