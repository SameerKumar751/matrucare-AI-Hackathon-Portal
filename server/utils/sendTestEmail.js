// Usage: npm run test:email  -> sends a real test email to EMAIL_USER (or TEST_TO)
require('dotenv').config();
const { verifyConnection, sendMail } = require('../services/emailService');
(async () => {
  const v = await verifyConnection();
  if (!v.ok) { console.error('SMTP check failed:', v.error); process.exit(1); }
  const to = process.env.TEST_TO || process.env.EMAIL_USER;
  await sendMail({ to, subject: 'MatruCare AI SMTP test', text: 'SMTP is configured correctly.', html: '<p>SMTP is configured correctly.</p>' });
  console.log('Test email sent to', to);
})().catch((e) => { console.error(e.message); process.exit(1); });
