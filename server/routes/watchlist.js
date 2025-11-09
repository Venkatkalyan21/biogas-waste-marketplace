const express = require('express');
const User = require('../models/User');
const Waste = require('../models/Waste');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Add to watchlist
router.post('/add', auth, async (req, res) => {
  try {
    const { listingId } = req.body;
    
    if (!listingId) {
      return res.status(400).json({ message: 'Listing ID is required' });
    }

    const listing = await Waste.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const user = await User.findById(req.userId);
    if (user.watchlist.some(item => item.listing.toString() === listingId)) {
      return res.status(400).json({ message: 'Already in watchlist' });
    }

    user.watchlist.push({ listing: listingId });
    await user.save();

    res.json({ message: 'Added to watchlist', watchlist: user.watchlist });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Server error while adding to watchlist' });
  }
});

// Remove from watchlist
router.post('/remove', auth, async (req, res) => {
  try {
    const { listingId } = req.body;
    
    const user = await User.findById(req.userId);
    user.watchlist = user.watchlist.filter(
      item => item.listing.toString() !== listingId
    );
    await user.save();

    res.json({ message: 'Removed from watchlist', watchlist: user.watchlist });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Server error while removing from watchlist' });
  }
});

// Get user's watchlist
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'watchlist.listing',
      populate: { path: 'seller', select: 'firstName lastName ratings' }
    });

    const listings = user.watchlist.map(item => item.listing).filter(Boolean);

    res.json({ watchlist: listings });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ message: 'Server error while fetching watchlist' });
  }
});

module.exports = router;

