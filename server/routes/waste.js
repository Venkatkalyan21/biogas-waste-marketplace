const express = require('express');
const { body, validationResult } = require('express-validator');
const Waste = require('../models/Waste');
const User = require('../models/User'); // Import User model for populate to work
const { auth, supplierAuth } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure Cloudinary (if credentials are provided)
if (process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all waste listings with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      subcategory,
      city,
      minPrice,
      maxPrice,
      wasteType,
      condition,
      targetMarket,
      search,
      minQuantity,
      maxMoisture,
      minMoisture,
      hasCertification,
      latitude,
      longitude,
      radiusKm,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };
    
    // Text search across title, description, and subcategory
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { subcategory: new RegExp(search, 'i') }
      ];
    }
    
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (wasteType) filter.wasteType = wasteType;
    if (condition) filter['quality.condition'] = condition;
    if (targetMarket) filter.targetMarket = { $in: [targetMarket, 'both'] };
    
    // Quantity filter
    if (minQuantity) {
      filter['quantity.amount'] = { $gte: parseFloat(minQuantity) };
    }
    
    // Moisture content filters
    if (minMoisture !== undefined || maxMoisture !== undefined) {
      filter['quality.moistureContent'] = {};
      if (minMoisture !== undefined) filter['quality.moistureContent'].$gte = parseFloat(minMoisture);
      if (maxMoisture !== undefined) filter['quality.moistureContent'].$lte = parseFloat(maxMoisture);
    }
    
    // Certification filter
    if (hasCertification === 'true') {
      filter.certifications = { $exists: true, $ne: [] };
    }
    
    if (city) {
      filter['location.address.city'] = new RegExp(city, 'i');
    }
    
    if (minPrice || maxPrice) {
      filter['price.perUnit'] = {};
      if (minPrice) filter['price.perUnit'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['price.perUnit'].$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sort = {};
    if (sortBy === 'distance' && latitude && longitude) {
      sort.distance = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const skip = (page - 1) * limit;

    // Geospatial radius search
    let wasteItems, total;
    if (latitude && longitude && radiusKm) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const radius = parseFloat(radiusKm) * 1000; // Convert km to meters
      
      // Use aggregation for geospatial search (requires geoLocation field with 2dsphere index)
      const geoPipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lon, lat] },
            distanceField: 'distance',
            maxDistance: radius,
            spherical: true,
            query: { ...filter, 'location.geoLocation': { $exists: true } }
          }
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'seller',
            foreignField: '_id',
            as: 'seller'
          }
        },
        { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
        { $project: { 'seller.password': 0 } }
      ];
      
      wasteItems = await Waste.aggregate(geoPipeline);
      
      const countPipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lon, lat] },
            distanceField: 'distance',
            maxDistance: radius,
            spherical: true,
            query: { ...filter, 'location.geoLocation': { $exists: true } }
          }
        },
        { $count: 'total' }
      ];
      
      const countResult = await Waste.aggregate(countPipeline);
      total = countResult[0]?.total || 0;
    } else {
      wasteItems = await Waste.find(filter)
        .populate('seller', 'firstName lastName businessInfo ratings')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
      
      total = await Waste.countDocuments(filter);
    }

    res.json({
      data: {
        wasteItems,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
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
router.get('/:id', async (req, res) => {
  try {
    const wasteItem = await Waste.findById(req.params.id)
      .populate('seller', 'firstName lastName businessInfo ratings phone email');

    if (!wasteItem) {
      return res.status(404).json({ message: 'Waste item not found' });
    }

    // Debug: Log what's being retrieved
    console.log('=== GET WASTE ITEM ===');
    console.log('ID:', wasteItem._id);
    console.log('Quantity:', wasteItem.quantity);
    console.log('Price:', wasteItem.price);
    console.log('Images count:', wasteItem.images?.length || 0);
    console.log('======================');

    // Increment view count
    wasteItem.views += 1;
    await wasteItem.save();

    res.json({ wasteItem });
  } catch (error) {
    console.error('Get waste item error:', error);
    res.status(500).json({ message: 'Server error while fetching waste item' });
  }
});

// Create new waste listing
router.post('/', supplierAuth, upload.array('images', 5), async (req, res) => {
  try {
    // Parse the JSON data from FormData
    let wasteData;
    try {
      const rawData = req.body.data;
      console.log('=== SERVER: RAW REQUEST DATA ===');
      console.log('Type of req.body.data:', typeof rawData);
      console.log('Raw req.body.data:', rawData);
      console.log('Raw req.body keys:', Object.keys(req.body));
      
      if (typeof rawData === 'string') {
        wasteData = JSON.parse(rawData);
      } else if (typeof rawData === 'object') {
        wasteData = rawData;
      } else {
        wasteData = {};
      }
      
      console.log('Parsed wasteData:', JSON.stringify(wasteData, null, 2));
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Error stack:', parseError.stack);
      return res.status(400).json({ message: 'Invalid data format. Please check your form submission.' });
    }

    // Debug: Log received data
    console.log('=== SERVER: PARSED DATA ===');
    console.log('Quantity:', wasteData.quantity);
    console.log('Price:', wasteData.price);
    console.log('Title:', wasteData.title);
    console.log('Location:', wasteData.location);
    console.log('===========================');

    // Ensure numeric fields are properly converted
    // Check if quantity exists and has amount
    if (!wasteData.quantity) {
      console.error('❌ Quantity object is missing!');
      wasteData.quantity = { amount: 0, unit: 'kg' };
    } else if (wasteData.quantity.amount === undefined || wasteData.quantity.amount === null || wasteData.quantity.amount === '') {
      console.error('❌ Quantity amount is missing!', wasteData.quantity);
      wasteData.quantity.amount = 0;
    } else {
      wasteData.quantity.amount = parseFloat(wasteData.quantity.amount);
      if (isNaN(wasteData.quantity.amount)) {
        console.error('❌ Quantity amount is NaN!', wasteData.quantity.amount);
        wasteData.quantity.amount = 0;
      }
    }
    
    // Check if price exists and has perUnit
    if (!wasteData.price) {
      console.error('❌ Price object is missing!');
      wasteData.price = { perUnit: 0, currency: 'INR', negotiable: true };
    } else if (wasteData.price.perUnit === undefined || wasteData.price.perUnit === null || wasteData.price.perUnit === '') {
      console.error('❌ Price perUnit is missing!', wasteData.price);
      wasteData.price.perUnit = 0;
    } else {
      wasteData.price.perUnit = parseFloat(wasteData.price.perUnit);
      if (isNaN(wasteData.price.perUnit)) {
        console.error('❌ Price perUnit is NaN!', wasteData.price.perUnit);
        wasteData.price.perUnit = 0;
      }
    }
    
    // Ensure currency is set
    if (!wasteData.price.currency) {
      wasteData.price.currency = 'INR';
    }
    if (wasteData.quality?.moistureContent) {
      wasteData.quality.moistureContent = parseFloat(wasteData.quality.moistureContent);
      if (isNaN(wasteData.quality.moistureContent)) {
        wasteData.quality.moistureContent = undefined;
      }
    }
    if (wasteData.location?.coordinates?.latitude) {
      wasteData.location.coordinates.latitude = parseFloat(wasteData.location.coordinates.latitude);
    }
    if (wasteData.location?.coordinates?.longitude) {
      wasteData.location.coordinates.longitude = parseFloat(wasteData.location.coordinates.longitude);
    }

    // Manual validation
    const errors = [];
    if (!wasteData.title || wasteData.title.trim().length < 5 || wasteData.title.trim().length > 100) {
      errors.push({ field: 'title', message: 'Title must be 5-100 characters' });
    }
    if (!wasteData.description || wasteData.description.trim().length < 10 || wasteData.description.trim().length > 1000) {
      errors.push({ field: 'description', message: 'Description must be 10-1000 characters' });
    }
    if (!wasteData.category || !['fruits', 'vegetables', 'mixed', 'other'].includes(wasteData.category)) {
      errors.push({ field: 'category', message: 'Invalid category' });
    }
    if (!wasteData.subcategory || wasteData.subcategory.trim().length === 0) {
      errors.push({ field: 'subcategory', message: 'Subcategory is required' });
    }
    if (!wasteData.wasteType || !['organic_waste', 'peels', 'seeds', 'stems', 'leaves', 'spoiled_produce', 'excess_inventory', 'processing_byproducts'].includes(wasteData.wasteType)) {
      errors.push({ field: 'wasteType', message: 'Invalid waste type' });
    }
    if (!wasteData.quantity || !wasteData.quantity.amount || wasteData.quantity.amount <= 0) {
      errors.push({ field: 'quantity.amount', message: 'Quantity must be greater than 0' });
    }
    if (!wasteData.quantity || !wasteData.quantity.unit || !['kg', 'tons', 'pounds', 'cubic_meters'].includes(wasteData.quantity.unit)) {
      errors.push({ field: 'quantity.unit', message: 'Invalid unit' });
    }
    if (!wasteData.price || !wasteData.price.perUnit || wasteData.price.perUnit <= 0) {
      errors.push({ field: 'price.perUnit', message: 'Price must be greater than 0' });
    }
    if (!wasteData.location || !wasteData.location.address || !wasteData.location.address.city || wasteData.location.address.city.trim().length === 0) {
      errors.push({ field: 'location.address.city', message: 'City is required' });
    }
    if (!wasteData.availability || !wasteData.availability.startDate) {
      errors.push({ field: 'availability.startDate', message: 'Start date is required' });
    }
    if (!wasteData.availability || !wasteData.availability.endDate) {
      errors.push({ field: 'availability.endDate', message: 'End date is required' });
    }
    if (!wasteData.quality || !wasteData.quality.condition || !['fresh', 'slightly_damaged', 'spoiled', 'processed'].includes(wasteData.quality.condition)) {
      errors.push({ field: 'quality.condition', message: 'Invalid condition' });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    // Upload images to Cloudinary (if configured) or store as base64
    const images = [];
    if (req.files && req.files.length > 0) {
      const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                     process.env.CLOUDINARY_API_KEY && 
                                     process.env.CLOUDINARY_API_SECRET;
      
      for (const file of req.files) {
        try {
          if (isCloudinaryConfigured) {
            // Upload to Cloudinary
            const stream = require('stream');
            const bufferStream = new stream.PassThrough();
            bufferStream.end(file.buffer);
            
            const uploadResult = await new Promise((resolve, reject) => {
              bufferStream.pipe(cloudinary.uploader.upload_stream(
                { resource_type: 'image', folder: 'waste-marketplace' },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ));
            });
            
            images.push({
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
              caption: file.originalname
            });
          } else {
            // Fallback: Store as base64 data URL (for development/testing)
            const base64 = file.buffer.toString('base64');
            const dataUrl = `data:${file.mimetype};base64,${base64}`;
            images.push({
              url: dataUrl,
              publicId: null,
              caption: file.originalname
            });
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue even if image upload fails - listing can be created without images
        }
      }
    }

    // Ensure required fields are set before creating the model
    const wasteItemData = {
      ...wasteData,
      seller: req.userId,
      images: images.length > 0 ? images : [],
      // Auto-approve listings (set to 'active' immediately)
      // Change to 'pending' if you want admin approval required
      status: 'active', // Changed from 'pending' to 'active' for immediate visibility
      // Explicitly set quantity and price to ensure they're saved
      quantity: {
        amount: wasteData.quantity?.amount || 0,
        unit: wasteData.quantity?.unit || 'kg'
      },
      price: {
        perUnit: wasteData.price?.perUnit || 0,
        currency: wasteData.price?.currency || 'INR',
        negotiable: wasteData.price?.negotiable !== undefined ? wasteData.price.negotiable : true
      }
    };

    console.log('=== SERVER: WASTE ITEM DATA BEFORE SAVE ===');
    console.log('Quantity:', wasteItemData.quantity);
    console.log('Price:', wasteItemData.price);
    console.log('Images count:', wasteItemData.images.length);
    console.log('===========================================');

    const wasteItem = new Waste(wasteItemData);

    // Debug: Log before saving
    console.log('Waste item before save:', {
      quantity: wasteItem.quantity,
      price: wasteItem.price,
      status: wasteItem.status,
      imagesCount: wasteItem.images?.length || 0
    });

    await wasteItem.save();
    
    // Debug: Log after saving
    console.log('✅ Waste item after save:', {
      _id: wasteItem._id,
      quantity: wasteItem.quantity,
      price: wasteItem.price,
      status: wasteItem.status,
      imagesCount: wasteItem.images?.length || 0
    });
    await wasteItem.populate('seller', 'firstName lastName businessInfo ratings');

    res.status(201).json({
      message: 'Waste listing created successfully',
      wasteItem
    });
  } catch (error) {
    console.error('Create waste listing error:', error);
    
    // Return more detailed error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validationErrors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: `Invalid ${error.path}: ${error.value}` 
      });
    }
    
    res.status(500).json({ 
      message: error.message || 'Server error while creating waste listing' 
    });
  }
});

// Update waste listing
router.put('/:id', supplierAuth, upload.array('images', 5), async (req, res) => {
  try {
    const wasteItem = await Waste.findById(req.params.id);
    
    if (!wasteItem) {
      return res.status(404).json({ message: 'Waste item not found' });
    }

    // Check if user is the seller
    if (wasteItem.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const updateData = JSON.parse(req.body.data);
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        try {
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = require('stream');
            const bufferStream = new stream.PassThrough();
            bufferStream.end(file.buffer);
            
            bufferStream.pipe(cloudinary.uploader.upload_stream(
              { resource_type: 'image', folder: 'waste-marketplace' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ));
          });
          
          newImages.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            caption: file.originalname
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
      
      updateData.images = [...(wasteItem.images || []), ...newImages];
    }

    Object.assign(wasteItem, updateData);
    await wasteItem.save();
    await wasteItem.populate('seller', 'firstName lastName businessInfo ratings');

    res.json({
      message: 'Waste listing updated successfully',
      wasteItem
    });
  } catch (error) {
    console.error('Update waste listing error:', error);
    res.status(500).json({ message: 'Server error while updating waste listing' });
  }
});

// Delete waste listing
router.delete('/:id', supplierAuth, async (req, res) => {
  try {
    const wasteItem = await Waste.findById(req.params.id);
    
    if (!wasteItem) {
      return res.status(404).json({ message: 'Waste item not found' });
    }

    // Check if user is the seller
    if (wasteItem.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    // Delete images from Cloudinary
    if (wasteItem.images && wasteItem.images.length > 0) {
      for (const image of wasteItem.images) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      }
    }

    await Waste.findByIdAndDelete(req.params.id);

    res.json({ message: 'Waste listing deleted successfully' });
  } catch (error) {
    console.error('Delete waste listing error:', error);
    res.status(500).json({ message: 'Server error while deleting waste listing' });
  }
});

// Get user's waste listings
router.get('/my/listings', supplierAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { seller: req.userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const wasteItems = await Waste.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Waste.countDocuments(filter);

    res.json({
      wasteItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ message: 'Server error while fetching user listings' });
  }
});

// Express interest in waste item
router.post('/:id/interest', auth, async (req, res) => { // Any authenticated user can express interest
  try {
    const wasteItem = await Waste.findById(req.params.id);
    
    if (!wasteItem) {
      return res.status(404).json({ message: 'Waste item not found' });
    }

    // Check if user is not the seller
    if (wasteItem.seller.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot express interest in your own listing' });
    }

    // Check if already interested
    const alreadyInterested = wasteItem.interestedBuyers.some(
      buyer => buyer.user.toString() === req.userId
    );

    if (alreadyInterested) {
      return res.status(400).json({ message: 'Already expressed interest in this listing' });
    }

    // Add to interested buyers
    wasteItem.interestedBuyers.push({ user: req.userId });
    await wasteItem.save();

    res.json({ message: 'Interest expressed successfully' });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ message: 'Server error while expressing interest' });
  }
});

module.exports = router;
