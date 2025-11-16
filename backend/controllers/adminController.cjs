const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.cjs');

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SECRET || 'NMKRSPVLIDATA_JWT_SECRET';
const COOKIE_NAME = 'ace_admin_token';
const TOKEN_EXPIRES_IN = '7d'; // 7 days
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Admin Signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide username, email, password, and confirm password' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Passwords do not match' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username }] 
    });
    
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        error: 'Admin with this email or username already exists' 
      });
    }

    // Create new admin
    const admin = new Admin({
      username,
      email: email.toLowerCase(),
      password,
      role: 'admin'
    });

    await admin.save();

    // Generate token
    const token = generateToken({
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    });

    // Set cookie
    const cookieOpts = [`HttpOnly`, `Path=/`, `Max-Age=${Math.floor(COOKIE_MAX_AGE/1000)}`];
    if (process.env.NODE_ENV === 'production') cookieOpts.push('Secure');
    cookieOpts.push('SameSite=Lax');

    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; ${cookieOpts.join('; ')}`);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Admin account created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('admin signup error', err);
    return res.status(500).json({ success: false, error: 'Signup failed' });
  }
};

// Admin Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide email and password' 
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken({
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    });

    // Set cookie
    const cookieOpts = [`HttpOnly`, `Path=/`, `Max-Age=${Math.floor(COOKIE_MAX_AGE/1000)}`];
    if (process.env.NODE_ENV === 'production') cookieOpts.push('Secure');
    cookieOpts.push('SameSite=Lax');

    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; ${cookieOpts.join('; ')}`);
    
    return res.json({ 
      success: true,
      message: 'Login successful',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (err) {
    console.error('admin login error', err);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// Admin Logout
exports.logout = async (req, res) => {
  try {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('admin logout error', err);
    return res.status(500).json({ success: false, error: 'Logout failed' });
  }
};

// Get current admin info
exports.getProfile = async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    const admin = await Admin.findById(decoded.id);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, error: 'Admin not found or inactive' });
    }

    return res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });
  } catch (err) {
    console.error('get profile error', err);
    return res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
};

// Middleware to verify admin token
exports.verifyAdmin = (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Access denied. Invalid token.' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    console.error('verify admin error', err);
    return res.status(500).json({ success: false, error: 'Token verification failed' });
  }
};

exports.verify = verifyToken;