const express = require('express');
const { 
  getOrders, 
  getOrder, 
  checkout, 
  updateOrderStatus 
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');
const { orderValidation, validate } = require('../utils/validation');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/checkout', validate(orderValidation.checkout), checkout);
router.patch('/:id/status', adminAuth, validate(orderValidation.updateStatus), updateOrderStatus);

module.exports = router;
