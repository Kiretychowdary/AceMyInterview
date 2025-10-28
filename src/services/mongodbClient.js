import { MongoClient } from 'mongodb';

// Simple singleton MongoDB client used by services in this repo.
// Configure with environment variables:
// - MONGODB_URI (required)
// - MONGODB_DB_NAME (optional, defaults to 'acemyinterview')

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'acemyinterview';

let _client = null;

export async function connect() {
  if (_client) return _client;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');
  _client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await _client.connect();
  return _client;
}

export function getDb() {
  if (!_client) throw new Error('Mongo client not connected. Call connect() first.');
  return _client.db(dbName);
}

export async function close() {
  if (_client) {
    try { await _client.close(); } catch (e) { /* ignore */ }
    _client = null;
  }
}

export default { connect, getDb, close };
