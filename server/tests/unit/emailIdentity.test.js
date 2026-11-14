require('./_env');
const test = require('node:test');
const assert = require('node:assert/strict');
const { assertMailConfig, contactRecipient, SENDER_NAME, SENDER_ADDRESS } = require('../../services/emailService');

test('official sender identity is fixed', () => {
  assert.equal(SENDER_NAME, 'MatruCare AI');
  assert.equal(SENDER_ADDRESS, 'matrucareai@gmail.com');
  assert.equal(contactRecipient(), 'matrucareai@gmail.com');
});
test('a different EMAIL_USER is rejected instead of silently changing the sender', () => {
  assert.throws(() => assertMailConfig({ EMAIL_USER: 'someone.else@gmail.com', EMAIL_PASS: 'abcd efgh ijkl mnop' }), (e) => e.extra.code === 'EMAIL_SENDER_MISMATCH');
});
test('missing or placeholder credentials report EMAIL_NOT_CONFIGURED', () => {
  assert.throws(() => assertMailConfig({}), (e) => e.extra.code === 'EMAIL_NOT_CONFIGURED');
  assert.throws(() => assertMailConfig({ EMAIL_USER: 'matrucareai@gmail.com', EMAIL_PASS: 'YOUR_GMAIL_APP_PASSWORD' }), (e) => e.extra.code === 'EMAIL_NOT_CONFIGURED');
});
test('correct config passes; app password spaces are stripped; case-insensitive user', () => {
  assert.deepEqual(assertMailConfig({ EMAIL_USER: 'MatruCareAI@Gmail.com', EMAIL_PASS: 'abcd efgh ijkl mnop' }), { user: 'matrucareai@gmail.com', pass: 'abcdefghijklmnop' });
});
