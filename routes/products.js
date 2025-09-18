const express = require('express');
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { auth, customerOrAdminAuth } = require('../middleware/auth');
const { productValidation, validate } = require('../utils/validation');

const router = express.Router();

// Routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', auth, customerOrAdminAuth, validate(productValidation.create), createProduct);
router.patch('/:id', auth, customerOrAdminAuth, validate(productValidation.update), updateProduct);
router.delete('/:id', auth, customerOrAdminAuth, deleteProduct);

module.exports = router;
