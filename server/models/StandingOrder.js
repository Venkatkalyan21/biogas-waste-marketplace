const mongoose = require('mongoose');

const standingOrderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['fruits', 'vegetables', 'mixed', 'other'],
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
  maxPrice: {
    perUnit: {
      type: Number,
      required: true,
      min: [0, 'Price must be positive']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    }
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    required: true
  },
  nextDeliveryDate: {
    type: Date,
    required: true
  },
  location: {
    address: {
      street: String,
      city: {
        type: String,
        required: true
      },
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    }
  },
  subscribedSuppliers: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  fulfilledOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
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

standingOrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Convert coordinates to GeoJSON
  if (this.location.coordinates?.latitude && this.location.coordinates?.longitude) {
    this.location.geoLocation = {
      type: 'Point',
      coordinates: [this.location.coordinates.longitude, this.location.coordinates.latitude]
    };
  }
  
  next();
});

standingOrderSchema.index({ buyer: 1, isActive: 1 });
standingOrderSchema.index({ 'location.geoLocation': '2dsphere' });
standingOrderSchema.index({ nextDeliveryDate: 1 });

module.exports = mongoose.model('StandingOrder', standingOrderSchema);

