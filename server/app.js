const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const AppError = require('./utils/AppError');
const { apiLimiter } = require('./middleware/rateLimiters');
const { originGuard, allowedOrigins } = require('./middleware/csrf');
const { notFound, errorHandler } = require('./middleware/errorHandler');

/** Builds the Express app (no listening / DB connection) so tests can use it directly. */
function createApp({ rateLimit = true } = {}) {
  const app = express();
  app.set('trust proxy', 1); // behind Render/Railway/Vercel proxy
  app.use(helmet());

  // CORS: only configured frontend origins, with credentials for the auth cookie
  app.use(cors({
    origin: (origin, cb) => (!origin || allowedOrigins().includes(origin) ? cb(null, true) : cb(new AppError('Origin not allowed by CORS', 403, { code: 'ORIGIN_NOT_ALLOWED' }))),
    credentials: true,
  }));

  app.use(express.json({ limit: '50kb' }));
  app.use(cookieParser());
  app.use(mongoSanitize()); // strips $ and . operators from input (NoSQL injection)
  app.use('/api', originGuard); // CSRF layer 1: Origin/Referer validation for unsafe methods
  if (rateLimit) app.use('/api', apiLimiter);

  app.get('/api/health', (req, res) => res.json({ success: true, message: 'ok' }));
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/user', require('./routes/userRoutes'));
  app.use('/api/hackathon', require('./routes/hackathonRoutes'));
  app.use('/api/contact', require('./routes/contactRoutes'));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
module.exports = createApp;
