const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Search name cannot exceed 100 characters']
  },
  filters: {
    search: String,
    category: String,
    subcategory: String,
    wasteType: String,
    condition: String,
    minQuantity: Number,
    minPrice: Number,
    maxPrice: Number,
    minMoisture: Number,
    maxMoisture: Number,
    hasCertification: Boolean,
    latitude: Number,
    longitude: Number,
    radiusKm: Number,
    city: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastNotificationAt: Date,
  matchCount: {
    type: Number,
    default: 0
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

savedSearchSchema.index({ user: 1, isActive: 1 });
savedSearchSchema.index({ lastNotificationAt: 1 });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);

