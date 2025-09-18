const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [100, 'Quantity cannot exceed 100']
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
cartSchema.pre('save', async function(next) {
  if (this.items && this.items.length > 0) {
    let total = 0;
    for (const item of this.items) {
      const product = await mongoose.model('Product').findById(item.product);
      if (product) {
        total += product.price * item.quantity;
      }
    }
    this.totalAmount = total;
  } else {
    this.totalAmount = 0;
  }
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
