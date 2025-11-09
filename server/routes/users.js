const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for document uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'), false);
    }
  }
});

const router = express.Router();

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('businessInfo');

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
        ratings: user.ratings,
        isVerified: user.verification.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
});

// Search users (for B2B connections)
router.get('/search/business', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      businessType, 
      city, 
      minRating 
    } = req.query;

    const filter = { 
      role: { $in: ['supplier', 'buyer'] },
      isActive: true,
      'verification.isVerified': true
    };

    if (businessType) {
      filter['businessInfo.businessType'] = businessType;
    }

    if (city) {
      filter['businessInfo.address.city'] = new RegExp(city, 'i');
    }

    if (minRating) {
      filter['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password -verification.documents')
      .sort({ 'ratings.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search business users error:', error);
    res.status(500).json({ message: 'Server error while searching business users' });
  }
});

// Update user rating
router.put('/:id/rating', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update average rating
    const currentTotal = user.ratings.average * user.ratings.count;
    user.ratings.count += 1;
    user.ratings.average = (currentTotal + rating) / user.ratings.count;

    await user.save();

    res.json({
      message: 'Rating updated successfully',
      newRating: user.ratings.average,
      totalRatings: user.ratings.count
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ message: 'Server error while updating rating' });
  }
});

// Upload KYC document
router.post('/kyc/upload', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Document file is required' });
    }

    const { documentType, businessRegistrationNumber, taxId } = req.body;
    
    if (!documentType || !['business_registration', 'tax_id', 'identity_card', 'address_proof', 'other'].includes(documentType)) {
      return res.status(400).json({ message: 'Valid document type is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      
      bufferStream.pipe(cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'kyc-documents' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ));
    });

    // Add document to user verification
    user.verification.documents.push({
      type: documentType,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });

    // Update verification status to pending
    user.verification.verificationStatus = 'pending';
    
    // Store business details if provided
    if (businessRegistrationNumber) {
      user.verification.businessRegistrationNumber = businessRegistrationNumber;
    }
    if (taxId) {
      user.verification.taxId = taxId;
    }

    await user.save();

    res.json({
      message: 'Document uploaded successfully',
      verification: user.verification
    });
  } catch (error) {
    console.error('Upload KYC document error:', error);
    res.status(500).json({ message: 'Server error while uploading document' });
  }
});

module.exports = router;
