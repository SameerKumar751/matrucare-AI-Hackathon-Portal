const bcrypt = require('bcrypt');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { generateOtp, hashOtp, verifyOtp } = require('../utils/otp');
const { validateName, validateEmail, validatePassword, clean } = require('../utils/validators');
const emailService = require('../services/emailService');
const { otpEmail } = require('../templates/emailTemplates');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookies');
const { csrfTokenFor } = require('../middleware/csrf');

const OTP_TTL_MS = 10 * 60 * 1000;     // OTP valid for 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;  // 60 s between OTP emails
const MAX_OTP_ATTEMPTS = 5;

/** Milliseconds the user must still wait before another OTP email may be issued (0 = allowed). */
const cooldownRemainingMs = (user) =>
  user.otpLastSentAt ? Math.max(0, RESEND_COOLDOWN_MS - (Date.now() - user.otpLastSentAt.getTime())) : 0;

/** Throws 429 if the shared signup/resend cooldown is still running. */
function assertCooldown(user) {
  const wait = cooldownRemainingMs(user);
  if (wait > 0) {
    const retryAfter = Math.ceil(wait / 1000);
    throw new AppError(`Please wait ${retryAfter}s before requesting another code.`, 429, { retryAfter });
  }
}

/** Generates a fresh OTP, stores only its hash + expiry, then emails it. */
async function issueOtp(user) {
  const otp = generateOtp();
  user.otpHash = hashOtp(user.email, otp);
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  user.otpLastSentAt = new Date();
  user.otpAttempts = 0;
  await user.save();
  try {
    await emailService.sendMail({ to: user.email, ...otpEmail({ otp }) }); // throws if SMTP fails (never fakes success)
  } catch (err) {
    // Nothing was delivered, so the failed attempt must not consume the cooldown
    user.otpLastSentAt = null; await user.save();
    throw err;
  }
}

exports.signup = asyncHandler(async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body || {};
  const errors = {};
  const nameErr = validateName(fullName); if (nameErr) errors.fullName = nameErr;
  const emailErr = validateEmail(email); if (emailErr) errors.email = emailErr;
  const pwErr = validatePassword(password); if (pwErr) errors.password = pwErr;
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (Object.keys(errors).length) throw new AppError('Please fix the highlighted fields', 400, { errors });

  const mail = clean(email).toLowerCase();
  let user = await User.findOne({ email: mail });
  if (user && user.isVerified) throw new AppError('An account with this email already exists', 409, { errors: { email: 'Email already registered' } });

  if (user) assertCooldown(user); // repeated signups for an unverified account cannot bypass the resend cooldown

  const hashed = await bcrypt.hash(password, 12);
  if (user) { user.fullName = clean(fullName); user.password = hashed; } // retry of an unverified signup
  else user = new User({ fullName: clean(fullName), email: mail, password: hashed });

  await issueOtp(user);
  res.status(201).json({ success: true, message: 'Account created. A 6-digit code has been sent to your email.', data: { email: mail } });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body || {};
  if (validateEmail(email) || !/^\d{6}$/.test(String(otp || ''))) throw new AppError('Enter your email and the 6-digit code', 400);

  const user = await User.findOne({ email: clean(email).toLowerCase() }).select('+otpHash');
  if (!user || user.isVerified || !user.otpHash) throw new AppError('Invalid or expired code. Request a new one.', 400);
  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    user.otpHash = null; user.otpExpiresAt = null; await user.save();
    throw new AppError('Too many incorrect attempts. Request a new code.', 429);
  }
  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) throw new AppError('This code has expired. Request a new one.', 400);
  if (!verifyOtp(user.email, String(otp), user.otpHash)) {
    user.otpAttempts += 1; await user.save();
    throw new AppError('Incorrect code. Please try again.', 400);
  }
  // Success: verify account and invalidate OTP (single use)
  user.isVerified = true; user.otpHash = null; user.otpExpiresAt = null; user.otpAttempts = 0;
  await user.save();
  res.json({ success: true, message: 'Email verified. You can now log in.' });
});

exports.resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (validateEmail(email)) throw new AppError('Enter a valid email address', 400);
  const user = await User.findOne({ email: clean(email).toLowerCase() });
  const generic = { success: true, message: 'If an unverified account exists for this email, a new code has been sent.' };
  if (!user || user.isVerified) return res.json(generic); // do not reveal account state

  assertCooldown(user);
  await issueOtp(user);
  res.json(generic);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (validateEmail(email) || typeof password !== 'string' || !password) throw new AppError('Email and password are required', 400);
  const user = await User.findOne({ email: clean(email).toLowerCase() }).select('+password');
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new AppError('Invalid email or password', 401);
  if (!user.isVerified) throw new AppError('Please verify your email before logging in.', 403, { code: 'EMAIL_NOT_VERIFIED', email: user.email });
  const token = setAuthCookie(res, user._id);
  res.json({ success: true, message: 'Logged in', data: { user: user.toPublic(), csrfToken: csrfTokenFor(token) } });
});

exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out' });
};
