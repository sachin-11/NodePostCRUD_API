const express = require('express');
const router = express.Router();
const {
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category');

const { protect, authorize } = require('../middleware/auth');

router.route('/').get(getAllCategory).post(protect, authorize('publisher', 'admin'), createCategory);
router.route('/:id').put(protect, authorize('publisher', 'admin'), updateCategory).delete(protect, authorize('publisher', 'admin'),deleteCategory);

module.exports = router;
