require('./_env');
const test = require('node:test');
const assert = require('node:assert/strict');
const { originGuard, csrfTokenFor, hasValidCsrf } = require('../../middleware/csrf');

const mkReq = (method, headers = {}, cookies = {}) => ({ method, cookies, get: (h) => headers[h.toLowerCase()] });
const guard = (req) => { let err; originGuard(req, {}, (e) => { err = e; }); return err; };

test('origin guard: safe methods pass', () => assert.equal(guard(mkReq('GET', { origin: 'https://evil.com' })), undefined));
test('origin guard: allowed origin passes, foreign origin blocked', () => {
  assert.equal(guard(mkReq('POST', { origin: 'http://localhost:5173' })), undefined);
  assert.equal(guard(mkReq('POST', { origin: 'https://evil.com' })).statusCode, 403);
});
test('origin guard: Referer fallback; missing headers blocked only when a cookie is present', () => {
  assert.equal(guard(mkReq('DELETE', { referer: 'http://localhost:5173/dashboard' })), undefined);
  assert.equal(guard(mkReq('DELETE', { referer: 'https://evil.com/x' })).statusCode, 403);
  assert.equal(guard(mkReq('POST', {}, { token: 'jwt' })).statusCode, 403);
  assert.equal(guard(mkReq('POST', {}, {})), undefined);
});
test('CSRF token is bound to the session cookie and required for unsafe methods', () => {
  const t = csrfTokenFor('jwt-A');
  assert.equal(hasValidCsrf(mkReq('POST', { 'x-csrf-token': t }, { token: 'jwt-A' })), true);
  assert.equal(hasValidCsrf(mkReq('POST', { 'x-csrf-token': t }, { token: 'jwt-B' })), false);
  assert.equal(hasValidCsrf(mkReq('POST', {}, { token: 'jwt-A' })), false);
  assert.equal(hasValidCsrf(mkReq('GET', {}, { token: 'jwt-A' })), true);
});
