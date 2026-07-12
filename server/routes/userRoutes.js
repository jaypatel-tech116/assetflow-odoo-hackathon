const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
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

module.exports = router;
