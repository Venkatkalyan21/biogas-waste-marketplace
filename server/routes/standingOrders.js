const express = require('express');
const { body, validationResult } = require('express-validator');
const StandingOrder = require('../models/StandingOrder');
const Waste = require('../models/Waste');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { notifyUser } = require('../utils/notifications');

const router = express.Router();

// Create standing order (buyer)
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('category').isIn(['fruits', 'vegetables', 'mixed', 'other']).withMessage('Invalid category'),
  body('quantity.amount').isFloat({ min: 0 }).withMessage('Quantity must be positive'),
  body('quantity.unit').isIn(['kg', 'tons', 'pounds', 'cubic_meters']).withMessage('Invalid unit'),
  body('maxPrice.perUnit').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('frequency').isIn(['daily', 'weekly', 'biweekly', 'monthly']).withMessage('Invalid frequency'),
  body('nextDeliveryDate').isISO8601().withMessage('Invalid date'),
  body('location.address.city').notEmpty().withMessage('City is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can create standing orders' });
    }

    const standingOrder = new StandingOrder({
      ...req.body,
      buyer: req.userId
    });

    await standingOrder.save();
    await standingOrder.populate('buyer', 'firstName lastName');

    res.status(201).json({ standingOrder });
  } catch (error) {
    console.error('Create standing order error:', error);
    res.status(500).json({ message: 'Server error while creating standing order' });
  }
});

// Get buyer's standing orders
router.get('/my', auth, async (req, res) => {
  try {
    const standingOrders = await StandingOrder.find({ buyer: req.userId })
      .populate('subscribedSuppliers.supplier', 'firstName lastName businessInfo ratings')
      .sort({ createdAt: -1 });

    res.json({ standingOrders });
  } catch (error) {
    console.error('Get standing orders error:', error);
    res.status(500).json({ message: 'Server error while fetching standing orders' });
  }
});

// Get available standing orders (for suppliers to browse and subscribe)
router.get('/available', auth, async (req, res) => {
  try {
    const { latitude, longitude, radiusKm, category } = req.query;
    
    let filter = { isActive: true };
    if (category) filter.category = category;

    let standingOrders;
    if (latitude && longitude && radiusKm) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const radius = parseFloat(radiusKm) * 1000;

      standingOrders = await StandingOrder.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lon, lat] },
            distanceField: 'distance',
            maxDistance: radius,
            spherical: true,
            query: { ...filter, 'location.geoLocation': { $exists: true } }
          }
        },
        { $limit: 50 }
      ]);
    } else {
      standingOrders = await StandingOrder.find(filter)
        .populate('buyer', 'firstName lastName ratings')
        .sort({ nextDeliveryDate: 1 })
        .limit(50);
    }

    res.json({ standingOrders });
  } catch (error) {
    console.error('Get available standing orders error:', error);
    res.status(500).json({ message: 'Server error while fetching standing orders' });
  }
});

// Subscribe to standing order (supplier)
router.post('/:orderId/subscribe', auth, async (req, res) => {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({ message: 'Only suppliers can subscribe to standing orders' });
    }

    const standingOrder = await StandingOrder.findById(req.params.orderId);
    if (!standingOrder) {
      return res.status(404).json({ message: 'Standing order not found' });
    }

    if (!standingOrder.isActive) {
      return res.status(400).json({ message: 'Standing order is not active' });
    }

    // Check if already subscribed
    const alreadySubscribed = standingOrder.subscribedSuppliers.some(
      sub => sub.supplier.toString() === req.userId && sub.isActive
    );

    if (alreadySubscribed) {
      return res.status(400).json({ message: 'Already subscribed to this standing order' });
    }

    standingOrder.subscribedSuppliers.push({
      supplier: req.userId,
      isActive: true
    });

    await standingOrder.save();

    // Notify buyer
    try {
      const buyer = await User.findById(standingOrder.buyer);
      await notifyUser({
        user: buyer,
        subject: 'New Supplier Subscribed',
        message: `A supplier has subscribed to your standing order: ${standingOrder.title}`
      });
    } catch (e) {
      console.error('Notification error:', e);
    }

    res.json({ message: 'Subscribed successfully', standingOrder });
  } catch (error) {
    console.error('Subscribe to standing order error:', error);
    res.status(500).json({ message: 'Server error while subscribing' });
  }
});

// Unsubscribe from standing order (supplier)
router.post('/:orderId/unsubscribe', auth, async (req, res) => {
  try {
    const standingOrder = await StandingOrder.findById(req.params.orderId);
    if (!standingOrder) {
      return res.status(404).json({ message: 'Standing order not found' });
    }

    const subscription = standingOrder.subscribedSuppliers.find(
      sub => sub.supplier.toString() === req.userId
    );

    if (!subscription) {
      return res.status(400).json({ message: 'Not subscribed to this standing order' });
    }

    subscription.isActive = false;
    await standingOrder.save();

    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Server error while unsubscribing' });
  }
});

// Fulfill standing order (supplier creates listing/order to fulfill)
router.post('/:orderId/fulfill', auth, [
  body('wasteListingId').isMongoId().withMessage('Invalid listing ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { wasteListingId } = req.body;
    const standingOrder = await StandingOrder.findById(req.params.orderId);
    
    if (!standingOrder) {
      return res.status(404).json({ message: 'Standing order not found' });
    }

    const subscription = standingOrder.subscribedSuppliers.find(
      sub => sub.supplier.toString() === req.userId && sub.isActive
    );

    if (!subscription) {
      return res.status(403).json({ message: 'Not subscribed to this standing order' });
    }

    const wasteListing = await Waste.findById(wasteListingId);
    if (!wasteListing || wasteListing.seller.toString() !== req.userId) {
      return res.status(404).json({ message: 'Waste listing not found or not yours' });
    }

    // Create order
    const order = new Order({
      buyer: standingOrder.buyer,
      seller: req.userId,
      wasteItem: wasteListingId,
      quantity: standingOrder.quantity,
      totalPrice: {
        amount: standingOrder.maxPrice.perUnit * standingOrder.quantity.amount,
        currency: standingOrder.maxPrice.currency
      },
      delivery: { method: 'pickup' },
      paymentMethod: 'stripe',
      status: 'placed'
    });

    await order.save();
    standingOrder.fulfilledOrders.push(order._id);
    
    // Update next delivery date based on frequency
    const nextDate = new Date(standingOrder.nextDeliveryDate);
    switch (standingOrder.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }
    standingOrder.nextDeliveryDate = nextDate;
    
    await standingOrder.save();

    // Notify buyer
    try {
      const buyer = await User.findById(standingOrder.buyer);
      await notifyUser({
        user: buyer,
        subject: 'Standing Order Fulfilled',
        message: `Your standing order "${standingOrder.title}" has been fulfilled. Order #${order.orderNumber}`
      });
    } catch (e) {
      console.error('Notification error:', e);
    }

    res.json({
      message: 'Standing order fulfilled successfully',
      order,
      standingOrder
    });
  } catch (error) {
    console.error('Fulfill standing order error:', error);
    res.status(500).json({ message: 'Server error while fulfilling standing order' });
  }
});

module.exports = router;

