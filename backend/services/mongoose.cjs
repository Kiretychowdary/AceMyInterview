/**
 * Mongoose Connection Service
 * Wraps database configuration for backward compatibility
 */
const dbConfig = require('../config/database.cjs');

module.exports = {
  connect: dbConfig.connect,
  disconnect: dbConfig.disconnect,
  getConnection: dbConfig.getConnection
};
