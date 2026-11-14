const options = require('./options');

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const nameRe = /^\p{L}[\p{L} ]*$/u;
const phoneRe = /^[6-9]\d{9}$/;

const isStr = (v) => typeof v === 'string';
const clean = (v) => (isStr(v) ? v.trim() : '');

/** Returns hostname (without www.) if value is a valid http(s) URL, else null. */
function hostOf(value) {
  try {
    const u = new URL(value);
    if (!['http:', 'https:'].includes(u.protocol)) return null;
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch { return null; }
}
const hostIn = (host, list) => list.some((d) => host === d || host.endsWith('.' + d));

const validateName = (v) => {
  const s = clean(v);
  if (s.length < 3) return 'Name must be at least 3 characters';
  if (s.length > 60) return 'Name must be at most 60 characters';
  if (!nameRe.test(s)) return 'Name can contain letters and spaces only';
  return null;
};
const validateEmail = (v) => (emailRe.test(clean(v)) && clean(v).length <= 120 ? null : 'Enter a valid email address');
const validatePassword = (v) => {
  if (!isStr(v) || v.length < 8) return 'Password must be at least 8 characters';
  if (v.length > 72) return 'Password must be at most 72 characters';
  if (!/[a-z]/.test(v) || !/[A-Z]/.test(v) || !/\d/.test(v)) return 'Password needs an uppercase letter, a lowercase letter and a number';
  return null;
};
const validatePpt = (v) => {
  const h = hostOf(clean(v));
  const ok = h && hostIn(h, ['drive.google.com', 'docs.google.com', 'onedrive.live.com', '1drv.ms', 'sharepoint.com', 'office.com']);
  return ok ? null : 'Enter a valid Google Drive or OneDrive shareable link';
};
const validatePrototype = (v) => (hostOf(clean(v)) ? null : 'Enter a valid GitHub, Figma or live demo URL');
const validateDemo = (v) => {
  if (!clean(v)) return null; // optional
  const h = hostOf(clean(v));
  return h && hostIn(h, ['youtube.com', 'youtu.be', 'drive.google.com']) ? null : 'Enter a valid YouTube or Google Drive link';
};

/** Validates the hackathon registration payload. Returns { errors, data }. */
function validateRegistration(body, authEmail) {
  const errors = {};
  const b = body || {};
  const set = (k, msg) => { if (msg) errors[k] = msg; };

  set('fullName', validateName(b.fullName));
  set('mobileNumber', phoneRe.test(clean(String(b.mobileNumber ?? ''))) ? null : 'Enter a valid 10-digit Indian mobile number');
  set('collegeName', options.colleges.includes(b.collegeName) ? null : 'Select a college from the list');
  set('course', options.courses.includes(b.course) ? null : 'Select a valid course');
  set('branch', options.branches.includes(b.branch) ? null : 'Select a valid branch');
  set('yearOfStudy', options.years.includes(b.yearOfStudy) ? null : 'Select a valid year');
  set('domain', options.domains.includes(b.domain) ? null : 'Select a valid domain');
  set('projectName', clean(b.projectName).length >= 5 && clean(b.projectName).length <= 100 ? null : 'Project name must be 5-100 characters');
  set('pptLink', validatePpt(b.pptLink));
  set('prototypeLink', validatePrototype(b.prototypeLink));
  set('demoVideoLink', validateDemo(b.demoVideoLink));

  const teamSize = Number(b.teamSize);
  if (!Number.isInteger(teamSize) || teamSize < 1 || teamSize > 5) set('teamSize', 'Team size must be between 1 and 5');

  const members = Array.isArray(b.teamMembers) ? b.teamMembers : [];
  if (!errors.teamSize) {
    if (members.length !== teamSize - 1) {
      set('teamMembers', `Provide details for exactly ${teamSize - 1} additional member(s)`);
    } else {
      const seen = new Set([String(authEmail).toLowerCase()]);
      const memberErrors = members.map((m) => {
        const e = {};
        const nm = validateName(m && m.name);
        if (nm) e.name = nm;
        const em = validateEmail(m && m.email);
        if (em) e.email = em;
        else {
          const key = clean(m.email).toLowerCase();
          if (seen.has(key)) e.email = 'Duplicate email in team';
          seen.add(key);
        }
        return e;
      });
      if (memberErrors.some((e) => Object.keys(e).length)) errors.teamMembers = memberErrors;
    }
  }
  if (Object.keys(errors).length) return { errors };

  return {
    errors: null,
    data: {
      fullName: clean(b.fullName), email: authEmail, mobileNumber: clean(String(b.mobileNumber)),
      collegeName: clean(b.collegeName), course: b.course, branch: b.branch, yearOfStudy: b.yearOfStudy,
      domain: b.domain, projectName: clean(b.projectName), pptLink: clean(b.pptLink),
      prototypeLink: clean(b.prototypeLink), demoVideoLink: clean(b.demoVideoLink), teamSize,
      teamMembers: members.map((m) => ({ name: clean(m.name), email: clean(m.email).toLowerCase() })),
    },
  };
}

module.exports = { validateName, validateEmail, validatePassword, validateRegistration, clean };
