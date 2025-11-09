const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['fruits', 'vegetables', 'mixed', 'other']
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory is required']
  },
  wasteType: {
    type: String,
    enum: ['organic_waste', 'peels', 'seeds', 'stems', 'leaves', 'spoiled_produce', 'excess_inventory', 'processing_byproducts'],
    required: [true, 'Waste type is required']
  },
  quantity: {
    amount: {
      type: Number,
      required: [true, 'Quantity amount is required'],
      min: [0, 'Quantity must be positive']
    },
    unit: {
      type: String,
      enum: ['kg', 'tons', 'pounds', 'cubic_meters'],
      required: [true, 'Unit is required']
    }
  },
  price: {
    perUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price must be positive']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    },
    negotiable: {
      type: Boolean,
      default: true
    },
    priceType: {
      type: String,
      enum: ['fixed', 'bids', 'negotiable'],
      default: 'fixed'
    },
    minBid: Number,
    reservePrice: Number
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
        default: 'USA'
      }
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    // GeoJSON format for MongoDB geospatial queries
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: undefined
      }
    }
  },
  availability: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    frequency: {
      type: String,
      enum: ['one_time', 'daily', 'weekly', 'monthly'],
      default: 'one_time'
    }
  },
  quality: {
    condition: {
      type: String,
      enum: ['fresh', 'slightly_damaged', 'spoiled', 'processed'],
      required: true
    },
    moistureContent: {
      type: Number,
      min: 0,
      max: 100
    },
    contaminationLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    }
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    validUntil: Date,
    documentUrl: String
  }],
  logistics: {
    pickupAvailable: {
      type: Boolean,
      default: true
    },
    deliveryAvailable: {
      type: Boolean,
      default: false
    },
    deliveryRadius: {
      type: Number,
      default: 0
    },
    handlingInstructions: String,
    storageRequirements: String
  },
  targetMarket: {
    type: String,
    enum: ['b2b', 'b2c', 'both'],
    default: 'both'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'expired', 'cancelled'],
    default: 'pending'
  },
  views: {
    type: Number,
    default: 0
  },
  interestedBuyers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contactedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save and convert coordinates to GeoJSON
wasteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Convert lat/lng to GeoJSON format for geospatial queries
  if (this.location.coordinates?.latitude && this.location.coordinates?.longitude) {
    this.location.geoLocation = {
      type: 'Point',
      coordinates: [this.location.coordinates.longitude, this.location.coordinates.latitude]
    };
  }
  
  next();
});

// Index for search functionality
wasteSchema.index({ category: 1, subcategory: 1 });
wasteSchema.index({ 'location.address.city': 1 });
wasteSchema.index({ seller: 1 });
wasteSchema.index({ status: 1 });
wasteSchema.index({ price: 1 });
wasteSchema.index({ createdAt: -1 });

// Geospatial index for radius searches
wasteSchema.index({ 'location.geoLocation': '2dsphere' });

// Text index for search
wasteSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Waste', wasteSchema);
