const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication.' });
  }
};

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Server error in admin authentication.' });
  }
};

// Supplier user middleware
const supplierAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Supplier privileges required.' });
      }
      next();
    });
  } catch (error) {
    console.error('Supplier auth middleware error:', error);
    res.status(500).json({ message: 'Server error in supplier authentication.' });
  }
};

// Business user middleware (keeping for backward compatibility or other uses if needed)
const businessAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      // Assuming 'business' role maps to 'supplier' for this context.
      // This middleware might be deprecated or adjusted based on specific needs later.
      if (req.user.role !== 'supplier' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Business privileges required.' });
      }
      next();
    });
  } catch (error) {
    console.error('Business auth middleware error:', error);
    res.status(500).json({ message: 'Server error in business authentication.' });
  }
};

module.exports = { auth, adminAuth, supplierAuth, businessAuth };
