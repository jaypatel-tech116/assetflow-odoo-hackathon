const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organizationController');

// Departments
router.get('/departments', orgController.getDepartments);
router.post('/departments', orgController.createDepartment);
router.put('/departments/:id', orgController.updateDepartment);
router.delete('/departments/:id', orgController.deleteDepartment);

// Asset Categories
router.get('/categories', orgController.getCategories);
router.post('/categories', orgController.createCategory);
router.put('/categories/:id', orgController.updateCategory);
router.delete('/categories/:id', orgController.deleteCategory);

// Employees
router.get('/employees', orgController.getEmployees);
router.put('/employees/:id/role', orgController.updateEmployeeRole);
router.put('/employees/:id/status', orgController.updateEmployeeStatus);

module.exports = router;
