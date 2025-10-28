const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

async function connect() {
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');
  if (mongoose.connection.readyState === 1) return mongoose;
  // mongoose options with sensible defaults
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return mongoose;
}

async function disconnect() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { connect, disconnect, mongoose };
