const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', authMiddleware, roleMiddleware('Admin'), createProduct);
router.put('/:id', authMiddleware, roleMiddleware('Admin'), updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('Admin'), deleteProduct);

module.exports = router;