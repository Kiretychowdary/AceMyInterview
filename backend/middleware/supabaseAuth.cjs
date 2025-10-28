const axios = require('axios');

/**
 * Middleware to validate Supabase session tokens.
 *
 * Behavior:
 * - If SUPABASE_URL is set, will call GET {SUPABASE_URL}/auth/v1/user with the
 *   incoming Authorization header and apikey header (SERVICE_KEY or ANON_KEY).
 * - If SUPABASE_URL is not set, middleware is a no-op (dev mode).
 */
module.exports = async function requireSupabaseAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) return res.status(401).json({ success: false, error: 'Missing Authorization header' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

    if (!SUPABASE_URL) {
      // Dev mode: accept token but don't validate
      req.supabaseUser = { id: null, note: 'dev-accepted' };
      return next();
    }

    const url = SUPABASE_URL.replace(/\/$/, '') + '/auth/v1/user';
    const headers = { Authorization: authHeader };
    if (SUPABASE_KEY) headers.apikey = SUPABASE_KEY;

    const resp = await axios.get(url, { headers, timeout: 8000 });
    if (resp.status !== 200 || !resp.data) {
      return res.status(401).json({ success: false, error: 'Invalid Supabase session' });
    }

    // Attach user info to the request
    req.supabaseUser = resp.data;
    return next();
  } catch (err) {
    console.warn('supabaseAuth error:', err.message || err);
    // If Supabase responded with 401/403, forward 401
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      return res.status(401).json({ success: false, error: 'Invalid Supabase token' });
    }
    return res.status(500).json({ success: false, error: 'Supabase auth check failed', details: err.message });
  }
};
