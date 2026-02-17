// NMKRSPVLIDATA - AI Interview Routes
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aiInterviewController.cjs');

// Health check for Ollama integration
router.get('/health', ctrl.checkOllamaHealth);

// POST /api/ai/generate-interview-questions - Generate interview questions
router.post('/generate-interview-questions', ctrl.generateInterviewQuestions);

// POST /api/ai/evaluate-answer - Evaluate user's answer
router.post('/evaluate-answer', ctrl.evaluateAnswer);

// POST /api/ai/generate-interview-report - Generate final interview report
router.post('/generate-interview-report', ctrl.generateInterviewReport);

module.exports = router;
