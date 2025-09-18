const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { simulatePayment, validatePaymentData } = require('../utils/payment');

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { user: req.user._id };
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      message: 'Server error while fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('items.product', 'name image');
    
    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }
    
    res.status(200).json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      message: 'Server error while fetching order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Create order from cart
// @route   POST /api/orders/checkout
// @access  Private
const checkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { shippingAddress, paymentMethod, paymentData } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: 'Cart is empty'
      });
    }
    
    // Validate payment data
    const paymentValidation = validatePaymentData({
      ...paymentData,
      paymentMethod
    });
    if (!paymentValidation.isValid) {
      return res.status(400).json({
        message: 'Invalid payment data',
        errors: paymentValidation.errors
      });
    }
    
    // Check stock availability and prepare order items
    const orderItems = [];
    let totalAmount = 0;
    
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      if (!product.isActive) {
        return res.status(400).json({
          message: `Product ${product.name} is no longer available`
        });
      }
      
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`
        });
      }
      
      const itemTotal = product.price * cartItem.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity
      });
    }
    
    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    // Simulate payment processing
    try {
      const paymentResult = await simulatePayment({
        ...paymentData,
        paymentMethod,
        amount: totalAmount,
        orderId: order._id
      });
      
      // Update order with payment success
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      await order.save();
      
      // Update product stock
      for (const cartItem of cart.items) {
        await Product.findByIdAndUpdate(
          cartItem.product._id,
          { $inc: { stock: -cartItem.quantity } }
        );
      }
      
      // Clear cart
      cart.items = [];
      await cart.save();
      
      const populatedOrder = await Order.findById(order._id)
        .populate('items.product', 'name image');
      
      res.status(201).json({
        message: 'Order placed successfully',
        order: populatedOrder,
        payment: paymentResult
      });
      
    } catch (paymentError) {
      // Payment failed
      order.paymentStatus = 'failed';
      await order.save();
      
      res.status(400).json({
        message: 'Payment failed',
        error: paymentError.message,
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      });
    }
    
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      message: 'Server error during checkout',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }
    
    order.status = status;
    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name image')
      .populate('user', 'name email');
    
    res.status(200).json({
      message: 'Order status updated successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      message: 'Server error while updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getOrders,
  getOrder,
  checkout,
  updateOrderStatus
};
