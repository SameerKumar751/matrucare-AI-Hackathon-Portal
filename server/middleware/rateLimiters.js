const rateLimit = require('express-rate-limit');

const make = (windowMs, max, message) =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, skip: () => process.env.DISABLE_RATE_LIMIT === 'true', message: { success: false, message } });

const MIN = 60 * 1000;
exports.apiLimiter = make(15 * MIN, 300, 'Too many requests. Please try again later.');
exports.signupLimiter = make(60 * MIN, 20, 'Too many signup attempts. Please try again later.');
exports.loginLimiter = make(15 * MIN, 10, 'Too many login attempts. Please try again in 15 minutes.');
exports.otpVerifyLimiter = make(15 * MIN, 15, 'Too many verification attempts. Please try again later.');
exports.otpResendLimiter = make(60 * MIN, 8, 'Too many code requests. Please try again later.');
exports.contactLimiter = make(60 * MIN, 5, 'Too many messages sent. Please try again later.');
exports.confirmationResendLimiter = make(60 * MIN, 5, 'Too many confirmation email requests. Please try again later.');
