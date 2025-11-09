const express = require('express');
const { body, validationResult } = require('express-validator');
const SavedSearch = require('../models/SavedSearch');
const Waste = require('../models/Waste');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendTemplatedEmail, notifyUser } = require('../utils/notifications');

const router = express.Router();

// Create saved search
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('filters').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, filters } = req.body;

    const savedSearch = new SavedSearch({
      user: req.userId,
      name,
      filters: filters || {}
    });

    await savedSearch.save();

    res.status(201).json({ savedSearch });
  } catch (error) {
    console.error('Create saved search error:', error);
    res.status(500).json({ message: 'Server error while creating saved search' });
  }
});

// Get user's saved searches
router.get('/', auth, async (req, res) => {
  try {
    const searches = await SavedSearch.find({ user: req.userId, isActive: true })
      .sort({ createdAt: -1 });

    res.json({ savedSearches: searches });
  } catch (error) {
    console.error('Get saved searches error:', error);
    res.status(500).json({ message: 'Server error while fetching saved searches' });
  }
});

// Update saved search
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, filters, isActive } = req.body;
    const search = await SavedSearch.findById(req.params.id);

    if (!search) {
      return res.status(404).json({ message: 'Saved search not found' });
    }

    if (search.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this search' });
    }

    if (name) search.name = name;
    if (filters) search.filters = { ...search.filters, ...filters };
    if (isActive !== undefined) search.isActive = isActive;
    search.updatedAt = new Date();

    await search.save();

    res.json({ savedSearch: search });
  } catch (error) {
    console.error('Update saved search error:', error);
    res.status(500).json({ message: 'Server error while updating saved search' });
  }
});

// Delete saved search
router.delete('/:id', auth, async (req, res) => {
  try {
    const search = await SavedSearch.findById(req.params.id);

    if (!search) {
      return res.status(404).json({ message: 'Saved search not found' });
    }

    if (search.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this search' });
    }

    await SavedSearch.findByIdAndDelete(req.params.id);

    res.json({ message: 'Saved search deleted successfully' });
  } catch (error) {
    console.error('Delete saved search error:', error);
    res.status(500).json({ message: 'Server error while deleting saved search' });
  }
});

// Check for new matches and send alerts (this would typically run as a background job)
router.post('/check-alerts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('user');
    const searches = await SavedSearch.find({ user: req.userId, isActive: true });

    const results = [];

    for (const search of searches) {
      // Build filter from saved search
      const filter = { status: 'active', createdAt: { $gt: search.lastNotificationAt || search.createdAt } };
      
      if (search.filters.category) filter.category = search.filters.category;
      if (search.filters.wasteType) filter.wasteType = search.filters.wasteType;
      if (search.filters.condition) filter['quality.condition'] = search.filters.condition;
      if (search.filters.minQuantity) filter['quantity.amount'] = { $gte: search.filters.minQuantity };
      if (search.filters.minPrice || search.filters.maxPrice) {
        filter['price.perUnit'] = {};
        if (search.filters.minPrice) filter['price.perUnit'].$gte = search.filters.minPrice;
        if (search.filters.maxPrice) filter['price.perUnit'].$lte = search.filters.maxPrice;
      }

      // Text search
      if (search.filters.search) {
        filter.$or = [
          { title: new RegExp(search.filters.search, 'i') },
          { description: new RegExp(search.filters.search, 'i') }
        ];
      }

      // Geospatial search if coordinates provided
      let matches = [];
      if (search.filters.latitude && search.filters.longitude && search.filters.radiusKm) {
        const radius = search.filters.radiusKm * 1000;
        matches = await Waste.aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [search.filters.longitude, search.filters.latitude] },
              distanceField: 'distance',
              maxDistance: radius,
              spherical: true,
              query: { ...filter, 'location.geoLocation': { $exists: true } }
            }
          },
          { $limit: 10 }
        ]);
      } else {
        matches = await Waste.find(filter).limit(10);
      }

      if (matches.length > 0) {
        search.matchCount += matches.length;
        search.lastNotificationAt = new Date();
        await search.save();

        // Send notification
        try {
          const user = await User.findById(req.userId);
          await notifyUser({
            user,
            subject: 'New Listings Match Your Search',
            message: `${matches.length} new listing(s) match your saved search "${search.name}". Check them out now!`
          });
        } catch (e) {
          console.error('Notification error:', e);
        }

        results.push({ searchId: search._id, matches: matches.length });
      }
    }

    res.json({ message: 'Alerts checked', results });
  } catch (error) {
    console.error('Check alerts error:', error);
    res.status(500).json({ message: 'Server error while checking alerts' });
  }
});

module.exports = router;

