const AppError = require('../utils/AppError');

const SENDER_NAME = 'MatruCare AI';

let transporter = null;

/**
 * Validates Gmail SMTP configuration.
 * Allows any valid Gmail address configured in server/.env.
 */
function assertMailConfig(env = process.env) {
  const user = (env.EMAIL_USER || '').trim().toLowerCase();
  const pass = env.EMAIL_PASS || '';

  if (!user || !pass || pass === 'YOUR_GMAIL_APP_PASSWORD') {
    throw new AppError(
      'Email is not configured: set EMAIL_USER and EMAIL_PASS in server/.env',
      503,
      { code: 'EMAIL_NOT_CONFIGURED' }
    );
  }

  if (!/^[^\s@]+@gmail\.com$/i.test(user)) {
    throw new AppError(
      'EMAIL_USER must be a valid Gmail address.',
      503,
      { code: 'EMAIL_INVALID' }
    );
  }

  return {
    user,
    pass: pass.replace(/\s+/g, '')
  };
}

/**
 * Creates Gmail SMTP transporter.
 */
function getTransporter() {
  const { user, pass } = assertMailConfig();

  if (!transporter) {
    const nodemailer = require('nodemailer');

    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass }
    });
  }

  return transporter;
}

function describeMailError(err) {
  if (err instanceof AppError) return err.message;

  if (err.code === 'EAUTH') {
    return 'Gmail rejected the credentials. Use a 16-character App Password.';
  }

  if (['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS'].includes(err.code)) {
    return 'Cannot reach smtp.gmail.com. Check network/firewall.';
  }

  return 'The email service reported an error. Please try again later.';
}

async function verifyConnection() {
  try {
    await getTransporter().verify();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: describeMailError(err)
    };
  }
}

/**
 * Contact form messages are delivered to your configured Gmail.
 */
const contactRecipient = () => assertMailConfig().user;

/**
 * Sends emails using MatruCare AI as the display name
 * and your configured Gmail as the actual sender.
 */
async function sendMail({ to, subject, html, text, replyTo }) {
  const { user } = assertMailConfig();
  const tx = getTransporter();

  try {
    const info = await tx.sendMail({
      from: {
        name: SENDER_NAME,
        address: user
      },
      to,
      subject,
      html,
      text,
      replyTo
    });

    console.log(`[mail] sent "${subject}" to ${to} (${info.messageId})`);

    return info;
  } catch (err) {
    console.error(
      `[mail] FAILED "${subject}" to ${to}: ${err.code || ''} ${err.message}`
    );

    throw new AppError(
      describeMailError(err),
      502,
      { code: 'EMAIL_SEND_FAILED' }
    );
  }
}

module.exports = {
  sendMail,
  verifyConnection,
  assertMailConfig,
  contactRecipient,
  SENDER_NAME
};