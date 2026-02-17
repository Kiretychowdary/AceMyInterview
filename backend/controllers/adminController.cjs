const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.cjs');
const CustomInterview = require('../models/CustomInterview.cjs');

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
    if (process.env.NODE_ENV === 'production') {
      cookieOpts.push('Secure');
      cookieOpts.push('SameSite=None');
    } else {
      cookieOpts.push('SameSite=Lax');
    }

    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; ${cookieOpts.join('; ')}`);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Admin account created successfully',
      token,
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
    if (process.env.NODE_ENV === 'production') {
      cookieOpts.push('Secure');
      cookieOpts.push('SameSite=None');
    } else {
      cookieOpts.push('SameSite=Lax');
    }

    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; ${cookieOpts.join('; ')}`);
    
    return res.json({ 
      success: true,
      message: 'Login successful',
      token,
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

// ==================== CUSTOM INTERVIEW MANAGEMENT ====================

// Create a new custom interview with unique ID
exports.createCustomInterview = async (req, res) => {
  try {
    const {
      title,
      description,
      role,
      difficulty,
      duration,
      numberOfQuestions,
      customQuestions,
      settings,
      accessType,
      expiresAt
    } = req.body;

    // Validation
    if (!title || !role) {
      return res.status(400).json({
        success: false,
        error: 'Title and role are required'
      });
    }

    // Create interview
    const interview = new CustomInterview({
      title,
      description,
      role,
      difficulty: difficulty || 'medium',
      duration: duration || 30,
      numberOfQuestions: numberOfQuestions || 5,
      customQuestions: customQuestions || [],
      settings: settings || {},
      accessType: accessType || 'public',
      expiresAt: expiresAt || null,
      createdBy: req.admin.id
    });

    await interview.save();

    console.log('✅ Custom interview created:', interview.interviewId);

    return res.status(201).json({
      success: true,
      message: 'Interview created successfully',
      interview: {
        id: interview._id,
        interviewId: interview.interviewId,
        title: interview.title,
        interviewLink: interview.interviewLink,
        fullLink: `${req.protocol}://${req.get('host')}${interview.interviewLink}`
      }
    });

  } catch (error) {
    console.error('❌ Error creating custom interview:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Failed to create interview',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all interviews created by admin
exports.getMyInterviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { createdBy: req.admin.id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const interviews = await CustomInterview.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await CustomInterview.countDocuments(query);

    return res.status(200).json({
      success: true,
      interviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching interviews:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch interviews'
    });
  }
};

// Get single interview details
exports.getInterviewDetails = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await CustomInterview.findOne({
      interviewId,
      createdBy: req.admin.id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    return res.status(200).json({
      success: true,
      interview
    });

  } catch (error) {
    console.error('❌ Error fetching interview details:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch interview details'
    });
  }
};

// Update interview
exports.updateInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const updates = req.body;

    // Prevent updating certain fields
    delete updates.interviewId;
    delete updates.createdBy;
    delete updates.createdAt;
    delete updates.totalAttempts;
    delete updates.completedAttempts;

    const interview = await CustomInterview.findOneAndUpdate(
      { interviewId, createdBy: req.admin.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      interview
    });

  } catch (error) {
    console.error('❌ Error updating interview:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update interview'
    });
  }
};

// Delete interview
exports.deleteInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await CustomInterview.findOneAndDelete({
      interviewId,
      createdBy: req.admin.id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interview deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting interview:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete interview'
    });
  }
};

// Toggle interview status (active/closed)
exports.toggleInterviewStatus = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await CustomInterview.findOne({
      interviewId,
      createdBy: req.admin.id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    interview.status = interview.status === 'active' ? 'closed' : 'active';
    await interview.save();

    return res.status(200).json({
      success: true,
      message: `Interview ${interview.status}`,
      status: interview.status
    });

  } catch (error) {
    console.error('❌ Error toggling interview status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to toggle interview status'
    });
  }
};

// Get interview analytics
exports.getInterviewAnalytics = async (req, res) => {
  try {
    const totalInterviews = await CustomInterview.countDocuments({
      createdBy: req.admin.id
    });

    const activeInterviews = await CustomInterview.countDocuments({
      createdBy: req.admin.id,
      status: 'active'
    });

    const interviews = await CustomInterview.find({
      createdBy: req.admin.id
    }).select('totalAttempts completedAttempts');

    const totalAttempts = interviews.reduce((sum, i) => sum + i.totalAttempts, 0);
    const completedAttempts = interviews.reduce((sum, i) => sum + i.completedAttempts, 0);

    return res.status(200).json({
      success: true,
      analytics: {
        totalInterviews,
        activeInterviews,
        totalAttempts,
        completedAttempts,
        completionRate: totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};