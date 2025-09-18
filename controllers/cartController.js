const { validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image stock isActive');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    // Filter out inactive products
    cart.items = cart.items.filter(item => item.product && item.product.isActive);
    await cart.save();
    
    res.status(200).json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      message: 'Server error while fetching cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId, quantity } = req.body;
    
    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        message: 'Product not found or not available'
      });
    }
    
    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock`
      });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );
    
    if (existingItem) {
      // Check if adding more quantity exceeds stock
      if (existingItem.quantity + quantity > product.stock) {
        return res.status(400).json({
          message: `Cannot add ${quantity} more items. Only ${product.stock - existingItem.quantity} more available`
        });
      }
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price image stock isActive');
    
    res.status(200).json({
      message: 'Item added to cart successfully',
      cart: populatedCart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      message: 'Server error while adding item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:id
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === id
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        message: 'Item not found in cart'
      });
    }
    
    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price image stock isActive');
    
    res.status(200).json({
      message: 'Item removed from cart successfully',
      cart: populatedCart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      message: 'Server error while removing item from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update item quantity in cart
// @route   PATCH /api/cart/update/:id
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }
    
    const item = cart.items.find(item => 
      item.product.toString() === id
    );
    
    if (!item) {
      return res.status(404).json({
        message: 'Item not found in cart'
      });
    }
    
    // Check stock availability
    const product = await Product.findById(id);
    if (!product || !product.isActive) {
      return res.status(404).json({
        message: 'Product not found or not available'
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock`
      });
    }
    
    item.quantity = quantity;
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price image stock isActive');
    
    res.status(200).json({
      message: 'Cart item updated successfully',
      cart: populatedCart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      message: 'Server error while updating cart item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found'
      });
    }
    
    cart.items = [];
    await cart.save();
    
    res.status(200).json({
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      message: 'Server error while clearing cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
};
