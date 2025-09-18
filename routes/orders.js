const express = require('express');
const { body } = require('express-validator');
const { 
  getOrders, 
  getOrder, 
  checkout, 
  updateOrderStatus 
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const checkoutValidation = [
  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .notEmpty()
    .withMessage('ZIP code is required'),
  body('shippingAddress.country')
    .notEmpty()
    .withMessage('Country is required'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  body('paymentData.amount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Payment amount must be a positive number'),
  body('paymentData.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/checkout', checkoutValidation, checkout);
router.patch('/:id/status', adminAuth, updateStatusValidation, updateOrderStatus);

module.exports = router;
