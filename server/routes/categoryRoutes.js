const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} = require('../controllers/categoryController');

router.use(verifyToken);

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', roleMiddleware('Admin'), createCategory);
router.put('/:id', roleMiddleware('Admin'), updateCategory);

module.exports = router;
