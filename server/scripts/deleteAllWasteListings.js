/**
 * Script to delete all waste listings from the database
 * 
 * Usage: node server/scripts/deleteAllWasteListings.js
 * 
 * WARNING: This will permanently delete ALL waste listings!
 */

const mongoose = require('mongoose');
const Waste = require('../models/Waste');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/waste-marketplace';

async function deleteAllWasteListings() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count existing listings
    const count = await Waste.countDocuments();
    console.log(`\nFound ${count} waste listing(s) in the database`);

    if (count === 0) {
      console.log('No waste listings to delete. Exiting...');
      await mongoose.disconnect();
      return;
    }

    // Delete all waste listings
    console.log('\nDeleting all waste listings...');
    const result = await Waste.deleteMany({});
    
    console.log(`\n✅ Successfully deleted ${result.deletedCount} waste listing(s)`);
    console.log(`Previous count: ${count}`);
    console.log(`Deleted count: ${result.deletedCount}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting waste listings:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
deleteAllWasteListings();

