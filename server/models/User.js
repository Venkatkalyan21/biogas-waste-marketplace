const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.authProvider || this.authProvider === 'local';
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  authProviderId: {
    type: String, // Google user ID or Facebook user ID
    sparse: true
  },
  phone: {
    type: String,
    required: function() {
      return !this.authProvider || this.authProvider === 'local';
    },
    match: [/^[+]?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['supplier', 'buyer', 'admin'],
    required: [true, 'User role is required']
  },
  businessInfo: {
    companyName: String,
    businessType: {
      type: String,
      enum: ['restaurant', 'grocery', 'farm', 'food_processor', 'biogas_plant', 'other']
    },
    registrationNumber: String,
    taxId: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  profile: {
    avatar: String,
    bio: String,
    website: String,
    socialLinks: {
      linkedin: String,
      facebook: String,
      twitter: String
    }
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationExpires: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verificationType: {
      type: String,
      enum: ['phone', 'email', 'business', 'identity'],
      default: 'phone'
    },
    documents: [{
      type: {
        type: String,
        enum: ['business_registration', 'tax_id', 'identity_card', 'address_proof', 'other'],
        required: true
      },
      url: String,
      publicId: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: Date
    }],
    businessRegistrationNumber: String,
    taxId: String,
    verificationNotes: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  watchlist: [{
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Waste'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving (only for local auth)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.authProvider !== 'local') return next();
  if (!this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update the updatedAt field on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for email
userSchema.index({ email: 1 });

userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
