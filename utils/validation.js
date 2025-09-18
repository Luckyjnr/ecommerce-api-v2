const Joi = require('joi');

// Product validation schemas
const productValidation = {
  create: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Product name is required',
        'string.min': 'Product name must be at least 2 characters long',
        'string.max': 'Product name cannot exceed 100 characters'
      }),
    
    description: Joi.string()
      .trim()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.empty': 'Product description is required',
        'string.min': 'Product description must be at least 10 characters long',
        'string.max': 'Product description cannot exceed 1000 characters'
      }),
    
    price: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.positive': 'Price must be a positive number',
        'number.base': 'Price must be a valid number'
      }),
    
    category: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Product category is required',
        'string.min': 'Category must be at least 2 characters long',
        'string.max': 'Category cannot exceed 50 characters'
      }),
    
    stock: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.integer': 'Stock must be a whole number',
        'number.min': 'Stock cannot be negative'
      }),
    
    image: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Image must be a valid URL'
      })
  }),

  update: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Product name must be at least 2 characters long',
        'string.max': 'Product name cannot exceed 100 characters'
      }),
    
    description: Joi.string()
      .trim()
      .min(10)
      .max(1000)
      .optional()
      .messages({
        'string.min': 'Product description must be at least 10 characters long',
        'string.max': 'Product description cannot exceed 1000 characters'
      }),
    
    price: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .messages({
        'number.positive': 'Price must be a positive number',
        'number.base': 'Price must be a valid number'
      }),
    
    category: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Category must be at least 2 characters long',
        'string.max': 'Category cannot exceed 50 characters'
      }),
    
    stock: Joi.number()
      .integer()
      .min(0)
      .optional()
      .messages({
        'number.integer': 'Stock must be a whole number',
        'number.min': 'Stock cannot be negative'
      }),
    
    image: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Image must be a valid URL'
      })
  })
};

// Cart validation schemas
const cartValidation = {
  addItem: Joi.object({
    productId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId',
        'string.empty': 'Product ID is required'
      }),
    
    quantity: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .required()
      .messages({
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 100'
      })
  }),

  updateItem: Joi.object({
    quantity: Joi.number()
      .integer()
      .min(0)
      .max(100)
      .required()
      .messages({
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity cannot be negative',
        'number.max': 'Quantity cannot exceed 100'
      })
  })
};

// User validation schemas
const userValidation = {
  register: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    
    email: Joi.string()
      .email()
      .lowercase()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
      }),
    
    password: Joi.string()
      .min(6)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      }),
    
    role: Joi.string()
      .valid('customer', 'admin')
      .default('customer')
      .messages({
        'any.only': 'Role must be either customer or admin'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required'
      })
  })
};

// Order validation schemas
const orderValidation = {
  updateStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
      .required()
      .messages({
        'any.only': 'Status must be one of: pending, confirmed, shipped, delivered, cancelled'
      })
  }),

  checkout: Joi.object({
    shippingAddress: Joi.object({
      street: Joi.string()
        .trim()
        .min(5)
        .max(200)
        .required()
        .messages({
          'string.empty': 'Street address is required',
          'string.min': 'Street address must be at least 5 characters long',
          'string.max': 'Street address cannot exceed 200 characters'
        }),
      
      city: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.empty': 'City is required',
          'string.min': 'City must be at least 2 characters long',
          'string.max': 'City cannot exceed 50 characters'
        }),
      
      state: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.empty': 'State is required',
          'string.min': 'State must be at least 2 characters long',
          'string.max': 'State cannot exceed 50 characters'
        }),
      
      zipCode: Joi.string()
        .trim()
        .pattern(/^\d{5}(-\d{4})?$/)
        .required()
        .messages({
          'string.empty': 'ZIP code is required',
          'string.pattern.base': 'ZIP code must be in format 12345 or 12345-6789'
        }),
      
      country: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.empty': 'Country is required',
          'string.min': 'Country must be at least 2 characters long',
          'string.max': 'Country cannot exceed 50 characters'
        })
    }).required(),
    
    paymentMethod: Joi.string()
      .valid('credit_card', 'debit_card', 'paypal', 'bank_transfer')
      .required()
      .messages({
        'any.only': 'Payment method must be one of: credit_card, debit_card, paypal, bank_transfer'
      }),
    
    paymentData: Joi.object({
      amount: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
          'number.positive': 'Amount must be positive',
          'number.base': 'Amount must be a valid number'
        }),
      
      currency: Joi.string()
        .valid('USD', 'EUR', 'GBP', 'CAD')
        .default('USD')
        .messages({
          'any.only': 'Currency must be one of: USD, EUR, GBP, CAD'
        }),
      
      cardNumber: Joi.string()
        .pattern(/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/)
        .required()
        .messages({
          'string.pattern.base': 'Card number must be 16 digits (spaces or dashes allowed)'
        }),
      
      expiryDate: Joi.string()
        .pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
        .required()
        .messages({
          'string.pattern.base': 'Expiry date must be in format MM/YY'
        }),
      
      cvv: Joi.string()
        .pattern(/^\d{3,4}$/)
        .required()
        .messages({
          'string.pattern.base': 'CVV must be 3 or 4 digits'
        })
    }).required()
  })
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    // Replace the original data with sanitized data
    req[property] = value;
    next();
  };
};

module.exports = {
  productValidation,
  cartValidation,
  userValidation,
  orderValidation,
  validate
};
