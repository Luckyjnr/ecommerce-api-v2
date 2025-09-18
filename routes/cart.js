const express = require('express');
const { body } = require('express-validator');
const { 
  getCart, 
  addToCart, 
  removeFromCart, 
  updateCartItem, 
  clearCart 
} = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100')
];

const updateCartItemValidation = [
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100')
];

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getCart);
router.post('/add', addToCartValidation, addToCart);
router.delete('/remove/:id', removeFromCart);
router.patch('/update/:id', updateCartItemValidation, updateCartItem);
router.delete('/clear', clearCart);

module.exports = router;
