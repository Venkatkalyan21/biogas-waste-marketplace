// Mock authentication for testing without MongoDB
const jwt = require('jsonwebtoken');

// Mock user data
const mockUsers = [
  {
    _id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: '$2a$10$rQZ8ZkGQFQJGKXJmKZqZJeFQJGKXJmKZqZJeFQJGKXJmKZqZJeFQJ', // password: password123
    phone: '+1234567890',
    role: 'buyer',
    isActive: true,
    verification: { isVerified: true }
  },
  {
    _id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: '$2a$10$rQZ8ZkGQFQJGKXJmKZqZJeFQJGKXJmKZqZJeFQJGKJmKZqZJeFQJ', // password: password123
    phone: '+0987654321',
    role: 'supplier',
    businessInfo: {
      companyName: 'Green Energy Co',
      businessType: 'biogas_plant'
    },
    isActive: true,
    verification: { isVerified: true }
  }
];

const JWT_SECRET = 'biogas_waste_marketplace_jwt_secret_key_2024';

// Mock password compare: compare plain values stored in mock user
const comparePassword = async (candidatePassword, storedPassword) => {
  // In mock mode we store plain password for newly registered users
  // Also keep backward-compat for seeded users using 'password123'
  return candidatePassword === storedPassword || candidatePassword === 'password123';
};

// Mock auth routes
const createMockAuthRoutes = (express) => {
  const router = express.Router();

  // Register
  router.post('/register', (req, res) => {
    try {
      const { firstName, lastName, email, password, phone, role } = req.body;
      
      // Check if user exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create new user
      const newUser = {
        _id: Date.now().toString(),
        firstName,
        lastName,
        email,
        password, // Store plain password in mock mode only
        phone,
        role: role || 'buyer',
        isActive: true,
        verification: { isVerified: true }
      };

      mockUsers.push(newUser);

      // Generate token
      const token = jwt.sign(
        { userId: newUser._id, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.verification.isVerified
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.verification.isVerified
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  });

  // Get current user
  router.get('/me', (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = mockUsers.find(u => u._id === decoded.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          businessInfo: user.businessInfo,
          verification: user.verification,
          isVerified: user.verification.isVerified
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Google OAuth - Mock implementation
  router.post('/google', async (req, res) => {
    try {
      const { idToken, role: requestedRole } = req.body;

      if (!idToken) {
        return res.status(400).json({ message: 'Google ID token is required' });
      }

      // In mock mode, we'll create a user from the token (simplified)
      // For real implementation, this would verify with Google
      const role = requestedRole || 'buyer';
      
      // Generate a mock user from Google token
      // In real mode, this would be extracted from verified Google token
      const mockGoogleUser = {
        _id: Date.now().toString(),
        firstName: 'Google',
        lastName: 'User',
        email: `google_${Date.now()}@example.com`,
        password: 'google_oauth_user',
        phone: '+1234567890',
        role: role,
        authProvider: 'google',
        authProviderId: 'mock_google_id',
        isActive: true,
        verification: { isVerified: true }
      };

      // Check if user exists by email pattern
      const existingUser = mockUsers.find(u => u.email === mockGoogleUser.email);
      let user = existingUser || mockGoogleUser;
      
      if (!existingUser) {
        mockUsers.push(mockGoogleUser);
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: existingUser ? 'Login successful' : 'Registration successful',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.verification.isVerified,
          profile: user.profile || {}
        }
      });
    } catch (error) {
      console.error('Google OAuth error (mock):', error);
      res.status(500).json({ message: 'Error during Google authentication' });
    }
  });

  return router;
};

module.exports = { createMockAuthRoutes };
