const jwt = require('jsonwebtoken');

// Middleware to verify admin JWT token
const verifyAdminToken = (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies?.ace_admin_token || 
                  (req.headers.authorization?.startsWith('Bearer ') 
                    ? req.headers.authorization.substring(7) 
                    : null);

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access denied. Admin authentication required.' 
      });
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SECRET || 'NMKRSPVLIDATA_JWT_SECRET';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach admin info to request
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Admin JWT verification error:', error.message);
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired admin token' 
    });
  }
};

module.exports = verifyAdminToken;
