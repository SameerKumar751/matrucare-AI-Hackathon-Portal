require('./_env');
const test = require('node:test');
const assert = require('node:assert/strict');
const AppError = require('../../utils/AppError');
const { errorHandler } = require('../../middleware/errorHandler');

const call = (err) => { const out = {}; errorHandler(err, {}, { status(c) { out.status = c; return this; }, json(b) { out.body = b; } }, () => {}); return out; };

test('unknown errors never leak internals', () => {
  const origLog = console.error; console.error = () => {};
  const r = call(new Error('connect ECONNREFUSED mongodb://user:SuperSecret@host'));
  console.error = origLog;
  assert.equal(r.status, 500);
  assert.equal(r.body.message, 'Internal server error');
  assert.ok(!JSON.stringify(r.body).includes('SuperSecret'));
});
test('AppError: only whitelisted extra keys are exposed; shape is consistent', () => {
  const r = call(new AppError('nope', 403, { code: 'X', errors: { a: 'b' }, secret: 'hidden', stack: 's' }));
  assert.deepEqual(r.body, { success: false, message: 'nope', code: 'X', errors: { a: 'b' } });
  assert.equal(r.status, 403);
});
test('duplicate key, cast and parse errors map to proper statuses', () => {
  assert.equal(call(Object.assign(new Error('dup'), { code: 11000 })).status, 409);
  assert.equal(call(Object.assign(new Error('c'), { name: 'CastError' })).status, 400);
  assert.equal(call(Object.assign(new Error('p'), { type: 'entity.parse.failed' })).status, 400);
});
