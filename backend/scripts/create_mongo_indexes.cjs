/**
 * Run this script to ensure indexes exist in the MongoDB cluster.
 * Usage (from backend/):
 *   node scripts/create_mongo_indexes.cjs
 * Ensure MONGODB_URI is set in backend/.env or environment.
 */
const mongooseService = require('../services/mongoose.cjs');
const Submission = require('../models/submission.model.cjs');

(async () => {
  try {
    await mongooseService.connect();
    console.log('Creating indexes (via Mongoose) for submissions collection...');
    // Ensure indexes defined on schema are created in MongoDB
    await Submission.init();
    console.log('Indexes created.');
  } catch (err) {
    console.error('Failed to create indexes:', err);
    process.exitCode = 2;
  } finally {
    await mongooseService.disconnect();
  }
})();
