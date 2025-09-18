const express = require('express');
const { 
  getCart, 
  addToCart, 
  removeFromCart, 
  updateCartItem, 
  clearCart 
} = require('../controllers/cartController');
const { auth } = require('../middleware/auth');
const { cartValidation, validate } = require('../utils/validation');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getCart);
router.post('/add', validate(cartValidation.addItem), addToCart);
router.delete('/remove/:id', removeFromCart);
router.patch('/update/:id', validate(cartValidation.updateItem), updateCartItem);
router.delete('/clear', clearCart);

module.exports = router;
