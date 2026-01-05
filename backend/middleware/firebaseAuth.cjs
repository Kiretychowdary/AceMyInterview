/**
 * Middleware to validate Firebase ID tokens.
 *
 * Behavior:
 * - If Firebase Admin SDK is configured, validates Firebase ID tokens from Authorization header
 * - If not configured, middleware is a no-op (dev mode)
 * - Also supports admin authentication via admin secret or JWT tokens
 */

let admin;
try {
  admin = require('firebase-admin');
} catch (e) {
  console.warn('⚠️ firebase-admin not installed, Firebase auth will be disabled');
}

// Initialize Firebase Admin SDK if credentials are available
let firebaseApp;
let isFirebaseInitialized = false;

function initializeFirebase() {
  if (isFirebaseInitialized || !admin) return;
  
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;
    
    if (serviceAccount) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      isFirebaseInitialized = true;
      console.log('✅ Firebase Admin SDK initialized');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Alternative: Use application default credentials
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      isFirebaseInitialized = true;
      console.log('✅ Firebase Admin SDK initialized with default credentials');
    }
  } catch (error) {
    console.warn('⚠️ Firebase Admin SDK initialization failed:', error.message);
  }
}

// Try to initialize on module load
initializeFirebase();

module.exports = async function requireFirebaseAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const adminSecretHeader = req.headers['x-admin-secret'] || req.headers['x-admin-token'];
    
    // Accept server-side cookie based admin JWT (ace_admin)
    const cookieHeader = req.headers['cookie'] || '';
    const adminTokenFromCookie = (cookieHeader || '').split(';').map(s => s.trim()).find(s => s.startsWith('ace_admin='));
    const adminToken = adminTokenFromCookie ? adminTokenFromCookie.split('=')[1] : null;

    // Verify admin token from cookie
    const adminCtrl = require('../controllers/adminController.cjs');
    if (adminToken) {
      const payload = adminCtrl.verify(adminToken);
      if (payload) {
        req.firebaseUser = { uid: 'admin', role: 'admin', note: 'cookie-admin' };
        return next();
      }
    }

    // Allow an admin secret header to authenticate admin users (local/dev convenience)
    const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.VITE_ADMIN_SECRET;
    if (!authHeader && adminSecretHeader && ADMIN_SECRET && adminSecretHeader === ADMIN_SECRET) {
      req.firebaseUser = { uid: 'admin', role: 'admin', note: 'admin-secret-auth' };
      return next();
    }

    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Missing Authorization header' });
    }

    // Dev mode: If Firebase is not initialized, accept token but don't validate
    if (!isFirebaseInitialized || !admin) {
      console.warn('⚠️ Firebase not initialized, accepting token without validation (dev mode)');
      req.firebaseUser = { uid: null, note: 'dev-accepted' };
      return next();
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Attach user info to the request
      req.firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        firebase: decodedToken
      };
      
      return next();
    } catch (error) {
      console.warn('Firebase token verification failed:', error.message);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid Firebase token',
        details: error.message 
      });
    }
  } catch (err) {
    console.error('Firebase auth middleware error:', err.message || err);
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication check failed', 
      details: err.message 
    });
  }
};
