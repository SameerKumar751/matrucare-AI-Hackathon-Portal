const mongoose = require('mongoose');

/** Connects to MongoDB using MONGO_URI. Exits the process if it cannot connect. */
async function connectDb() {
  if (!process.env.MONGO_URI) {
    console.error('[db] MONGO_URI is not set in server/.env');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    process.exit(1);
  }
}
module.exports = connectDb;
