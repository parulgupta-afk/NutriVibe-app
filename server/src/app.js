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
const mealRoutes = require('./routes/mealRoutes');
const hydrationRoutes = require('./routes/hydrationRoutes');
const streakRoutes = require('./routes/streakRoutes');
const foodRoutes = require('./routes/foodRoutes');
const dietRoutes = require('./routes/dietRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
const indianRoutes = require('./routes/indianRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const recallRoutes = require('./routes/recallRoutes');
const publicV1Routes = require('./routes/publicV1Routes');
const meRoutes = require('./routes/meRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const { requestTiming } = require('./middleware/requestTiming');
const { sanitizeInput } = require('./middleware/sanitizeInput');

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

// This server returns JSON (the SPA is served by Vercel), so a locked-down CSP is
// safe. /api/docs loads Swagger UI from unpkg and gets its own relaxed policy.
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
    },
  },
}));
app.use(compression());
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// Phase 4: production logs stay compact; never log bodies
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(requestLogger);
// Default JSON limit is small; routes that accept images raise it explicitly.
const bigJson = express.json({ limit: '8mb' });
app.use((req, res, next) => (/^\/api\/(ai|meals)\//.test(req.path) ? bigJson(req, res, next) : express.json({ limit: '100kb' })(req, res, next)));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeInput);
app.use('/api', limiter);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', scanLimiter, productRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/dependents', dependentRoutes);
app.use('/api/favorites', favoritesRoutes);
// NutriVibe 2.0 — Phase 2 & 3
app.use('/api/meals', mealRoutes);
app.use('/api/hydration', hydrationRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/diet-planner', dietRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/indian', indianRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/recalls', recallRoutes);
app.use('/api/me', meRoutes);
app.use('/api', healthRoutes);
app.use('/v1', publicV1Routes);

// Phase 22: machine-readable API docs (matches real routes)
const openapi = require('./docs/openapi.json');
app.get('/api/openapi.json', (req, res) => {
  res.json(openapi);
});
app.get('/api/docs', (req, res) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'"
  );
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>NutriVibe API</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head><body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#swagger-ui' });
</script>
</body></html>`);
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;
