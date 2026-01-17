// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * ML Service Routes
 * Routes for student performance tracking and AI-guided recommendations
 */

const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController.cjs');
const { verifyToken } = require('../middleware/firebaseAuth.cjs');

// All routes require authentication
router.use(verifyToken);

// Record student interaction with a question
router.post('/interaction', mlController.recordInteraction);

// Get performance prediction and recommendations
router.get('/prediction', mlController.getPerformancePrediction);

// Get detailed analytics
router.get('/analytics', mlController.getStudentAnalytics);

// Get dashboard summary
router.get('/dashboard', mlController.getDashboardSummary);

// Get available topics
router.get('/topics', mlController.getTopics);

// Health check
router.get('/health', mlController.healthCheck);

// Get notifications from personal AI trainer
router.get('/notifications', mlController.getNotifications);

// Mark notification as read
router.put('/notifications/:notificationId/read', mlController.markNotificationRead);

module.exports = router;
