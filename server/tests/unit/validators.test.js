require('./_env');
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateName, validateEmail, validatePassword, validateRegistration } = require('../../utils/validators');
const options = require('../../utils/options');

const valid = () => ({
  fullName: 'Asha Verma', mobileNumber: '9876543210', collegeName: options.colleges[0], course: 'B.Tech', branch: 'CSE',
  yearOfStudy: '3rd Year', domain: 'AI/ML', projectName: 'Smart Care', pptLink: 'https://drive.google.com/file/d/abc/view',
  prototypeLink: 'https://github.com/org/repo', demoVideoLink: '', teamSize: 1, teamMembers: [],
});
const run = (over) => validateRegistration({ ...valid(), ...over }, 'leader@example.com');

test('signup validators: name, email, password', () => {
  assert.ok(validateName('Al'));            // < 3 chars
  assert.ok(validateName('Asha123'));       // digits
  assert.equal(validateName('Asha Verma'), null);
  assert.ok(validateEmail('not-an-email'));
  assert.equal(validateEmail('a@b.co'), null);
  assert.ok(validatePassword('short1A'));   // < 8
  assert.ok(validatePassword('alllowercase1'));
  assert.equal(validatePassword('Str0ngPass'), null);
});

test('registration: valid solo payload passes and email is forced from session', () => {
  const r = run({ email: 'attacker@example.com' });
  assert.equal(r.errors, null);
  assert.equal(r.data.email, 'leader@example.com');
});

test('registration: mobile, project name, links', () => {
  assert.ok(run({ mobileNumber: '12345' }).errors.mobileNumber);
  assert.ok(run({ mobileNumber: '5876543210' }).errors.mobileNumber); // must start 6-9
  assert.ok(run({ projectName: 'abcd' }).errors.projectName);
  assert.ok(run({ pptLink: 'https://example.com/x' }).errors.pptLink);
  assert.ok(run({ pptLink: 'javascript:alert(1)' }).errors.pptLink);
  assert.ok(run({ prototypeLink: 'ftp://x.com' }).errors.prototypeLink);
  assert.ok(run({ demoVideoLink: 'https://example.com/v' }).errors.demoVideoLink);
  assert.equal(run({ demoVideoLink: 'https://youtu.be/abc' }).errors, null); // optional but valid
});

test('registration: dropdown values and college must come from configured lists', () => {
  assert.ok(run({ collegeName: 'Made Up University' }).errors.collegeName);
  assert.ok(run({ course: 'PhD-ish' }).errors.course);
  assert.ok(run({ domain: 'Nope' }).errors.domain);
});

test('team size: bounds and member count', () => {
  assert.ok(run({ teamSize: 0 }).errors.teamSize);
  assert.ok(run({ teamSize: 6 }).errors.teamSize);
  assert.ok(run({ teamSize: 3, teamMembers: [] }).errors.teamMembers);                       // needs 2 members
  assert.ok(run({ teamSize: 1, teamMembers: [{ name: 'Bob Roy', email: 'b@x.com' }] }).errors.teamMembers); // solo has none
  const ok = run({ teamSize: 3, teamMembers: [{ name: 'Bob Roy', email: 'b@x.com' }, { name: 'Cara Lee', email: 'c@x.com' }] });
  assert.equal(ok.errors, null);
  assert.equal(ok.data.teamMembers.length, 2);
});

test('team members: invalid fields, duplicates and leader email reuse are rejected', () => {
  const bad = run({ teamSize: 2, teamMembers: [{ name: 'B', email: 'bad' }] });
  assert.ok(bad.errors.teamMembers[0].name && bad.errors.teamMembers[0].email);
  const dup = run({ teamSize: 3, teamMembers: [{ name: 'Bob Roy', email: 'b@x.com' }, { name: 'Bob Two', email: 'B@x.com' }] });
  assert.ok(dup.errors.teamMembers[1].email);
  const leader = run({ teamSize: 2, teamMembers: [{ name: 'Bob Roy', email: 'leader@example.com' }] });
  assert.ok(leader.errors.teamMembers[0].email);
});
