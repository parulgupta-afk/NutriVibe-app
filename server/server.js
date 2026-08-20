require('dotenv').config();
const { validateEnv, envSummary } = require('./src/config/validateEnv');
const connectDB = require('./src/config/database');

// Phase 4: validate before loading routes / listening
const envInfo = validateEnv();

const app = require('./src/app');
const PORT = process.env.PORT || 5000;

const summary = envSummary();
console.log('Environment:');
console.log(`  NODE_ENV: ${summary.NODE_ENV}`);
console.log(`  PORT: ${summary.PORT}`);
console.log(`  MONGO_URI: ${summary.MONGO_URI}`);
console.log(`  JWT_SECRET: ${summary.JWT_SECRET}`);
console.log(`  CLIENT_URL: ${summary.CLIENT_URL}`);
console.log(`  GEMINI_API_KEY: ${summary.GEMINI_API_KEY}`);
console.log(`  GOOGLE_CLIENT_ID: ${summary.GOOGLE_CLIENT_ID}`);
console.log('');

connectDB();

const server = app.listen(PORT, () => {
  console.log('Server started');
  console.log(`  Listening on http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  if (envInfo.isProd) {
    console.log('  Mode: production');
  } else {
    console.log('  Mode: development');
    console.log('  Demo barcodes: 1234567890123, 9876543210987, 4567890123456');
  }
});

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  // Force exit if hang
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err && err.message ? err.message : err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.message ? err.message : err);
  server.close(() => process.exit(1));
});
