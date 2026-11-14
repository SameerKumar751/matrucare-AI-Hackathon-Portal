const jwt = require('jsonwebtoken');

const isProd = () => process.env.NODE_ENV === 'production';
const cookieOptions = () => ({
  httpOnly: true,                       // not readable by JS => XSS-safe
  secure: isProd(),                     // HTTPS only in production
  sameSite: process.env.COOKIE_SAMESITE || (isProd() ? 'none' : 'lax'),
  path: '/',
});

/** Signs a JWT, stores it in an HTTP-only cookie and returns it (needed to derive the CSRF token). */
function setAuthCookie(res, userId) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const token = jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn });
  res.cookie('token', token, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
  return token;
}
const clearAuthCookie = (res) => res.clearCookie('token', cookieOptions());

module.exports = { setAuthCookie, clearAuthCookie };
