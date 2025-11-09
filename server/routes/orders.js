const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Waste = require('../models/Waste');
const { auth } = require('../middleware/auth');

const router = express.Router();
const { notifyUser, sendTemplatedEmail } = require('../utils/notifications');

// Create new order (buyers only - checked via role in route logic)
router.post('/', auth, [
  body('wasteItem').isMongoId().withMessage('Invalid waste item ID'),
  body('quantity.amount').isFloat({ min: 0 }).withMessage('Quantity must be positive'),
  body('quantity.unit').isIn(['kg', 'tons', 'pounds', 'cubic_meters']).withMessage('Invalid unit'),
  body('delivery.method').isIn(['pickup', 'delivery']).withMessage('Invalid delivery method'),
  body('paymentMethod').isIn(['stripe', 'paypal', 'bank_transfer', 'cash_on_delivery']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { wasteItem, quantity, delivery, paymentMethod, notes } = req.body;

    // Only buyers can create orders
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can place orders' });
    }

    // Check if waste item exists and is active
    const waste = await Waste.findById(wasteItem);
    if (!waste) {
      return res.status(404).json({ message: 'Waste item not found' });
    }

    if (waste.status !== 'active') {
      return res.status(400).json({ message: 'Waste item is not available' });
    }

    // Check if user is not the seller
    if (waste.seller.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot order your own listing' });
    }

    // Calculate total price
    const totalPrice = waste.price.perUnit * quantity.amount;

    // Create order
    const order = new Order({
      buyer: req.userId,
      seller: waste.seller,
      wasteItem,
      quantity,
      totalPrice: {
        amount: totalPrice,
        currency: waste.price.currency
      },
      delivery,
      paymentMethod,
      notes
    });

    await order.save();
    await order.populate([
      { path: 'buyer', select: 'firstName lastName email phone' },
      { path: 'seller', select: 'firstName lastName email phone businessInfo' },
      { path: 'wasteItem', select: 'title description price location' }
    ]);

    // Notify seller (farmer) about new order with order ID and get ready message
    try {
      const seller = order.seller;
      
      // Create a friendly message for the farmer
      const orderId = order.orderNumber || order._id.toString().slice(-8).toUpperCase();
      const farmerMessage = `🎉 New Order Placed!\n\nOrder ID: ${orderId}\nProduct: ${waste.title}\nQuantity: ${quantity.amount} ${quantity.unit}\nTotal: ${waste.price.currency} ${totalPrice.toFixed(2)}\n\n✅ Please get ready and prepare the order!\n\nDelivery Method: ${delivery.method === 'pickup' ? 'Customer Pickup' : 'Delivery'}\n\nThank you! 🌱`;
      
      // Send email notification
      if (seller?.email) {
        await sendTemplatedEmail({
          to: seller.email,
          templateName: 'orderPlaced',
          templateData: { order, userName: seller.firstName },
          subject: `New Order #${orderId} - Get Ready!`
        });
      }
      
      // Send SMS/WhatsApp notification (prioritized for farmers)
      await notifyUser({
        user: seller,
        subject: `New Order #${orderId} - Get Ready!`,
        message: farmerMessage
      });
    } catch (e) {
      console.error('Notification error (order create):', e);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

// Get user's orders (as buyer)
router.get('/my/buyer', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { buyer: req.userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('seller', 'firstName lastName businessInfo ratings')
      .populate('wasteItem', 'title description images')
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
    console.error('Get buyer orders error:', error);
    res.status(500).json({ message: 'Server error while fetching buyer orders' });
  }
});

// Get user's orders (as seller)
router.get('/my/seller', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { seller: req.userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('buyer', 'firstName lastName ratings')
      .populate('wasteItem', 'title description images')
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
    console.error('Get seller orders error:', error);
    res.status(500).json({ message: 'Server error while fetching seller orders' });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'firstName lastName email phone')
      .populate('seller', 'firstName lastName email phone businessInfo')
      .populate('wasteItem', 'title description images category subcategory');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is buyer or seller
    if (order.buyer._id.toString() !== req.userId && order.seller._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// Update order status (extended lifecycle)
router.put('/:id/status', auth, [
  body('status').isIn(['placed', 'accepted', 'pickup_scheduled', 'in_transit', 'delivered', 'completed', 'cancelled', 'confirmed', 'processing']).withMessage('Invalid status'),
  body('note').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is buyer or seller
    const isBuyer = order.buyer.toString() === req.userId;
    const isSeller = order.seller.toString() === req.userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Validate status transitions based on user role (simple rules)
    const validTransitions = {
      buyer: ['cancelled'],
      seller: ['accepted', 'pickup_scheduled', 'in_transit', 'delivered', 'completed', 'cancelled']
    };

    if (isBuyer && !validTransitions.buyer.includes(status)) {
      return res.status(400).json({ message: 'Buyer cannot set this status' });
    }

    if (isSeller && !validTransitions.seller.includes(status)) {
      return res.status(400).json({ message: 'Seller cannot set this status' });
    }

    // Update order status
    order.status = status;
    order.timeline.push({
      status,
      note,
      timestamp: new Date(),
      updatedBy: req.userId
    });

    await order.save();

    // Notify counterpart about status change (templated email + fallback)
    try {
      const counterpartId = order.buyer.toString() === req.userId ? order.seller : order.buyer;
      const counterpart = await Order.findById(order._id)
        .populate('buyer', 'firstName lastName email phone')
        .populate('seller', 'firstName lastName email phone');
      const targetUser = counterpartId.toString() === counterpart.buyer._id.toString() ? counterpart.buyer : counterpart.seller;
      
      if (targetUser?.email) {
        await sendTemplatedEmail({
          to: targetUser.email,
          templateName: 'orderStatusUpdated',
          templateData: { order, status, userName: targetUser.firstName },
          subject: 'Order Status Updated - AgriLoop'
        });
      }
      // Also send SMS/WhatsApp if configured
      await notifyUser({
        user: targetUser,
        subject: 'Order Status Updated',
        message: `Order ${order.orderNumber} status changed to ${status}.`
      });
    } catch (e) {
      console.error('Notification error (status update):', e);
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error while updating order status' });
  }
});

// Open dispute
router.post('/:id/dispute', auth, [
  body('reason').isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const isParty = order.buyer.toString() === req.userId || order.seller.toString() === req.userId;
    if (!isParty) return res.status(403).json({ message: 'Not authorized to dispute this order' });
    if (order.dispute?.isOpen) return res.status(400).json({ message: 'Dispute already open' });
    order.dispute = { isOpen: true, reason, openedAt: new Date() };
    order.timeline.push({ status: 'dispute_opened', note: reason, timestamp: new Date(), updatedBy: req.userId });
    await order.save();
    res.json({ message: 'Dispute opened', order });
  } catch (e) {
    console.error('Open dispute error:', e);
    res.status(500).json({ message: 'Server error while opening dispute' });
  }
});

// Escrow release (simplified: mark completed if delivered and paid)
router.post('/:id/release-escrow', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const isSellerOrAdmin = order.seller.toString() === req.userId; // Admin check can be added later
    if (!isSellerOrAdmin) return res.status(403).json({ message: 'Not authorized to release escrow' });
    if (order.paymentStatus !== 'paid' || !order.escrowHold) {
      return res.status(400).json({ message: 'No escrow to release' });
    }
    // Minimal rule: if delivered, allow completion
    if (order.status !== 'delivered' && order.status !== 'in_transit') {
      return res.status(400).json({ message: 'Order must be delivered or in transit to release' });
    }
    order.escrowHold = false;
    order.status = 'completed';
    order.timeline.push({ status: 'completed', note: 'Escrow released', timestamp: new Date(), updatedBy: req.userId });
    await order.save();
    res.json({ message: 'Escrow released', order });
  } catch (e) {
    console.error('Release escrow error:', e);
    res.status(500).json({ message: 'Server error while releasing escrow' });
  }
});

// Add review to order
router.post('/:id/review', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only review delivered orders' });
    }

    const isBuyer = order.buyer.toString() === req.userId;
    const isSeller = order.seller.toString() === req.userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to review this order' });
    }

    // Add review
    const reviewData = {
      rating,
      comment,
      reviewedAt: new Date()
    };

    if (isBuyer) {
      if (order.reviews.buyerReview) {
        return res.status(400).json({ message: 'Buyer review already exists' });
      }
      order.reviews.buyerReview = reviewData;
    } else {
      if (order.reviews.sellerReview) {
        return res.status(400).json({ message: 'Seller review already exists' });
      }
      order.reviews.sellerReview = reviewData;
    }

    await order.save();

    res.json({
      message: 'Review added successfully',
      order
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error while adding review' });
  }
});

// Negotiate price
router.post('/:id/negotiate', auth, [
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('message').isLength({ min: 10, max: 500 }).withMessage('Message must be 10-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { price, message } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is buyer
    if (order.buyer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only buyer can negotiate' });
    }

    // Check if order is in pending status
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Can only negotiate pending orders' });
    }

    // Add negotiation entry
    if (!order.negotiation.originalPrice) {
      order.negotiation.originalPrice = order.totalPrice.amount;
    }

    order.negotiation.negotiationHistory.push({
      user: req.userId,
      price,
      message,
      timestamp: new Date()
    });

    order.negotiation.isNegotiated = true;
    order.negotiation.negotiatedPrice = price;

    await order.save();

    res.json({
      message: 'Negotiation sent successfully',
      order
    });
  } catch (error) {
    console.error('Negotiate price error:', error);
    res.status(500).json({ message: 'Server error while negotiating price' });
  }
});

module.exports = router;
