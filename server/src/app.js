const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const safetyRoutes = require('./routes/safetyRoutes');
const dependentRoutes = require('./routes/dependentRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { requestTiming } = require('./middleware/requestTiming');

const app = express();

// Phase 4: needed behind Vercel/Render/nginx so rate-limit + req.ip work
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again later.'
  }
});

const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many scan requests, please slow down a bit.'
  }
});

// Phase 4: strict limit on Gemini explain (costs money / quota)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI explanation requests. Please try again in a few minutes.'
  }
});

// Expose AI limiter to routes without circular requires
app.locals.aiLimiter = aiLimiter;

app.use(helmet({
  contentSecurityPolicy: false // SPA + camera; tighten later if you add a strict CSP
}));
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Phase 4: production logs stay compact; never log bodies
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(requestTiming);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', limiter);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', scanLimiter, productRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/dependents', dependentRoutes);
app.use('/api/favorites', favoritesRoutes);

app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoOk = mongoState === 1;
  const status = mongoOk ? 'OK' : 'DEGRADED';

  res.status(mongoOk ? 200 : 503).json({
    status,
    message: mongoOk ? 'NutriVibe API is running' : 'API up but database not connected',
    timestamp: new Date().toISOString(),
    mongo: {
      connected: mongoOk,
      readyState: mongoState
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;
