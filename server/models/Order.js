const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
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
  wasteItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waste',
    required: true
  },
  quantity: {
    amount: {
      type: Number,
      required: true,
      min: [0, 'Quantity must be positive']
    },
    unit: {
      type: String,
      enum: ['kg', 'tons', 'pounds', 'cubic_meters'],
      required: true
    }
  },
  totalPrice: {
    amount: {
      type: Number,
      required: true,
      min: [0, 'Total price must be positive']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'placed', 'accepted', 'pickup_scheduled', 'in_transit', 'delivered', 'completed', 'cancelled', 'confirmed', 'processing', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer', 'cash_on_delivery'],
    required: true
  },
  paymentId: String,
  delivery: {
    method: {
      type: String,
      enum: ['pickup', 'delivery'],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    scheduledDate: Date,
    estimatedDelivery: Date,
    actualDelivery: Date,
    trackingNumber: String,
    carrier: String,
    deliveryNotes: String
  },
  negotiation: {
    isNegotiated: {
      type: Boolean,
      default: false
    },
    originalPrice: Number,
    negotiatedPrice: Number,
    negotiationHistory: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      price: Number,
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  qualityVerification: {
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    qualityReport: String,
    images: [String]
  },
  reviews: {
    buyerReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      reviewedAt: Date
    },
    sellerReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      reviewedAt: Date
    }
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  escrowHold: { type: Boolean, default: false },
  dispute: {
    isOpen: { type: Boolean, default: false },
    reason: String,
    openedAt: Date,
    resolvedAt: Date,
    resolutionNote: String
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Index for search functionality
orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
