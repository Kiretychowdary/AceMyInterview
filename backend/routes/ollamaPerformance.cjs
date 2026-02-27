// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * ML Service Routes
 * Routes for student performance tracking and AI-guided recommendations
 */

const express = require('express');
const router = express.Router();
const ollamaPerformanceController = require('../controllers/ollamaPerformanceController.cjs');
const { verifyToken } = require('../middleware/firebaseAuth.cjs');

// All routes require authentication
router.use(verifyToken);

// Record student interaction with a question
router.post('/interaction', ollamaPerformanceController.recordInteraction);

// Get performance prediction and recommendations
router.get('/prediction', ollamaPerformanceController.getPerformancePrediction);

// Get detailed analytics
router.get('/analytics', ollamaPerformanceController.getStudentAnalytics);

// Get dashboard summary
router.get('/dashboard', ollamaPerformanceController.getDashboardSummary);

// Get available topics
router.get('/topics', ollamaPerformanceController.getTopics);

// Health check
router.get('/health', ollamaPerformanceController.healthCheck);

// Get notifications from personal AI trainer
router.get('/notifications', ollamaPerformanceController.getNotifications);

// Mark notification as read
router.put('/notifications/:notificationId/read', ollamaPerformanceController.markNotificationRead);

module.exports = router;
