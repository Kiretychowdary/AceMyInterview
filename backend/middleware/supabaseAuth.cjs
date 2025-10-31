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
    const adminSecretHeader = req.headers['x-admin-secret'] || req.headers['x-admin-token'];
    // Accept server-side cookie based admin JWT (ace_admin)
    const cookieHeader = req.headers['cookie'] || '';
    const adminTokenFromCookie = (cookieHeader || '').split(';').map(s => s.trim()).find(s => s.startsWith('ace_admin='));
    const adminToken = adminTokenFromCookie ? adminTokenFromCookie.split('=')[1] : null;

    // helper to verify ace_admin token without importing heavy libs
    const adminCtrl = require('../controllers/adminController.cjs');
    if (adminToken) {
      const payload = adminCtrl.verify(adminToken);
      if (payload) {
        req.supabaseUser = { id: 'admin', role: 'admin', note: 'cookie-admin' };
        return next();
      }
    }

    // Allow an admin secret header to authenticate admin users (local/dev convenience).
    const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.VITE_ADMIN_SECRET;
    if (!authHeader && adminSecretHeader && ADMIN_SECRET && adminSecretHeader === ADMIN_SECRET) {
      req.supabaseUser = { id: 'admin', role: 'admin', note: 'admin-secret-auth' };
      return next();
    }
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
