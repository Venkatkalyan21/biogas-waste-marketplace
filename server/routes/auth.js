const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/google/callback`
);

// Register user
router.post('/register', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').matches(/^[+]?[\d\s-()]+$/).withMessage('Please provide a valid phone number'),
  body('role').isIn(['supplier', 'buyer']).withMessage('Invalid user role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phone, role, businessInfo } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      businessInfo: role === 'supplier' ? businessInfo : undefined // Only suppliers will have businessInfo initially
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
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
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
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
        isVerified: user.verification.isVerified,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
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
        profile: user.profile,
        verification: user.verification,
        ratings: user.ratings,
        isVerified: user.verification.isVerified
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^[+]?[\d\s-()]+$/),
  body('profile.bio').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, profile, businessInfo } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (businessInfo && user.role === 'supplier') {
      user.businessInfo = { ...user.businessInfo, ...businessInfo };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessInfo: user.businessInfo,
        profile: user.profile,
        verification: user.verification,
        ratings: user.ratings
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Change password
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is using OAuth (can't change password)
    if (user.authProvider !== 'local') {
      return res.status(400).json({ message: 'Password change not available for OAuth accounts' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

// Google OAuth - Get authorization URL
router.get('/google/url', (req, res) => {
  try {
    const role = req.query.role || 'buyer'; // Default role
    const state = Buffer.from(JSON.stringify({ role })).toString('base64');
    
    const authUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      state: state,
      prompt: 'consent'
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Google OAuth URL error:', error);
    res.status(500).json({ message: 'Error generating Google OAuth URL' });
  }
});

// Google OAuth - Handle callback and authenticate
router.post('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Decode state to get role
    let role = 'buyer';
    try {
      if (state) {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        role = decodedState.role || 'buyer';
      }
    } catch (e) {
      console.error('Error decoding state:', e);
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Get user info from Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { authProviderId: googleId, authProvider: 'google' }
      ]
    });

    if (user) {
      // User exists - login
      if (user.authProvider !== 'google') {
        // Link Google account to existing email account
        user.authProvider = 'google';
        user.authProviderId = googleId;
        if (picture) user.profile.avatar = picture;
        await user.save();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.verification.isVerified,
          profile: user.profile
        }
      });
    } else {
      // New user - register
      // Split name if firstName/lastName not provided
      const nameParts = payload.name ? payload.name.split(' ') : [];
      const userFirstName = firstName || nameParts[0] || 'User';
      const userLastName = lastName || nameParts.slice(1).join(' ') || '';

      user = new User({
        firstName: userFirstName,
        lastName: userLastName,
        email: email.toLowerCase(),
        authProvider: 'google',
        authProviderId: googleId,
        role: role,
        profile: {
          avatar: picture || ''
        },
        verification: {
          isVerified: true, // Google emails are verified
          verificationStatus: 'approved'
        }
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.verification.isVerified,
          profile: user.profile
        }
      });
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ message: 'Error during Google authentication' });
  }
});

// Google OAuth - Direct login/register with ID token (for frontend)
router.post('/google', async (req, res) => {
  try {
    const { idToken, role: requestedRole } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Google ID token is required' });
    }

    // Check if Google Client ID is configured
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID is not set in environment variables');
      return res.status(500).json({ 
        message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in server .env file.' 
      });
    }

    // Verify the ID token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (verifyError) {
      console.error('Google token verification error:', verifyError);
      console.error('Error details:', {
        message: verifyError.message,
        code: verifyError.code,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set'
      });
      return res.status(401).json({ 
        message: 'Invalid Google token. Please try signing in again.',
        error: verifyError.message,
        details: 'Check server console for more details'
      });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { authProviderId: googleId, authProvider: 'google' }
      ]
    });

    const role = requestedRole || 'buyer'; // Default to buyer

    if (user) {
      // User exists - login
      if (user.authProvider !== 'google') {
        // Link Google account to existing email account
        user.authProvider = 'google';
        user.authProviderId = googleId;
        if (picture) user.profile.avatar = picture;
        await user.save();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.verification.isVerified,
          profile: user.profile
        }
      });
    } else {
      // New user - register
      const nameParts = payload.name ? payload.name.split(' ') : [];
      const userFirstName = firstName || nameParts[0] || 'User';
      const userLastName = lastName || nameParts.slice(1).join(' ') || '';

      user = new User({
        firstName: userFirstName,
        lastName: userLastName,
        email: email.toLowerCase(),
        authProvider: 'google',
        authProviderId: googleId,
        role: role,
        profile: {
          avatar: picture || ''
        },
        verification: {
          isVerified: true,
          verificationStatus: 'approved'
        }
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.verification.isVerified,
          profile: user.profile
        }
      });
    }
  } catch (error) {
    console.error('Google OAuth error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('Environment check:', {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });
    res.status(500).json({ 
      message: error.message || 'Error during Google authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
