const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Waste = require('../models/Waste');
const Order = require('../models/Order');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSuppliers = await User.countDocuments({ role: 'supplier' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const pendingVerifications = await User.countDocuments({ 'verification.verificationStatus': 'pending' });
    const totalWasteListings = await Waste.countDocuments();
    const activeWasteListings = await Waste.countDocuments({ status: 'active' });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });

    // Calculate total revenue
    const orders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice.amount, 0);

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role createdAt');

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyer seller', 'firstName lastName')
      .select('orderNumber status totalPrice createdAt');

    res.json({
      statistics: {
        totalUsers,
        totalSuppliers,
        totalBuyers,
        pendingVerifications,
        totalWasteListings,
        activeWasteListings,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue
      },
      recentActivity: {
        recentUsers,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// Get all users (admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, verificationStatus, status, search } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (verificationStatus) filter['verification.verificationStatus'] = verificationStatus;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Update user status (admin)
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Admin update user status error:', error);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
});

// Get all waste listings (admin)
router.get('/waste', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const wasteItems = await Waste.find(filter)
      .populate('seller', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Waste.countDocuments(filter);

    res.json({
      wasteItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Admin get waste listings error:', error);
    res.status(500).json({ message: 'Server error while fetching waste listings' });
  }
});

// Update waste listing status (admin)
router.put('/waste/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const wasteItem = await Waste.findById(req.params.id);
    if (!wasteItem) {
      return res.status(404).json({ message: 'Waste item not found' });
    }

    wasteItem.status = status;
    await wasteItem.save();

    res.json({
      message: 'Waste listing status updated successfully',
      wasteItem
    });
  } catch (error) {
    console.error('Admin update waste status error:', error);
    res.status(500).json({ message: 'Server error while updating waste listing status' });
  }
});

// Delete all waste listings (admin) - DANGEROUS OPERATION
router.delete('/waste/all', adminAuth, async (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (confirm !== 'DELETE_ALL') {
      return res.status(400).json({ 
        message: 'Confirmation required. Send { confirm: "DELETE_ALL" } to delete all waste listings.' 
      });
    }

    const count = await Waste.countDocuments();
    
    // Delete all waste listings
    const result = await Waste.deleteMany({});
    
    res.json({
      message: `Successfully deleted ${result.deletedCount} waste listing(s)`,
      deletedCount: result.deletedCount,
      previousCount: count
    });
  } catch (error) {
    console.error('Admin delete all waste listings error:', error);
    res.status(500).json({ message: 'Server error while deleting waste listings' });
  }
});

// Get all orders (admin)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderNumber: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('buyer seller', 'firstName lastName email')
      .populate('wasteItem', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// Get platform analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // User registrations over time
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Waste listings over time
    const wasteListings = await Waste.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Orders over time
    const orders = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice.amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top categories
    const topCategories = await Waste.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price.perUnit' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      period,
      userRegistrations,
      wasteListings,
      orders,
      topCategories
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

// Get pending verifications
router.get('/verifications/pending', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({
      'verification.verificationStatus': 'pending',
      'verification.documents': { $exists: true, $ne: [] }
    })
      .select('-password')
      .sort({ 'verification.documents.uploadedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({
      'verification.verificationStatus': 'pending',
      'verification.documents': { $exists: true, $ne: [] }
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ message: 'Server error while fetching verifications' });
  }
});

// Verify/reject user KYC
router.put('/verifications/:userId/verify', adminAuth, [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('notes').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verification.verificationStatus = status;
    user.verification.isVerified = status === 'approved';
    user.verification.verifiedBy = req.userId;
    user.verification.verifiedAt = new Date();
    if (notes) user.verification.verificationNotes = notes;

    await user.save();

    res.json({
      message: `User verification ${status} successfully`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        verification: user.verification
      }
    });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error while verifying user' });
  }
});

// Get all disputes
router.get('/disputes', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { 'dispute.isOpen': true };
    
    if (status === 'resolved') {
      filter['dispute.resolvedAt'] = { $exists: true };
    } else if (status === 'open') {
      filter['dispute.resolvedAt'] = { $exists: false };
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('buyer seller', 'firstName lastName email')
      .populate('wasteItem', 'title')
      .sort({ 'dispute.openedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      disputes: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({ message: 'Server error while fetching disputes' });
  }
});

// Resolve dispute
router.post('/disputes/:orderId/resolve', adminAuth, [
  body('resolution').isLength({ min: 10, max: 1000 }).withMessage('Resolution must be 10-1000 characters'),
  body('action').isIn(['refund_buyer', 'release_seller', 'partial_refund', 'no_action']).withMessage('Invalid action')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resolution, action } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order || !order.dispute?.isOpen) {
      return res.status(404).json({ message: 'Open dispute not found' });
    }

    order.dispute.isOpen = false;
    order.dispute.resolvedAt = new Date();
    order.dispute.resolutionNote = resolution;
    order.timeline.push({
      status: 'dispute_resolved',
      note: `Admin resolved: ${resolution}. Action: ${action}`,
      timestamp: new Date(),
      updatedBy: req.userId
    });

    // Handle actions
    if (action === 'refund_buyer' && order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
      order.status = 'refunded';
    } else if (action === 'release_seller') {
      order.escrowHold = false;
      order.status = 'completed';
    }

    await order.save();

    res.json({
      message: 'Dispute resolved successfully',
      order
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ message: 'Server error while resolving dispute' });
  }
});

module.exports = router;
