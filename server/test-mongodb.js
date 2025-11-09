require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('📝 Connection string:', process.env.MONGODB_URI ? 'Set ✓' : 'Not set ✗');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || undefined
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.length > 0 ? collections.map(c => c.name).join(', ') : 'No collections yet');
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Wrong username or password');
      console.error('   - Database user not created in MongoDB Atlas');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timed out')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Network Access not configured (allow IP 0.0.0.0/0)');
      console.error('   - Wrong cluster URL');
      console.error('   - Internet connection issue');
    }
    
    process.exit(1);
  }
}

testConnection();

