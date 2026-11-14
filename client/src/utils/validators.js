// Client-side validators (the server re-validates everything). Each returns an error string or ''.
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const hostOf = (v) => { try { const u = new URL(v); return ['http:', 'https:'].includes(u.protocol) ? u.hostname.replace(/^www\./, '').toLowerCase() : null; } catch { return null; } };
const hostIn = (h, list) => list.some((d) => h === d || h.endsWith('.' + d));

export const vName = (v) => {
  const s = (v || '').trim();
  if (s.length < 3) return 'Name must be at least 3 characters';
  if (!/^\p{L}[\p{L} ]*$/u.test(s)) return 'Letters and spaces only';
  return '';
};
export const vEmail = (v) => (emailRe.test((v || '').trim()) ? '' : 'Enter a valid email address');
export const vPassword = (v) => {
  if (!v || v.length < 8) return 'At least 8 characters';
  if (!/[a-z]/.test(v) || !/[A-Z]/.test(v) || !/\d/.test(v)) return 'Include uppercase, lowercase and a number';
  return '';
};
export const vMobile = (v) => (/^[6-9]\d{9}$/.test(String(v || '').trim()) ? '' : 'Enter a valid 10-digit Indian mobile number');
export const vRequired = (label) => (v) => (String(v || '').trim() ? '' : `Select ${label}`);
export const vProject = (v) => ((v || '').trim().length >= 5 ? '' : 'At least 5 characters');
export const vPpt = (v) => { const h = hostOfSafe(v); return h && hostIn(h, ['drive.google.com', 'docs.google.com', 'onedrive.live.com', '1drv.ms', 'sharepoint.com', 'office.com']) ? '' : 'Enter a Google Drive or OneDrive shareable link'; };
export const vPrototype = (v) => (hostOf((v || '').trim()) ? '' : 'Enter a GitHub, Figma or live demo URL');
export const vDemo = (v) => { if (!(v || '').trim()) return ''; const h = hostOf(v.trim()); return h && hostIn(h, ['youtube.com', 'youtu.be', 'drive.google.com']) ? '' : 'Enter a YouTube or Google Drive link'; };
function hostOfSafe(v) { return hostOf((v || '').trim()); }
