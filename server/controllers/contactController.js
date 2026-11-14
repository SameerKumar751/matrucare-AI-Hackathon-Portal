const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { validateName, validateEmail, clean } = require('../utils/validators');
const emailService = require('../services/emailService');
const { contactEmail } = require('../templates/emailTemplates');

exports.sendContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body || {};
  const errors = {};
  const n = validateName(name); if (n) errors.name = n;
  const e = validateEmail(email); if (e) errors.email = e;
  const m = clean(message);
  if (m.length < 10 || m.length > 2000) errors.message = 'Message must be 10-2000 characters';
  if (Object.keys(errors).length) throw new AppError('Please fix the highlighted fields', 400, { errors });

  await emailService.sendMail({ to: emailService.contactRecipient(), replyTo: clean(email), ...contactEmail({ name: clean(name), email: clean(email), message: m }) });
  res.json({ success: true, message: 'Message sent. We will get back to you soon.' });
});
