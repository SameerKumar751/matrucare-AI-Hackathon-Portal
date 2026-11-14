// Integration tests: real Express app + in-memory MongoDB (mongodb-memory-server) + stubbed email transport.
// Requires: npm install (supertest, mongodb-memory-server). Set MONGO_URI_TEST to use an existing database instead.
process.env.JWT_SECRET = 'test_secret_test_secret_test_secret';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';
process.env.DISABLE_RATE_LIMIT = 'true';

const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const createApp = require('../../app');
const User = require('../../models/User');
const Registration = require('../../models/Registration');
const emailService = require('../../services/emailService');
const AppError = require('../../utils/AppError');
const options = require('../../utils/options');

const ORIGIN = 'http://localhost:5173';
let mongod; let app;
let sent = [];            // captured emails
let failMail = false;     // toggle to simulate SMTP failure
emailService.sendMail = async (m) => {
  if (failMail) throw new AppError('Gmail rejected the credentials.', 502, { code: 'EMAIL_SEND_FAILED' });
  sent.push(m); return { messageId: 'test' };
};
const lastOtp = () => sent[sent.length - 1].text.match(/\b(\d{6})\b/)[1];

const post = (agent, url, body, csrf) => {
  const r = agent.post(url).set('Origin', ORIGIN);
  return (csrf ? r.set('X-CSRF-Token', csrf) : r).send(body);
};
const password = 'Str0ngPass';

/** Creates a verified, logged-in user; returns { agent, csrf, email }. */
async function makeUser(name, email) {
  const agent = request.agent(app);
  assert.equal((await post(agent, '/api/auth/signup', { fullName: name, email, password, confirmPassword: password })).status, 201);
  assert.equal((await post(agent, '/api/auth/verify-otp', { email, otp: lastOtp() })).status, 200);
  const login = await post(agent, '/api/auth/login', { email, password });
  assert.equal(login.status, 200);
  return { agent, csrf: login.body.data.csrfToken, email };
}

const regBody = (over = {}) => ({
  fullName: 'Asha Verma', mobileNumber: '9876543210', collegeName: options.colleges[0], course: 'B.Tech', branch: 'CSE',
  yearOfStudy: '3rd Year', domain: 'AI/ML', projectName: 'Smart Care', pptLink: 'https://drive.google.com/file/d/abc/view',
  prototypeLink: 'https://github.com/org/repo', demoVideoLink: '', teamSize: 1, teamMembers: [], ...over,
});

test.before(async () => {
  if (process.env.MONGO_URI_TEST) await mongoose.connect(process.env.MONGO_URI_TEST);
  else {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }
  await Promise.all([User.init(), Registration.init()]);
  app = createApp({ rateLimit: false });
});
test.after(async () => { await mongoose.disconnect(); if (mongod) await mongod.stop(); });
test.beforeEach(async () => { sent = []; failMail = false; await Promise.all([User.deleteMany({}), Registration.deleteMany({})]); });

test('signup validation rejects bad input with field errors', async () => {
  const r = await post(request(app), '/api/auth/signup', { fullName: 'A1', email: 'bad', password: 'weak', confirmPassword: 'x' });
  assert.equal(r.status, 400);
  assert.ok(r.body.errors.fullName && r.body.errors.email && r.body.errors.password && r.body.errors.confirmPassword);
  assert.equal(sent.length, 0);
});

test('signup sends OTP, stores only hashes, and never returns secrets', async () => {
  const r = await post(request(app), '/api/auth/signup', { fullName: 'Asha Verma', email: 'a@x.com', password, confirmPassword: password });
  assert.equal(r.status, 201);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'a@x.com');
  const otp = lastOtp();
  const u = await User.findOne({ email: 'a@x.com' }).select('+password +otpHash');
  assert.notEqual(u.password, password);
  assert.notEqual(u.otpHash, otp);
  assert.ok(!JSON.stringify(r.body).includes(otp) && !JSON.stringify(r.body).includes(u.otpHash));
});

