require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.log('💡 Please create a .env file with these variables');
  process.exit(1);
}

console.log('📋 Environment Configuration:');
console.log(`  PORT: ${PORT}`);
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`  MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Missing'}`);
console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log('');

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 Server started successfully!');
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log('  GET  /api/health              - Health check');
  console.log('  POST /api/auth/register       - Register a new user');
  console.log('  POST /api/auth/login          - Login user');
  console.log('  GET  /api/auth/me             - Get current user');
  console.log('  PUT  /api/auth/preferences    - Update user preferences');
  console.log('  GET  /api/products/barcode/:barcode - Get product by barcode');
  console.log('  GET  /api/products/:id        - Get product details');
  console.log('  GET  /api/products/:id/alternatives - Get alternatives');
  console.log('  POST /api/tracking/log        - Log a product');
  console.log('  GET  /api/tracking/daily      - Get daily tracking');
  console.log('  GET  /api/tracking/history    - Get tracking history');
  console.log('  GET  /api/safety/product/:id  - Get safety report');
  console.log('');
  console.log('🔑 Demo barcodes to try:');
  console.log('  1234567890123 - Organic Almond Milk');
  console.log('  9876543210987 - Wheat Bread Whole Grain');
  console.log('  4567890123456 - Premium Greek Yogurt');
  console.log('');
  console.log('💡 Press Ctrl+C to stop the server');
});

// Handle server shutdown gracefully
const gracefulShutdown = () => {
  console.log('\n🔄 Received shutdown signal, closing server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => process.exit(1));
});