const AppError = require('../utils/AppError');

const SENDER_NAME = 'MatruCare AI';

let transporter = null;

/**
 * Validates Brevo SMTP configuration.
 */
function assertMailConfig(env = process.env) {
  const host = env.SMTP_HOST || '';
  const port = Number(env.SMTP_PORT || 2525);
  const user = (env.SMTP_USER || '').trim();
  const pass = env.SMTP_PASS || '';
  const from = (env.EMAIL_FROM || '').trim();

  if (!host || !user || !pass || !from) {
    throw new AppError(
      'Email is not configured. Check SMTP environment variables.',
      503,
      { code: 'EMAIL_NOT_CONFIGURED' }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) {
    throw new AppError(
      'Invalid EMAIL_FROM address.',
      503,
      { code: 'EMAIL_INVALID' }
    );
  }

  return {
    host,
    port,
    secure: String(env.SMTP_SECURE).toLowerCase() === 'true',
    user,
    pass,
    from
  };
}

/**
 * Creates Brevo SMTP transporter.
 */
function getTransporter() {
  const config = assertMailConfig();

  if (!transporter) {
    const nodemailer = require('nodemailer');

    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,

      auth: {
        user: config.user,
        pass: config.pass
      },

      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000
    });
  }

  return transporter;
}

function describeMailError(err) {
  if (err instanceof AppError) return err.message;

  if (err.code === 'EAUTH') {
    return 'Brevo rejected SMTP credentials. Check SMTP_USER and SMTP_PASS.';
  }

  if (
    ['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS'].includes(err.code)
  ) {
    return 'Cannot connect to Brevo SMTP server. Check network and SMTP settings.';
  }

  return 'The email service reported an error. Please try again later.';
}

/**
 * Verifies SMTP connection.
 */
async function verifyConnection() {
  try {
    await getTransporter().verify();

    return { ok: true };
  } catch (err) {
    console.error('[mail] SMTP verification failed:', err.message);

    return {
      ok: false,
      error: describeMailError(err)
    };
  }
}

/**
 * Contact form recipient.
 */
const contactRecipient = () =>
  (process.env.CONTACT_EMAIL || assertMailConfig().from);

/**
 * Sends emails through Brevo SMTP.
 */
async function sendMail({
  to,
  subject,
  html,
  text,
  replyTo
}) {
  const config = assertMailConfig();
  const tx = getTransporter();

  try {
    const info = await tx.sendMail({
      from: {
        name: SENDER_NAME,
        address: config.from
      },

      to,
      subject,
      html,
      text,
      replyTo
    });

    console.log(
      `[mail] sent "${subject}" to ${to} (${info.messageId})`
    );

    return info;

  } catch (err) {
    console.error(
      `[mail] FAILED "${subject}" to ${to}:`,
      err.code,
      err.message
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


















// const AppError = require('../utils/AppError');

// const SENDER_NAME = 'MatruCare AI';

// let transporter = null;

// /**
//  * Validates Gmail SMTP configuration.
//  * Allows any valid Gmail address configured in server/.env.
//  */
// function assertMailConfig(env = process.env) {
//   const user = (env.EMAIL_USER || '').trim().toLowerCase();
//   const pass = env.EMAIL_PASS || '';

//   if (!user || !pass || pass === 'YOUR_GMAIL_APP_PASSWORD') {
//     throw new AppError(
//       'Email is not configured: set EMAIL_USER and EMAIL_PASS in server/.env',
//       503,
//       { code: 'EMAIL_NOT_CONFIGURED' }
//     );
//   }

//   if (!/^[^\s@]+@gmail\.com$/i.test(user)) {
//     throw new AppError(
//       'EMAIL_USER must be a valid Gmail address.',
//       503,
//       { code: 'EMAIL_INVALID' }
//     );
//   }

//   return {
//     user,
//     pass: pass.replace(/\s+/g, '')
//   };
// }

// /**
//  * Creates Gmail SMTP transporter.
//  */
// function getTransporter() {
//   const { user, pass } = assertMailConfig();

//   if (!transporter) {
//     const nodemailer = require('nodemailer');

//     transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: true,
//       auth: { user, pass }
//     });
//   }

//   return transporter;
// }

// function describeMailError(err) {
//   if (err instanceof AppError) return err.message;

//   if (err.code === 'EAUTH') {
//     return 'Gmail rejected the credentials. Use a 16-character App Password.';
//   }

//   if (['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS'].includes(err.code)) {
//     return 'Cannot reach smtp.gmail.com. Check network/firewall.';
//   }

//   return 'The email service reported an error. Please try again later.';
// }

// async function verifyConnection() {
//   try {
//     await getTransporter().verify();
//     return { ok: true };
//   } catch (err) {
//     return {
//       ok: false,
//       error: describeMailError(err)
//     };
//   }
// }

// /**
//  * Contact form messages are delivered to your configured Gmail.
//  */
// const contactRecipient = () => assertMailConfig().user;

// /**
//  * Sends emails using MatruCare AI as the display name
//  * and your configured Gmail as the actual sender.
//  */
// async function sendMail({ to, subject, html, text, replyTo }) {
//   const { user } = assertMailConfig();
//   const tx = getTransporter();

//   try {
//     const info = await tx.sendMail({
//       from: {
//         name: SENDER_NAME,
//         address: user
//       },
//       to,
//       subject,
//       html,
//       text,
//       replyTo
//     });

//     console.log(`[mail] sent "${subject}" to ${to} (${info.messageId})`);

//     return info;
//   } catch (err) {
//     console.error(
//       `[mail] FAILED "${subject}" to ${to}: ${err.code || ''} ${err.message}`
//     );

//     throw new AppError(
//       describeMailError(err),
//       502,
//       { code: 'EMAIL_SEND_FAILED' }
//     );
//   }
// }

// module.exports = {
//   sendMail,
//   verifyConnection,
//   assertMailConfig,
//   contactRecipient,
//   SENDER_NAME
// };