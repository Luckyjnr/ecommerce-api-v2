const { adminAuth } = require('./auth');

// Middleware to check if user has admin role
const roleCheck = (req, res, next) => {
  // First check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required' 
    });
  }

  // Then check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      requiredRole: 'admin',
      userRole: req.user.role
    });
  }

  next();
};

module.exports = { roleCheck };
