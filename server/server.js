require('dotenv').config();
const createApp = require('./app');
const connectDb = require('./config/db');
const { verifyConnection } = require('./services/emailService');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('[config] JWT_SECRET missing or too short. Set it in server/.env');
  process.exit(1);
}

const port = process.env.PORT || 5000;
connectDb().then(async () => {
  createApp().listen(port, () => console.log(`[server] listening on ${port}`));
  const mail = await verifyConnection();
  console.log(mail.ok ? '[mail] SMTP connection verified' : `[mail] SMTP NOT ready: ${mail.error}`);
});