test('OTP verification: wrong code, success, and single use', async () => {
  const agent = request.agent(app);
  await post(agent, '/api/auth/signup', { fullName: 'Asha Verma', email: 'a@x.com', password, confirmPassword: password });
  const otp = lastOtp();
  const wrong = otp === '000000' ? '111111' : '000000';
  assert.equal((await post(agent, '/api/auth/verify-otp', { email: 'a@x.com', otp: wrong })).status, 400);
  assert.equal((await post(agent, '/api/auth/verify-otp', { email: 'a@x.com', otp })).status, 200);
  assert.equal((await User.findOne({ email: 'a@x.com' })).isVerified, true);
  // single use: the same OTP can never be used again
  assert.equal((await post(agent, '/api/auth/verify-otp', { email: 'a@x.com', otp })).status, 400);
  assert.equal((await User.findOne({ email: 'a@x.com' }).select('+otpHash')).otpHash, null);
});

test('OTP expires after 10 minutes', async () => {
  await post(request(app), '/api/auth/signup', { fullName: 'Asha Verma', email: 'a@x.com', password, confirmPassword: password });
  const u = await User.findOne({ email: 'a@x.com' });
  const ttl = u.otpExpiresAt.getTime() - Date.now();
  assert.ok(ttl > 9 * 60 * 1000 && ttl <= 10 * 60 * 1000);
  await User.updateOne({ _id: u._id }, { otpExpiresAt: new Date(Date.now() - 1000) });
  const r = await post(request(app), '/api/auth/verify-otp', { email: 'a@x.com', otp: lastOtp() });
  assert.equal(r.status, 400);
  assert.match(r.body.message, /expired/i);
  assert.equal((await User.findOne({ email: 'a@x.com' })).isVerified, false);
});

test('five wrong attempts invalidate the OTP (even the correct code afterwards)', async () => {
  await post(request(app), '/api/auth/signup', { fullName: 'Asha Verma', email: 'a@x.com', password, confirmPassword: password });
  const otp = lastOtp();
  const wrong = otp === '000000' ? '111111' : '000000';
  for (let i = 0; i < 5; i += 1) assert.equal((await post(request(app), '/api/auth/verify-otp', { email: 'a@x.com', otp: wrong })).status, 400);
  assert.equal((await post(request(app), '/api/auth/verify-otp', { email: 'a@x.com', otp })).status, 429);
  assert.equal((await post(request(app), '/api/auth/verify-otp', { email: 'a@x.com', otp })).status, 400);
});

test('repeated signup for an unverified account cannot bypass the resend cooldown', async () => {
  const body = { fullName: 'Asha Verma', email: 'a@x.com', password, confirmPassword: password };
  assert.equal((await post(request(app), '/api/auth/signup', body)).status, 201);
  const again = await post(request(app), '/api/auth/signup', body);
  assert.equal(again.status, 429);
  assert.ok(again.body.retryAfter > 0);
  assert.equal(sent.length, 1);                                                            // no second email
  assert.equal((await post(request(app), '/api/auth/resend-otp', { email: 'a@x.com' })).status, 429); // shared cooldown
  await User.updateOne({ email: 'a@x.com' }, { otpLastSentAt: new Date(Date.now() - 2 * 60 * 1000) });
  assert.equal((await post(request(app), '/api/auth/signup', body)).status, 201);          // allowed after cooldown
  assert.equal(sent.length, 2);
});

test('signup for an already verified email returns 409', async () => {
  await makeUser('Asha Verma', 'a@x.com');
  const r = await post(request(app), '/api/auth/signup', { fullName: 'Asha Verma', email: 'a@x.com', password, confirmPassword: password });
  assert.equal(r.status, 409);
});

test('login: unverified blocked, wrong password rejected, success sets HTTP-only cookie without leaking secrets', async () => {
  const agent = request.agent(app);
  await post(agent, '/api/auth/signup', { fullName: 'Asha Verma', email: 'a@x.com', password, confirmPassword: password });
  const unverified = await post(agent, '/api/auth/login', { email: 'a@x.com', password });
  assert.equal(unverified.status, 403);
  assert.equal(unverified.body.code, 'EMAIL_NOT_VERIFIED');
  await post(agent, '/api/auth/verify-otp', { email: 'a@x.com', otp: lastOtp() });
  assert.equal((await post(agent, '/api/auth/login', { email: 'a@x.com', password: 'Wrong1234' })).status, 401);
  const ok = await post(agent, '/api/auth/login', { email: 'a@x.com', password });
  assert.equal(ok.status, 200);
  assert.match(ok.headers['set-cookie'][0], /token=.*HttpOnly/i);
  const text = JSON.stringify(ok.body);
  assert.ok(!/password|otpHash|\$2[aby]\$/.test(text));
});

