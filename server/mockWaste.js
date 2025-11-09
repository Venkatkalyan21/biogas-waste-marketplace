// Mock waste routes for testing without MongoDB
const jwt = require('jsonwebtoken');

// Mock waste data - CLEARED FOR FRESH START
let mockWasteItems = [];

const JWT_SECRET = 'biogas_waste_marketplace_jwt_secret_key_2024';

// Mock auth middleware
const mockAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error in authentication.' });
  }
};

// Mock waste routes
const createMockWasteRoutes = (express) => {
  const router = express.Router();

  // Get all waste listings
  router.get('/', (req, res) => {
    try {
      const { page = 1, limit = 10, category, city, minPrice, maxPrice } = req.query;
      
      let filteredItems = [...mockWasteItems];
      
      // Apply filters
      if (category) {
        filteredItems = filteredItems.filter(item => item.category === category);
      }
      
      if (city) {
        filteredItems = filteredItems.filter(item => 
          item.location.address.city.toLowerCase().includes(city.toLowerCase())
        );
      }
      
      if (minPrice) {
        filteredItems = filteredItems.filter(item => item.price.perUnit >= parseFloat(minPrice));
      }
      
      if (maxPrice) {
        filteredItems = filteredItems.filter(item => item.price.perUnit <= parseFloat(maxPrice));
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedItems = filteredItems.slice(startIndex, endIndex);

      res.json({
        data: {
          wasteItems: paginatedItems,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredItems.length / limit),
            totalItems: filteredItems.length,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get waste listings error:', error);
      res.status(500).json({ message: 'Server error while fetching waste listings' });
    }
  });

  // Get single waste item
  router.get('/:id', (req, res) => {
    try {
      const wasteItem = mockWasteItems.find(item => item._id === req.params.id);
      
      if (!wasteItem) {
        return res.status(404).json({ message: 'Waste item not found' });
      }

      // Increment view count
      wasteItem.views += 1;

      res.json({ wasteItem });
    } catch (error) {
      console.error('Get waste item error:', error);
      res.status(500).json({ message: 'Server error while fetching waste item' });
    }
  });

  // Create new waste listing
  router.post('/', mockAuth, (req, res) => {
    try {
      // For FormData, we need to parse it differently
      let wasteData;
      
      if (req.body.data) {
        // If data is sent as JSON string in FormData
        wasteData = JSON.parse(req.body.data);
      } else {
        // If data is sent directly as JSON
        wasteData = req.body;
      }

      const newWasteItem = {
        _id: Date.now().toString(),
        ...wasteData,
        seller: { _id: req.userId }, // Simplified seller info
        images: [], // Mock empty images for now
        status: 'active',
        views: 0,
        interestedBuyers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add default values for missing fields
      if (!newWasteItem.quantity) {
        newWasteItem.quantity = { amount: 0, unit: 'kg' };
      }
      if (!newWasteItem.price) {
        newWasteItem.price = { perUnit: 0, currency: 'USD', negotiable: true };
      }
      if (!newWasteItem.location) {
        newWasteItem.location = {
          address: { city: 'Unknown', country: 'USA' }
        };
      }
      if (!newWasteItem.availability) {
        newWasteItem.availability = {
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          frequency: 'one_time'
        };
      }
      if (!newWasteItem.quality) {
        newWasteItem.quality = {
          condition: 'fresh',
          contaminationLevel: 'low'
        };
      }
      if (!newWasteItem.logistics) {
        newWasteItem.logistics = {
          pickupAvailable: true,
          deliveryAvailable: false,
          deliveryRadius: 0,
          handlingInstructions: '',
          storageRequirements: ''
        };
      }
      if (!newWasteItem.targetMarket) {
        newWasteItem.targetMarket = 'both';
      }

      mockWasteItems.unshift(newWasteItem);

      res.status(201).json({
        message: 'Waste listing created successfully',
        wasteItem: newWasteItem
      });
    } catch (error) {
      console.error('Create waste listing error:', error);
      res.status(500).json({ message: 'Server error while creating waste listing' });
    }
  });

  // Get user's waste listings
  router.get('/my/listings', mockAuth, (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      
      let userItems = mockWasteItems.filter(item => item.seller._id === req.userId);
      
      if (status) {
        userItems = userItems.filter(item => item.status === status);
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedItems = userItems.slice(startIndex, endIndex);

      res.json({
        wasteItems: paginatedItems,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(userItems.length / limit),
          totalItems: userItems.length,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get user listings error:', error);
      res.status(500).json({ message: 'Server error while fetching user listings' });
    }
  });

  // Express interest in waste item
  router.post('/:id/interest', mockAuth, (req, res) => {
    try {
      const wasteItem = mockWasteItems.find(item => item._id === req.params.id);
      
      if (!wasteItem) {
        return res.status(404).json({ message: 'Waste item not found' });
      }

      // Check if user is not the seller
      if (wasteItem.seller._id === req.userId) {
        return res.status(400).json({ message: 'Cannot express interest in your own listing' });
      }

      // Check if already interested
      const alreadyInterested = wasteItem.interestedBuyers.some(
        buyer => buyer.user === req.userId
      );

      if (alreadyInterested) {
        return res.status(400).json({ message: 'Already expressed interest in this listing' });
      }

      // Add to interested buyers
      wasteItem.interestedBuyers.push({ user: req.userId, contactedAt: new Date() });

      res.json({ message: 'Interest expressed successfully' });
    } catch (error) {
      console.error('Express interest error:', error);
      res.status(500).json({ message: 'Server error while expressing interest' });
    }
  });

  // Delete all waste listings (for clearing mock data)
  router.delete('/all', (req, res) => {
    try {
      const count = mockWasteItems.length;
      mockWasteItems = [];
      res.json({
        message: `Successfully deleted ${count} waste listing(s)`,
        deletedCount: count
      });
    } catch (error) {
      console.error('Delete all waste listings error:', error);
      res.status(500).json({ message: 'Server error while deleting waste listings' });
    }
  });

  return router;
};

module.exports = { createMockWasteRoutes };
