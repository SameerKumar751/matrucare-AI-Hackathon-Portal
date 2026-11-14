require('./_env');
const test = require('node:test');
const assert = require('node:assert/strict');
const { generateOtp, hashOtp, verifyOtp } = require('../../utils/otp');

test('generateOtp returns a 6-digit numeric string', () => {
  for (let i = 0; i < 200; i += 1) assert.match(generateOtp(), /^\d{6}$/);
});
test('OTP is stored as a hash, never plaintext, and verifies correctly', () => {
  const h = hashOtp('a@b.com', '123456');
  assert.notEqual(h, '123456');
  assert.match(h, /^[0-9a-f]{64}$/);
  assert.equal(verifyOtp('a@b.com', '123456', h), true);
  assert.equal(verifyOtp('a@b.com', '654321', h), false);
  assert.equal(verifyOtp('other@b.com', '123456', h), false); // bound to the email
});
