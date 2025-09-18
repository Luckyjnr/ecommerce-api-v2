const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get all orders (Admin only)
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentStatus, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build query object
    let query = {};
    if (status) {
      query.status = status;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name image')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);
    
    // Calculate statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.status(200).json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      statistics: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      message: 'Server error while fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PATCH /api/admin/orders/:id/status
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
    const { id } = req.params;
    
    // Validate order ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid order ID format'
      });
    }
    
    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product', 'name image');
    
    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }
    
    // Check if status transition is valid
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [], // Final state
      'cancelled': [] // Final state
    };
    
    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${order.status} to ${status}`,
        validTransitions: validTransitions[order.status]
      });
    }
    
    // Update order status
    order.status = status;
    await order.save();
    
    res.status(200).json({
      message: 'Order status updated successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        previousStatus: order.status,
        user: order.user,
        totalAmount: order.totalAmount,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      message: 'Server error while updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get order statistics (Admin only)
// @route   GET /api/admin/orders/stats
// @access  Private (Admin)
const getOrderStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          statusBreakdown: {
            $push: '$status'
          },
          paymentStatusBreakdown: {
            $push: '$paymentStatus'
          }
        }
      },
      {
        $project: {
          totalOrders: 1,
          totalRevenue: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
          statusBreakdown: {
            pending: { $size: { $filter: { input: '$statusBreakdown', cond: { $eq: ['$$this', 'pending'] } } } },
            confirmed: { $size: { $filter: { input: '$statusBreakdown', cond: { $eq: ['$$this', 'confirmed'] } } } },
            shipped: { $size: { $filter: { input: '$statusBreakdown', cond: { $eq: ['$$this', 'shipped'] } } } },
            delivered: { $size: { $filter: { input: '$statusBreakdown', cond: { $eq: ['$$this', 'delivered'] } } } },
            cancelled: { $size: { $filter: { input: '$statusBreakdown', cond: { $eq: ['$$this', 'cancelled'] } } } }
          },
          paymentStatusBreakdown: {
            pending: { $size: { $filter: { input: '$paymentStatusBreakdown', cond: { $eq: ['$$this', 'pending'] } } } },
            paid: { $size: { $filter: { input: '$paymentStatusBreakdown', cond: { $eq: ['$$this', 'paid'] } } } },
            failed: { $size: { $filter: { input: '$paymentStatusBreakdown', cond: { $eq: ['$$this', 'failed'] } } } },
            refunded: { $size: { $filter: { input: '$paymentStatusBreakdown', cond: { $eq: ['$$this', 'refunded'] } } } }
          }
        }
      }
    ]);
    
    res.status(200).json({
      period: `${days} days`,
      startDate,
      endDate: new Date(),
      statistics: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        statusBreakdown: {
          pending: 0,
          confirmed: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        },
        paymentStatusBreakdown: {
          pending: 0,
          paid: 0,
          failed: 0,
          refunded: 0
        }
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching order statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  getOrderStats
};
