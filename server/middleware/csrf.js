const crypto = require('crypto');
const AppError = require('../utils/AppError');

const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Allowed browser origins, from CLIENT_URL (comma separated). */
const allowedOrigins = (env = process.env) =>
  (env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);

/**
 * Origin validation for state-changing requests. Browsers always send Origin (or at least Referer) on
 * cross-site POST/PUT/DELETE, so a forged request from another site is rejected here. This works with the
 * Vercel /api proxy because the browser's Origin stays the frontend origin.
 * Requests with neither header cannot come from a browser form/fetch; they carry no ambient cookie risk and are
 * only accepted when no auth cookie is present.
 */
function originGuard(req, res, next) {
  if (!UNSAFE.has(req.method)) return next();
  const allowed = allowedOrigins();
  let origin = req.get('origin');
  if (!origin && req.get('referer')) {
    try { origin = new URL(req.get('referer')).origin; } catch { origin = 'invalid'; }
  }
  if (origin) {
    if (!allowed.includes(origin.replace(/\/$/, ''))) return next(new AppError('Request origin not allowed', 403, { code: 'ORIGIN_NOT_ALLOWED' }));
    return next();
  }
  if (req.cookies && req.cookies.token) return next(new AppError('Missing Origin header', 403, { code: 'ORIGIN_REQUIRED' }));
  return next();
}

/**
 * Stateless CSRF token bound to the session JWT: HMAC(JWT_SECRET, jwt). The SPA receives it in the JSON body of
 * login and /user/me (which a cross-site attacker cannot read thanks to CORS) and sends it as X-CSRF-Token.
 */
const csrfTokenFor = (jwtValue) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(`csrf:${jwtValue}`).digest('hex');

/** True if the request is safe (GET/HEAD/OPTIONS) or carries a valid CSRF header for its session cookie. */
function hasValidCsrf(req) {
  if (!UNSAFE.has(req.method)) return true;
  const sent = req.get('x-csrf-token') || '';
  const expected = csrfTokenFor((req.cookies && req.cookies.token) || '');
  const a = Buffer.from(sent);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { originGuard, csrfTokenFor, hasValidCsrf, allowedOrigins };
