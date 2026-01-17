// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * ENHANCED AGENTIC AI ROUTES
 * Multi-agent system endpoints
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/firebaseAuth.cjs');
const agenticController = require('../controllers/enhancedAgenticController.cjs');

// Autonomous guidance endpoint
router.get('/guidance', verifyToken, agenticController.autonomousGuidance);

// Get personalized learning plan
router.get('/plan', verifyToken, agenticController.getLearningPlan);

// Get performance analysis and report
router.get('/performance', verifyToken, agenticController.getPerformanceAnalysis);

// Evaluate user answer
router.post('/evaluate', verifyToken, agenticController.evaluateAnswer);

// Check readiness to progress
router.get('/readiness', verifyToken, agenticController.checkReadiness);

// Enhanced chat with multi-agent system
router.post('/chat', verifyToken, agenticController.agenticChat);

module.exports = router;
