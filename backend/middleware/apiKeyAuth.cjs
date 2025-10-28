// Simple API key auth middleware for internal endpoints
module.exports = function requireApiKey(req, res, next) {
  const headerKey = req.headers['x-api-key'] || req.query.api_key || req.headers['authorization'];
  const expected = process.env.SUBMISSION_API_KEY || process.env.ADMIN_API_KEY || process.env.API_KEY;
  if (!expected) {
    // If no key configured, allow through (development mode)
    return next();
  }
  if (!headerKey) return res.status(401).json({ success: false, error: 'Missing API key' });
  // allow Authorization: Bearer <key>
  const provided = String(headerKey).startsWith('Bearer ') ? String(headerKey).slice(7) : String(headerKey);
  if (provided !== expected) return res.status(403).json({ success: false, error: 'Invalid API key' });
  return next();
};
