const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { clearAuthCookie } = require('../utils/cookies');
const { hasValidCsrf, csrfTokenFor } = require('./csrf');

/** JWT guard: reads the HTTP-only cookie, verifies it and attaches req.user. */
module.exports = asyncHandler(async (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) throw new AppError('Authentication required', 401);
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch (err) {
    clearAuthCookie(res);
    throw new AppError(err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid session. Please log in again.', 401);
  }
  // CSRF: state-changing authenticated requests must carry the X-CSRF-Token header
  if (!hasValidCsrf(req)) throw new AppError('Invalid or missing CSRF token', 403, { code: 'CSRF_INVALID' });
  const user = await User.findById(payload.sub);
  if (!user || !user.isVerified) { clearAuthCookie(res); throw new AppError('Account not found or not verified', 401); }
  req.user = user;
  req.csrfToken = csrfTokenFor(token);
  next();
});
