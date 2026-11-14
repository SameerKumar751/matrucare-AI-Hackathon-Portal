const crypto = require('crypto');

/** Cryptographically secure 6-digit OTP. */
const generateOtp = () => String(crypto.randomInt(100000, 1000000));

/** HMAC-SHA256 of the OTP, bound to the email and server secret (never store plaintext OTPs). */
const hashOtp = (email, otp) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${email.toLowerCase()}:${otp}`).digest('hex');

/** Constant-time comparison of a submitted OTP with the stored hash. */
function verifyOtp(email, otp, storedHash) {
  const a = Buffer.from(hashOtp(email, otp), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
module.exports = { generateOtp, hashOtp, verifyOtp };
