const router = require('express').Router();
const c = require('../controllers/authController');
const l = require('../middleware/rateLimiters');

router.post('/signup', l.signupLimiter, c.signup);
router.post('/verify-otp', l.otpVerifyLimiter, c.verifyOtp);
router.post('/resend-otp', l.otpResendLimiter, c.resendOtp);
router.post('/login', l.loginLimiter, c.login);
router.post('/logout', c.logout);
module.exports = router;
