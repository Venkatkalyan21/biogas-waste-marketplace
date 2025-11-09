const express = require('express');
const { body, validationResult } = require('express-validator');
const MessageThread = require('../models/MessageThread');
const Message = require('../models/Message');
const Waste = require('../models/Waste');
const { auth } = require('../middleware/auth');
const { notifyUser } = require('../utils/notifications');

const router = express.Router();

// Create or get message thread for a listing
router.post('/threads', auth, [
  body('listingId').isMongoId().withMessage('Invalid listing ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { listingId } = req.body;
    const listing = await Waste.findById(listingId).populate('seller');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller._id.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    // Find or create thread
    let thread = await MessageThread.findOne({
      listing: listingId,
      buyer: req.userId,
      seller: listing.seller._id
    }).populate('buyer seller listing', 'firstName lastName email title');

    if (!thread) {
      thread = new MessageThread({
        listing: listingId,
        buyer: req.userId,
        seller: listing.seller._id
      });
      await thread.save();
      await thread.populate('buyer seller listing', 'firstName lastName email title');
    }

    res.json({ thread });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ message: 'Server error while creating thread' });
  }
});

// Get user's message threads
router.get('/threads', auth, async (req, res) => {
  try {
    const threads = await MessageThread.find({
      $or: [
        { buyer: req.userId },
        { seller: req.userId }
      ],
      isActive: true
    })
      .populate('listing', 'title images')
      .populate('buyer', 'firstName lastName')
      .populate('seller', 'firstName lastName')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json({ threads });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ message: 'Server error while fetching threads' });
  }
});

// Get messages in a thread
router.get('/threads/:threadId/messages', auth, async (req, res) => {
  try {
    const thread = await MessageThread.findById(req.params.threadId);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (thread.buyer.toString() !== req.userId && thread.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view this thread' });
    }

    // Mark messages as read
    await Message.updateMany(
      { thread: thread._id, recipient: req.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    // Update unread count
    if (thread.buyer.toString() === req.userId) {
      thread.buyerUnreadCount = 0;
    } else {
      thread.sellerUnreadCount = 0;
    }
    await thread.save();

    const messages = await Message.find({ thread: thread._id })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
});

// Send a message
router.post('/threads/:threadId/messages', auth, [
  body('body').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { body: messageBody } = req.body;
    const thread = await MessageThread.findById(req.params.threadId).populate('buyer seller');
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (thread.buyer._id.toString() !== req.userId && thread.seller._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to send messages in this thread' });
    }

    const recipient = thread.buyer._id.toString() === req.userId ? thread.seller : thread.buyer;

    const message = new Message({
      thread: thread._id,
      sender: req.userId,
      recipient: recipient._id,
      body: messageBody
    });

    await message.save();

    // Update thread
    thread.lastMessage = message._id;
    thread.lastMessageAt = new Date();
    if (thread.buyer._id.toString() === req.userId) {
      thread.sellerUnreadCount += 1;
    } else {
      thread.buyerUnreadCount += 1;
    }
    await thread.save();

    // Notify recipient
    try {
      await notifyUser({
        user: recipient,
        subject: 'New Message',
        message: `You have a new message about ${thread.listing?.title || 'a listing'}.`
      });
    } catch (e) {
      console.error('Notification error:', e);
    }

    await message.populate('sender', 'firstName lastName');

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
});

module.exports = router;

