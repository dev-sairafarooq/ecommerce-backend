const express = require('express');
const router = express.Router();
const {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

// Saari cart routes protected hain - koi bhi bina login ke access nahi kar sakta
router.use(authMiddleware);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;