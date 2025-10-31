const crypto = require('crypto');

const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.VITE_ADMIN_SECRET || '';
const COOKIE_NAME = 'ace_admin';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 4; // 4 hours

function signPayload(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${header}.${body}`;
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB, bodyB, sig] = parts;
    const data = `${headerB}.${bodyB}`;
    const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url');
    if (!expected || sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(bodyB, 'base64url').toString('utf8'));
    // check exp
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

exports.login = async (req, res) => {
  try {
    const { secret } = req.body || {};
    if (!ADMIN_SECRET) return res.status(500).json({ success: false, error: 'Admin secret not configured on server' });
    if (!secret || secret !== ADMIN_SECRET) {
      return res.status(401).json({ success: false, error: 'Invalid admin secret' });
    }

    const payload = {
      role: 'admin',
      iat: Date.now(),
      exp: Date.now() + COOKIE_MAX_AGE
    };
    const token = signPayload(payload);

    const cookieOpts = [`HttpOnly`, `Path=/`, `Max-Age=${Math.floor(COOKIE_MAX_AGE/1000)}`];
    if (process.env.NODE_ENV === 'production') cookieOpts.push('Secure');
    // Optionally set SameSite
    cookieOpts.push('SameSite=Lax');

    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; ${cookieOpts.join('; ')}`);
    return res.json({ success: true });
  } catch (err) {
    console.error('admin login error', err);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
};

exports.logout = async (req, res) => {
  try {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
    return res.json({ success: true });
  } catch (err) {
    console.error('admin logout error', err);
    return res.status(500).json({ success: false, error: 'Logout failed' });
  }
};

exports.verify = verifyToken;