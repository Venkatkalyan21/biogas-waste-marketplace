const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (available in all modes)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Decide between Mock Mode and Real Mode
const useMock = (process.env.USE_MOCK || '').toLowerCase() === 'true' || !process.env.MONGODB_URI;

if (useMock) {
  const { createMockAuthRoutes } = require('./mockAuth');
  const { createMockWasteRoutes } = require('./mockWaste');

  app.use('/api/auth', createMockAuthRoutes(express));
  app.use('/api/waste', createMockWasteRoutes(express));

  app.use('/api/orders', (req, res) => {
    res.json({ message: 'Orders API - Mock Mode', data: [] });
  });
  app.use('/api/payments', (req, res) => {
    res.json({ message: 'Payments API - Mock Mode', data: [] });
  });
  app.use('/api/admin', (req, res) => {
    res.json({ message: 'Admin API - Mock Mode', data: [] });
  });
  app.use('/api/users', (req, res) => {
    res.json({ message: 'Users API - Mock Mode', data: [] });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (Mock Mode - No MongoDB)`);
  });
} else {
  // Real Mode: connect to MongoDB and mount real routes
  const startServer = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || undefined
      });
      console.log('Connected to MongoDB');

      // Mount real routes
      app.use('/api/auth', require('./routes/auth'));
      app.use('/api/waste', require('./routes/waste'));
      app.use('/api/orders', require('./routes/orders'));
      app.use('/api/payments', require('./routes/payments'));
      app.use('/api/admin', require('./routes/admin'));
      app.use('/api/users', require('./routes/users'));
      app.use('/api/messages', require('./routes/messages'));
      app.use('/api/watchlist', require('./routes/watchlist'));
      app.use('/api/saved-searches', require('./routes/savedSearches'));
      app.use('/api/bids', require('./routes/bids'));
      app.use('/api/standing-orders', require('./routes/standingOrders'));

      // Error handling middleware
      app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
          message: 'Something went wrong!',
          error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
      });

      // 404 handler
      app.use('*', (req, res) => {
        res.status(404).json({ message: 'Route not found' });
      });

      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}
