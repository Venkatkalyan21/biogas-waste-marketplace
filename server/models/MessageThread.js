const mongoose = require('mongoose');

const messageThreadSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waste',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  buyerUnreadCount: {
    type: Number,
    default: 0
  },
  sellerUnreadCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

messageThreadSchema.index({ buyer: 1, seller: 1, listing: 1 });
messageThreadSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('MessageThread', messageThreadSchema);

