const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate('buyer seller');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the buyer
    if (order.buyer._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    // Check if order is in confirmed status
    if (order.status !== 'confirmed') {
      return res.status(400).json({ message: 'Order must be confirmed before payment' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice.amount * 100), // Convert to cents
      currency: order.totalPrice.currency.toLowerCase(),
      metadata: {
        orderId: order._id.toString(),
        buyerId: order.buyer._id.toString(),
        sellerId: order.seller._id.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error while creating payment intent' });
  }
});

// Confirm payment
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the buyer
    if (order.buyer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to confirm this payment' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order payment status
      order.paymentStatus = 'paid';
      order.paymentId = paymentIntentId;
      order.status = 'processing';
      order.timeline.push({
        status: 'processing',
        note: 'Payment confirmed successfully',
        timestamp: new Date(),
        updatedBy: req.userId
      });

      await order.save();

      res.json({
        message: 'Payment confirmed successfully',
        order
      });
    } else {
      res.status(400).json({ 
        message: 'Payment not successful',
        status: paymentIntent.status 
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error while confirming payment' });
  }
});

// Process refund
router.post('/refund', auth, async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the seller or admin
    if (order.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to refund this order' });
    }

    // Check if payment was made
    if (!order.paymentId || order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'No payment to refund' });
    }

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentId,
      reason: 'requested_by_customer',
      metadata: {
        orderId: order._id.toString(),
        refundReason: reason
      }
    });

    if (refund.status === 'succeeded') {
      // Update order status
      order.paymentStatus = 'refunded';
      order.status = 'refunded';
      order.timeline.push({
        status: 'refunded',
        note: `Refund processed: ${reason}`,
        timestamp: new Date(),
        updatedBy: req.userId
      });

      await order.save();

      res.json({
        message: 'Refund processed successfully',
        refund,
        order
      });
    } else {
      res.status(400).json({ 
        message: 'Refund not successful',
        status: refund.status 
      });
    }
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Server error while processing refund' });
  }
});

// Get payment methods
router.get('/methods', auth, async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Pay securely with your credit or debit card',
        icon: 'credit-card',
        enabled: true
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        icon: 'paypal',
        enabled: false // Can be enabled when PayPal is integrated
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank transfer',
        icon: 'bank',
        enabled: true
      },
      {
        id: 'cash_on_delivery',
        name: 'Cash on Delivery',
        description: 'Pay when you receive the waste',
        icon: 'cash',
        enabled: true
      }
    ];

    res.json({ paymentMethods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error while fetching payment methods' });
  }
});

module.exports = router;

// Razorpay integration
// Initialize Razorpay instance lazily to avoid errors when keys are not set
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Create Razorpay order for a given orderId (amount in paise)
router.post('/razorpay/create-order', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(400).json({ message: 'Razorpay not configured' });
    }

    const order = await Order.findById(orderId).populate('buyer seller');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyer._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    // Optional: ensure order status allows payment
    // if (order.status !== 'confirmed') {
    //   return res.status(400).json({ message: 'Order must be confirmed before payment' });
    // }

    const amountPaise = Math.round(order.totalPrice.amount * 100);
    const rzpOrder = await rzp.orders.create({
      amount: amountPaise,
      currency: (order.totalPrice.currency || 'INR').toUpperCase(),
      receipt: order._id.toString(),
      notes: {
        buyerId: order.buyer._id.toString(),
        sellerId: order.seller._id.toString()
      }
    });

    res.json({
      id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      receipt: rzpOrder.receipt,
      keyId: process.env.RAZORPAY_KEY_ID,
      name: process.env.RAZORPAY_BUSINESS_NAME || 'AgriLoop',
      description: `Payment for Order ${order.orderNumber || order._id}`
    });
  } catch (error) {
    console.error('Razorpay create-order error:', error);
    res.status(500).json({ message: 'Server error while creating Razorpay order' });
  }
});

// Stripe webhook (handle succeeded/failed events) - needs raw body
// NOTE: Mounting separately so we can parse raw body; ensure index mounts router before JSON body or use this local parser
router.post('/stripe/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verify failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'paid';
          order.paymentMethod = 'stripe';
          order.paymentId = pi.id;
          if (order.status === 'confirmed' || order.status === 'pending') {
            order.status = 'processing';
          }
          order.escrowHold = true;
          order.timeline.push({ status: 'processing', note: 'Stripe payment succeeded', timestamp: new Date() });
          await order.save();
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'failed';
          order.timeline.push({ status: 'pending', note: 'Stripe payment failed', timestamp: new Date() });
          await order.save();
        }
      }
    }
    res.json({ received: true });
  } catch (e) {
    console.error('Stripe webhook processing error:', e);
    res.status(500).json({ message: 'Webhook processing error' });
  }
});

// Verify Razorpay payment signature and mark order paid
router.post('/razorpay/verify', auth, async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ message: 'Razorpay not configured' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to verify this payment' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    order.paymentStatus = 'paid';
    order.paymentMethod = 'razorpay';
    order.paymentId = razorpay_payment_id;
    order.status = 'processing';
    order.timeline.push({
      status: 'processing',
      note: 'Razorpay payment verified',
      timestamp: new Date(),
      updatedBy: req.userId
    });
    await order.save();

    res.json({ message: 'Payment verified', order });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({ message: 'Server error while verifying Razorpay payment' });
  }
});
