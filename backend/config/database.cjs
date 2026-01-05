const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Accept multiple common env var names used by different hosts (Render, Heroku, local .env)
const rawUri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URL;

function maskUri(uri) {
  try {
    // show only protocol and host for logs, hide credentials
    const withoutProto = uri.replace(/^mongodb(\+srv)?:\/\//, '');
    const parts = withoutProto.split('@');
    const hostPart = parts.length > 1 ? parts[1] : parts[0];
    return `${uri.split('://')[0] || 'mongodb'}://${hostPart.split('/')[0]}`;
  } catch (e) {
    return 'mongodb://<redacted>';
  }
}

async function connect() {
  if (!rawUri) {
    throw new Error('MONGODB connection string is not set. Please set MONGODB_URI (or DATABASE_URL) env var with a value starting with "mongodb://" or "mongodb+srv://"');
  }

  // Normalize minor misconfigurations: attempt to add scheme if missing
  let uri = String(rawUri).trim();
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    // If it looks like an Atlas host, prefer +srv
    if (uri.includes('.mongodb.net')) {
      uri = `mongodb+srv://${uri}`;
    } else if (/^mongodb(\+srv)?:/.test(uri)) {
      // fix missing slashes: e.g. 'mongodb+srv:cluster0...' -> 'mongodb+srv://cluster0...'
      uri = uri.replace(/^mongodb\+srv:\/?\/?/, 'mongodb+srv://').replace(/^mongodb:\/?\/?/, 'mongodb://');
    } else {
      // fallback to standard scheme
      uri = `mongodb://${uri}`;
    }
  }

  if (mongoose.connection.readyState === 1) return mongoose;

  console.log('Connecting to MongoDB:', maskUri(uri));

  try {
    // mongoose options with sensible defaults
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return mongoose;
  } catch (err) {
    // Re-throw a clearer error for hosting logs
    const msg = err && err.message ? err.message : String(err);
    throw new Error(`Failed to connect to MongoDB: ${msg}`);
  }
}

async function disconnect() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { connect, disconnect, mongoose };
