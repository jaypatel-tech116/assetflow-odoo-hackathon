const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
} = require('../controllers/departmentController');

// All department routes require auth
router.use(verifyToken);

// GET /api/departments
router.get('/', getAllDepartments);

// GET /api/departments/:id
router.get('/:id', getDepartmentById);

// POST /api/departments (Admin only)
router.post('/', roleMiddleware('Admin'), createDepartment);

// PUT /api/departments/:id (Admin only)
router.put('/:id', roleMiddleware('Admin'), updateDepartment);

module.exports = router;
