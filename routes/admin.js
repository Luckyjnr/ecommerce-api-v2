const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { getAllOrders, updateOrderStatus, getOrderStats } = require('../controllers/adminController');

const router = express.Router();

// Apply authentication and admin role check to all admin routes
router.use(auth);
router.use(roleCheck);

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering and pagination
// @access  Private (Admin)
router.get('/orders', getAllOrders);

// @route   GET /api/admin/orders/stats
// @desc    Get order statistics
// @access  Private (Admin)
router.get('/orders/stats', getOrderStats);

// @route   PATCH /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private (Admin)
router.patch('/orders/:id/status', [
  body('status')
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, confirmed, shipped, delivered, cancelled')
], updateOrderStatus);

module.exports = router;
