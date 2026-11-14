// HTML email templates. All user input is escaped. Branding: MatruCare AI only.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const layout = (title, body) => `<!doctype html><html><body style="margin:0;background:#eef4f0;font-family:Arial,Helvetica,sans-serif;color:#12322b">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#12322b;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:bold">MatruCare AI</td></tr>
<tr><td style="padding:28px"><h2 style="margin:0 0 16px;font-size:20px">${esc(title)}</h2>${body}</td></tr>
<tr><td style="padding:16px 28px;background:#f7faf8;font-size:12px;color:#5b736c">MatruCare AI &bull; matrucareai@gmail.com</td></tr>
</table></td></tr></table></body></html>`;

const row = (k, v) => `<tr><td style="padding:6px 12px 6px 0;color:#5b736c;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${v}</td></tr>`;
const link = (u) => `<a href="${esc(u)}" style="color:#b4325f">${esc(u)}</a>`;

exports.otpEmail = ({ otp }) => ({
  subject: 'Your MatruCare AI verification code',
  text: `Your MatruCare AI verification code is ${otp}. It expires in 10 minutes and can be used once.`,
  html: layout('Verify your email', `<p>Use this code to verify your email address and activate your account:</p>
  <p style="font-size:34px;letter-spacing:8px;font-weight:bold;background:#eef4f0;padding:16px;text-align:center;border-radius:8px;margin:20px 0">${esc(otp)}</p>
  <p>The code expires in <b>10 minutes</b> and can only be used once. If you did not create an account, you can ignore this email.</p>`),
});

exports.confirmationEmail = (r) => {
  const members = r.teamMembers || [];
  const text = [
    `Hi ${r.fullName},`,
    '',
    'Your hackathon registration is confirmed.',
    '',
    `Participant: ${r.fullName} (${r.email}), mobile ${r.mobileNumber}`,
    `Project: ${r.projectName}`,
    `Domain / Track: ${r.domain}`,
    `College: ${r.collegeName}`,
    `Course: ${r.course} - ${r.branch}, ${r.yearOfStudy}`,
    `Team size: ${r.teamSize}${r.teamSize === 1 ? ' (solo)' : ''}`,
    `Team leader: ${r.fullName} (${r.email})`,
    ...members.map((m, i) => `Member ${i + 1}: ${m.name} (${m.email})`),
    `PPT: ${r.pptLink}`,
    `Prototype: ${r.prototypeLink}`,
    ...(r.demoVideoLink ? [`Demo video: ${r.demoVideoLink}`] : []),
    '',
    'Log in to your dashboard any time to view your registration.',
    '',
    'MatruCare AI - matrucareai@gmail.com',
  ].join('\n');
  return {
    subject: 'Hackathon registration confirmed - MatruCare AI',
    text,
    html: layout('Registration confirmed', `<p>Hi ${esc(r.fullName)}, your hackathon registration has been received and confirmed.</p>
  <table cellpadding="0" cellspacing="0" style="font-size:14px;width:100%">
  ${row('Participant', `${esc(r.fullName)} (${esc(r.email)}), mobile ${esc(r.mobileNumber)}`)}
  ${row('Project', `<b>${esc(r.projectName)}</b>`)}${row('Domain / Track', esc(r.domain))}
  ${row('College', esc(r.collegeName))}${row('Course', `${esc(r.course)} - ${esc(r.branch)}, ${esc(r.yearOfStudy)}`)}
  ${row('Team size', `${esc(r.teamSize)}${r.teamSize === 1 ? ' (solo)' : ''}`)}
  ${row('Team leader', `${esc(r.fullName)} (${esc(r.email)})`)}
  ${members.map((m, i) => row(`Member ${i + 1}`, `${esc(m.name)} (${esc(m.email)})`)).join('')}
  ${row('PPT', link(r.pptLink))}${row('Prototype', link(r.prototypeLink))}${r.demoVideoLink ? row('Demo video', link(r.demoVideoLink)) : ''}
  </table><p style="margin-top:20px">Log in to your dashboard any time to view your registration.</p>`),
  };
};

exports.contactEmail = ({ name, email, message }) => ({
  subject: `Contact form message from ${name}`,
  text: `From: ${name} <${email}>\n\n${message}`,
  html: layout('New contact message', `<table style="font-size:14px">${row('Name', esc(name))}${row('Email', esc(email))}</table>
  <p style="white-space:pre-wrap;background:#f7faf8;padding:14px;border-radius:8px">${esc(message)}</p>`),
});
