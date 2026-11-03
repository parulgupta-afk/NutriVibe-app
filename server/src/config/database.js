const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows / router DNS resolvers failing on MongoDB SRV records (querySrv ENOTFOUND)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if setting DNS servers is not permitted in this runtime environment
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    // Remove deprecated options - they are no longer needed in Mongoose 7+
    const conn = await mongoose.connect(uri);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection state: ${mongoose.connection.readyState}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('💡 Make sure MongoDB is running and MONGO_URI is correct');
    process.exit(1);
  }
};

module.exports = connectDB;