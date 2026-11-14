const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { validateName, clean } = require('../utils/validators');

/** Returns the user plus the CSRF token the SPA must send as X-CSRF-Token on state-changing calls. */
exports.getMe = (req, res) => res.json({ success: true, data: { user: req.user.toPublic(), csrfToken: req.csrfToken } });

/** Updates editable profile fields (full name only; email is the login identity). */
exports.updateMe = asyncHandler(async (req, res) => {
  const err = validateName(req.body && req.body.fullName);
  if (err) throw new AppError(err, 400, { errors: { fullName: err } });
  req.user.fullName = clean(req.body.fullName);
  await req.user.save();
  res.json({ success: true, message: 'Profile updated', data: { user: req.user.toPublic() } });
});
