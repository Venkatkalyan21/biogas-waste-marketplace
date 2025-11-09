const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waste',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Bid amount must be positive']
  },
  quantity: {
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['kg', 'tons', 'pounds', 'cubic_meters'],
      required: true
    }
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired'],
    default: 'pending'
  },
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

bidSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

bidSchema.index({ listing: 1, status: 1 });
bidSchema.index({ bidder: 1 });
bidSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Bid', bidSchema);

