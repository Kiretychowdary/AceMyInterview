const { MongoClient } = require('mongodb');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'acemyinterview';

let client = null;

async function connect() {
  if (client) return client;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client;
}

function getDb() {
  if (!client) throw new Error('Mongo client not connected. Call connect() first.');
  return client.db(dbName);
}

async function close() {
  if (client) {
    await client.close();
    client = null;
  }
}

module.exports = { connect, getDb, close };