test('protected routes require authentication', async () => {
  const a = request(app);
  assert.equal((await a.get('/api/user/me')).status, 401);
  assert.equal((await a.get('/api/hackathon/my-entry')).status, 401);
  assert.equal((await post(a, '/api/hackathon/register', regBody())).status, 401);
  assert.equal((await post(a, '/api/contact', { name: 'Asha Verma', email: 'a@x.com', message: 'Hello there team' })).status, 401);
  const u = await makeUser('Asha Verma', 'a@x.com');
  const me = await u.agent.get('/api/user/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.email, 'a@x.com');
  assert.ok(!JSON.stringify(me.body).includes('password'));
});

test('logout clears the session cookie', async () => {
  const u = await makeUser('Asha Verma', 'a@x.com');
  assert.equal((await post(u.agent, '/api/auth/logout', {})).status, 200);
  assert.equal((await u.agent.get('/api/user/me')).status, 401);
});

test('CSRF: missing token and foreign origins are rejected on authenticated writes', async () => {
  const u = await makeUser('Asha Verma', 'a@x.com');
  const noToken = await post(u.agent, '/api/hackathon/register', regBody());           // no X-CSRF-Token
  assert.equal(noToken.status, 403); assert.equal(noToken.body.code, 'CSRF_INVALID');
  const badToken = await post(u.agent, '/api/hackathon/register', regBody(), 'deadbeef');
  assert.equal(badToken.status, 403);
  const evil = await u.agent.post('/api/hackathon/register').set('Origin', 'https://evil.example').set('X-CSRF-Token', u.csrf).send(regBody());
  assert.equal(evil.status, 403); assert.equal(evil.body.code, 'ORIGIN_NOT_ALLOWED');
  assert.equal(await Registration.countDocuments(), 0);
});

test('registration validation, team size and college checks', async () => {
  const u = await makeUser('Asha Verma', 'a@x.com');
  const bad = await post(u.agent, '/api/hackathon/register', regBody({ mobileNumber: '123', projectName: 'abc' }), u.csrf);
  assert.equal(bad.status, 400); assert.ok(bad.body.errors.mobileNumber && bad.body.errors.projectName);
  assert.equal((await post(u.agent, '/api/hackathon/register', regBody({ collegeName: 'Fake College' }), u.csrf)).status, 400);
  assert.equal((await post(u.agent, '/api/hackathon/register', regBody({ teamSize: 6 }), u.csrf)).status, 400);
  assert.equal((await post(u.agent, '/api/hackathon/register', regBody({ teamSize: 3, teamMembers: [{ name: 'Bob Roy', email: 'b@x.com' }] }), u.csrf)).status, 400);
  assert.equal(await Registration.countDocuments(), 0);
});

test('solo and team registration succeed; email is taken from the session; confirmation email is sent', async () => {
  const solo = await makeUser('Asha Verma', 'a@x.com');
  sent = [];
  const r = await post(solo.agent, '/api/hackathon/register', regBody({ email: 'forged@x.com' }), solo.csrf);
  assert.equal(r.status, 201); assert.equal(r.body.data.emailSent, true);
  assert.equal(r.body.data.registration.email, 'a@x.com');
  assert.equal(sent[0].to, 'a@x.com');
  assert.ok(sent[0].text.includes('Smart Care') && sent[0].html.includes('AI/ML'));

  const team = await makeUser('Dev Kumar', 'd@x.com');
  const members = [{ name: 'Bob Roy', email: 'b@x.com' }, { name: 'Cara Lee', email: 'c@x.com' }];
  const t = await post(team.agent, '/api/hackathon/register', regBody({ fullName: 'Dev Kumar', teamSize: 3, teamMembers: members }), team.csrf);
  assert.equal(t.status, 201);
  const mine = await team.agent.get('/api/hackathon/my-entry');
  assert.equal(mine.body.data.registration.teamMembers.length, 2);
});

test('duplicate registration is prevented', async () => {
  const u = await makeUser('Asha Verma', 'a@x.com');
  assert.equal((await post(u.agent, '/api/hackathon/register', regBody(), u.csrf)).status, 201);
  assert.equal((await post(u.agent, '/api/hackathon/register', regBody({ projectName: 'Another Idea' }), u.csrf)).status, 409);
  assert.equal(await Registration.countDocuments(), 1);
});

test('email failure: registration is kept, failure is reported honestly, internals are hidden', async () => {
  const u = await makeUser('Asha Verma', 'a@x.com');
  failMail = true;
  const r = await post(u.agent, '/api/hackathon/register', regBody(), u.csrf);
  assert.equal(r.status, 201);
  assert.equal(r.body.data.emailSent, false);
  assert.equal(r.body.data.registration.confirmationEmailStatus, 'failed');
  assert.match(r.body.message, /could not be sent/i);
  assert.equal(r.body.data.registration.confirmationEmailError, undefined);
  assert.equal(await Registration.countDocuments(), 1);
});

test('email failure recovery: owner-only retry, cooldown, no duplicate registration', async () => {
  const owner = await makeUser('Asha Verma', 'a@x.com');
  const other = await makeUser('Dev Kumar', 'd@x.com');
  failMail = true;
  const created = await post(owner.agent, '/api/hackathon/register', regBody(), owner.csrf);
  const id = created.body.data.registration._id;
  failMail = false; sent = [];

  // cooldown applies right after the failed attempt
  const tooSoon = await post(owner.agent, `/api/hackathon/${id}/resend-confirmation`, {}, owner.csrf);
  assert.equal(tooSoon.status, 429);
  await Registration.updateOne({ _id: id }, { confirmationEmailLastAttemptAt: new Date(Date.now() - 2 * 60 * 1000) });

  // another user cannot retry someone else's registration
  assert.equal((await post(other.agent, `/api/hackathon/${id}/resend-confirmation`, {}, other.csrf)).status, 403);
  // unauthenticated cannot either
  assert.equal((await post(request(app), `/api/hackathon/${id}/resend-confirmation`, {})).status, 401);
  assert.equal(sent.length, 0);

  // owner retry succeeds and sends exactly one email
  const ok = await post(owner.agent, `/api/hackathon/${id}/resend-confirmation`, {}, owner.csrf);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.data.registration.confirmationEmailStatus, 'sent');
  assert.equal(sent.length, 1);
  assert.equal(await Registration.countDocuments(), 1);

  // already sent -> cannot spam
  assert.equal((await post(owner.agent, `/api/hackathon/${id}/resend-confirmation`, {}, owner.csrf)).status, 409);
});

