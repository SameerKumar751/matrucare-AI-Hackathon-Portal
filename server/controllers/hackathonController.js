const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { validateRegistration } = require('../utils/validators');
const emailService = require('../services/emailService');
const { confirmationEmail } = require('../templates/emailTemplates');

const RETRY_COOLDOWN_MS = 60 * 1000;

/** Attempts to send the confirmation email and records the real outcome on the registration. */
async function deliverConfirmation(reg) {
  reg.confirmationEmailLastAttemptAt = new Date();
  try {
    await emailService.sendMail({ to: reg.email, ...confirmationEmail(reg) });
    reg.confirmationEmailStatus = 'sent';
    reg.confirmationEmailError = '';
  } catch (err) {
    reg.confirmationEmailStatus = 'failed';
    reg.confirmationEmailError = err.message; // stored server-side only; stripped from API output
  }
  await reg.save();
  return reg.confirmationEmailStatus === 'sent';
}

exports.register = asyncHandler(async (req, res) => {
  if (await Registration.exists({ userId: req.user._id })) throw new AppError('You have already registered for the hackathon', 409);

  // Email always comes from the authenticated session, never from the request body.
  const { errors, data } = validateRegistration(req.body, req.user.email);
  if (errors) throw new AppError('Please fix the highlighted fields', 400, { errors });

  let reg;
  try { reg = await Registration.create({ ...data, userId: req.user._id }); }
  catch (err) { if (err.code === 11000) throw new AppError('You have already registered for the hackathon', 409); throw err; }

  const emailSent = await deliverConfirmation(reg);
  res.status(201).json({
    success: true,
    message: emailSent
      ? 'Registration successful. A confirmation email has been sent.'
      : 'Registration saved, but the confirmation email could not be sent. You can retry from your dashboard.',
    data: { registration: reg, emailSent },
  });
});

/** Returns the user's registration, or null if they have not registered yet. */
exports.myEntry = asyncHandler(async (req, res) => {
  const registration = await Registration.findOne({ userId: req.user._id });
  res.json({ success: true, data: { registration } });
});

/**
 * Retries a failed confirmation email for the caller's own registration.
 * Never creates a registration; owner-only; blocked if already sent; 60 s cooldown.
 */
exports.resendConfirmation = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Invalid registration id', 400);
  const reg = await Registration.findById(req.params.id);
  if (!reg) throw new AppError('Registration not found', 404);
  if (String(reg.userId) !== String(req.user._id)) throw new AppError('You are not allowed to access this registration', 403);
  if (reg.confirmationEmailStatus === 'sent') throw new AppError('The confirmation email was already sent', 409);

  const wait = reg.confirmationEmailLastAttemptAt ? RETRY_COOLDOWN_MS - (Date.now() - reg.confirmationEmailLastAttemptAt.getTime()) : 0;
  if (wait > 0) {
    const retryAfter = Math.ceil(wait / 1000);
    throw new AppError(`Please wait ${retryAfter}s before retrying.`, 429, { retryAfter });
  }

  const emailSent = await deliverConfirmation(reg);
  if (!emailSent) throw new AppError('The confirmation email could not be sent. Please try again later.', 502, { code: 'EMAIL_SEND_FAILED' });
  res.json({ success: true, message: 'Confirmation email sent.', data: { registration: reg, emailSent: true } });
});

/** Owner-only delete. */
exports.remove = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Invalid registration id', 400);
  const reg = await Registration.findById(req.params.id);
  if (!reg) throw new AppError('Registration not found', 404);
  if (String(reg.userId) !== String(req.user._id)) throw new AppError('You are not allowed to delete this registration', 403);
  await reg.deleteOne();
  res.json({ success: true, message: 'Registration deleted' });
});
