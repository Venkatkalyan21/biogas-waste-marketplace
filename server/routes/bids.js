const express = require('express');
const { body, validationResult } = require('express-validator');
const Bid = require('../models/Bid');
const Waste = require('../models/Waste');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const { notifyUser } = require('../utils/notifications');

const router = express.Router();

// Place a bid on a listing
router.post('/', auth, [
  body('listingId').isMongoId().withMessage('Invalid listing ID'),
  body('amount').isFloat({ min: 0 }).withMessage('Bid amount must be positive'),
  body('quantity.amount').isFloat({ min: 0 }).withMessage('Quantity must be positive'),
  body('quantity.unit').isIn(['kg', 'tons', 'pounds', 'cubic_meters']).withMessage('Invalid unit'),
  body('message').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { listingId, amount, quantity, message } = req.body;

    const listing = await Waste.findById(listingId).populate('seller');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller._id.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot bid on your own listing' });
    }

    if (listing.price.priceType !== 'bids') {
      return res.status(400).json({ message: 'This listing does not accept bids' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'Listing is not active' });
    }

    // Check minimum bid
    if (listing.price.minBid && amount < listing.price.minBid) {
      return res.status(400).json({ message: `Bid must be at least ${listing.price.minBid}` });
    }

    const bid = new Bid({
      listing: listingId,
      bidder: req.userId,
      amount,
      quantity,
      message
    });

    await bid.save();
    await bid.populate('bidder', 'firstName lastName');

    // Notify seller
    try {
      await notifyUser({
        user: listing.seller,
        subject: 'New Bid Received',
        message: `You received a new bid of ₹${amount} for ${listing.title}.`
      });
    } catch (e) {
      console.error('Notification error:', e);
    }

    res.status(201).json({ bid });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ message: 'Server error while placing bid' });
  }
});

// Get bids for a listing
router.get('/listing/:listingId', auth, async (req, res) => {
  try {
    const listing = await Waste.findById(req.params.listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Only seller can see all bids
    const isSeller = listing.seller.toString() === req.userId;
    const filter = { listing: req.params.listingId };
    
    if (!isSeller) {
      // Buyers can only see their own bids
      filter.bidder = req.userId;
    }

    const bids = await Bid.find(filter)
      .populate('bidder', 'firstName lastName ratings')
      .sort({ amount: -1, createdAt: -1 });

    res.json({ bids });
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({ message: 'Server error while fetching bids' });
  }
});

// Accept a bid (seller)
router.post('/:bidId/accept', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate('listing bidder');
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const listing = await Waste.findById(bid.listing._id);
    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only seller can accept bids' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Bid is not pending' });
    }

    // Reject all other pending bids
    await Bid.updateMany(
      { listing: listing._id, _id: { $ne: bid._id }, status: 'pending' },
      { status: 'rejected' }
    );

    // Accept this bid
    bid.status = 'accepted';
    await bid.save();

    // Create order from accepted bid
    const order = new Order({
      buyer: bid.bidder._id,
      seller: listing.seller,
      wasteItem: listing._id,
      quantity: bid.quantity,
      totalPrice: {
        amount: bid.amount * bid.quantity.amount,
        currency: listing.price.currency
      },
      delivery: { method: 'pickup' },
      paymentMethod: 'stripe',
      status: 'placed'
    });

    await order.save();
    await order.populate([
      { path: 'buyer', select: 'firstName lastName email phone' },
      { path: 'seller', select: 'firstName lastName email phone businessInfo' },
      { path: 'wasteItem', select: 'title description price location' }
    ]);

    // Mark listing as sold
    listing.status = 'sold';
    await listing.save();

    // Notify farmer (seller) about new order from accepted bid
    try {
      const seller = order.seller;
      const orderId = order.orderNumber || order._id.toString().slice(-8).toUpperCase();
      const farmerMessage = `🎉 New Order from Accepted Bid!\n\nOrder ID: ${orderId}\nProduct: ${listing.title}\nQuantity: ${bid.quantity.amount} ${bid.quantity.unit}\nTotal: ${listing.price.currency} ${(bid.amount * bid.quantity.amount).toFixed(2)}\n\n✅ Please get ready and prepare the order!\n\nThank you! 🌱`;
      
      // Send SMS/WhatsApp notification to farmer
      await notifyUser({
        user: seller,
        subject: `New Order #${orderId} - Get Ready!`,
        message: farmerMessage
      });
    } catch (e) {
      console.error('Notification error (farmer):', e);
    }

    // Notify bidder (buyer) that their bid was accepted
    try {
      await notifyUser({
        user: bid.bidder,
        subject: 'Bid Accepted',
        message: `Your bid of ${listing.price.currency} ${bid.amount} for ${listing.title} has been accepted! Order #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}`
      });
    } catch (e) {
      console.error('Notification error (bidder):', e);
    }

    res.json({
      message: 'Bid accepted and order created',
      bid,
      order
    });
  } catch (error) {
    console.error('Accept bid error:', error);
    res.status(500).json({ message: 'Server error while accepting bid' });
  }
});

// Reject a bid (seller)
router.post('/:bidId/reject', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate('listing');
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const listing = await Waste.findById(bid.listing._id);
    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only seller can reject bids' });
    }

    bid.status = 'rejected';
    await bid.save();

    res.json({ message: 'Bid rejected', bid });
  } catch (error) {
    console.error('Reject bid error:', error);
    res.status(500).json({ message: 'Server error while rejecting bid' });
  }
});

// Withdraw a bid (bidder)
router.post('/:bidId/withdraw', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.bidder.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only bidder can withdraw bid' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Bid cannot be withdrawn' });
    }

    bid.status = 'withdrawn';
    await bid.save();

    res.json({ message: 'Bid withdrawn', bid });
  } catch (error) {
    console.error('Withdraw bid error:', error);
    res.status(500).json({ message: 'Server error while withdrawing bid' });
  }
});

module.exports = router;

