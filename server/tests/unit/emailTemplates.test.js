require('./_env');
const test = require('node:test');
const assert = require('node:assert/strict');
const { confirmationEmail, otpEmail } = require('../../templates/emailTemplates');

const reg = {
  fullName: 'Asha Verma', email: 'asha@example.com', mobileNumber: '9876543210', collegeName: 'University of Lucknow',
  course: 'B.Tech', branch: 'CSE', yearOfStudy: '3rd Year', domain: 'AI/ML', projectName: 'Smart <Care>',
  pptLink: 'https://drive.google.com/ppt', prototypeLink: 'https://github.com/o/r', demoVideoLink: 'https://youtu.be/x',
  teamSize: 3, teamMembers: [{ name: 'Bob Roy', email: 'bob@example.com' }, { name: 'Cara Lee', email: 'cara@example.com' }],
};

test('confirmation email: plain text AND html contain all required details', () => {
  const m = confirmationEmail(reg);
  const required = ['Asha Verma', 'asha@example.com', 'Smart', 'AI/ML', 'University of Lucknow', 'Bob Roy', 'bob@example.com', 'Cara Lee', 'cara@example.com',
    reg.pptLink, reg.prototypeLink, reg.demoVideoLink, '9876543210'];
  for (const v of required) {
    assert.ok(m.text.includes(v), `text missing ${v}`);
    assert.ok(m.html.includes(v), `html missing ${v}`);
  }
  assert.ok(/Team size: 3/.test(m.text));
});
test('confirmation email escapes HTML in user input', () => {
  const m = confirmationEmail(reg);
  assert.ok(m.html.includes('Smart &lt;Care&gt;'));
  assert.ok(!m.html.includes('Smart <Care>'));
});
test('solo registration lists no members; OTP email states 10-minute expiry', () => {
  const m = confirmationEmail({ ...reg, teamSize: 1, teamMembers: [], demoVideoLink: '' });
  assert.ok(!/Member 1/.test(m.text) && /solo/.test(m.text));
  const o = otpEmail({ otp: '123456' });
  assert.ok(o.text.includes('123456') && o.html.includes('10 minutes'));
});
