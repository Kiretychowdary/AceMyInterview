/**
 * Avatar Routes - Real-time AI Avatar with SadTalker
 * Routes for generating talking head videos with lip sync
 */

const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatarController.cjs');
const multer = require('multer');
const path = require('path');

// Configure multer for avatar image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'temp', 'avatars');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png)'));
    }
  }
});

// Initialize avatar
router.post('/initialize', avatarController.initializeAvatar);

// Generate avatar video from text/audio
router.post('/generate', avatarController.generateAvatarVideo);

// Quick generation for real-time use
router.post('/quick-generate', avatarController.quickGenerateAvatar);

// Stream avatar video
router.get('/stream/:videoId', avatarController.streamAvatarVideo);

// Batch generate multiple avatars
router.post('/batch-generate', avatarController.batchGenerateAvatars);

// Upload custom avatar image
router.post('/upload-image', upload.single('avatar'), avatarController.uploadAvatarImage);

// Get default avatar
router.get('/default-avatar', avatarController.getDefaultAvatar);

// Health check
router.get('/health', avatarController.avatarServiceHealth);

module.exports = router;