test('retry that fails again returns 502 and keeps the failed status', async () => {
  const u = await makeUser('Asha Verma', 'a@x.com');
  failMail = true;
  const id = (await post(u.agent, '/api/hackathon/register', regBody(), u.csrf)).body.data.registration._id;
  await Registration.updateOne({ _id: id }, { confirmationEmailLastAttemptAt: new Date(Date.now() - 2 * 60 * 1000) });
  const r = await post(u.agent, `/api/hackathon/${id}/resend-confirmation`, {}, u.csrf);
  assert.equal(r.status, 502);
  assert.equal((await Registration.findById(id)).confirmationEmailStatus, 'failed');
});

test('contact form sends to the official address; SMTP failure surfaces as 502', async () => {
  const u = await makeUser('Asha Verma', 'a@x.com');
  sent = [];
  const ok = await post(u.agent, '/api/contact', { name: 'Asha Verma', email: 'a@x.com', message: 'Hello there, quick question.' }, u.csrf);
  assert.equal(ok.status, 200);
  assert.equal(sent[0].to, 'matrucareai@gmail.com');
  failMail = true;
  assert.equal((await post(u.agent, '/api/contact', { name: 'Asha Verma', email: 'a@x.com', message: 'Hello there, quick question.' }, u.csrf)).status, 502);
});

test('unknown routes and malformed ids return consistent JSON errors', async () => {
  const u = await makeUser('Asha Verma', 'a@x.com');
  const nf = await request(app).get('/api/nope');
  assert.equal(nf.status, 404); assert.equal(nf.body.success, false);
  const bad = await post(u.agent, '/api/hackathon/not-an-id/resend-confirmation', {}, u.csrf);
  assert.equal(bad.status, 400); assert.equal(bad.body.success, false);
});
