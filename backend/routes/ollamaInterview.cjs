// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION
// Routes for AI Interview Flow + MCQ Generation

const express = require('express');
const router = express.Router();
const ollamaInterviewController = require('../controllers/ollamaInterviewController.cjs');

// Health check
router.get('/health', ollamaInterviewController.checkHealth);

// Interview flow endpoints
router.post('/start', ollamaInterviewController.startInterview);           // Start interview, get first question (JSON or with optional PDF)
router.post('/submit', ollamaInterviewController.submitAnswer);            // Submit answer, get score + next question
router.post('/end', ollamaInterviewController.endInterview);               // End interview, get final report

// MCQ Generation endpoint
router.post('/generate-mcq', ollamaInterviewController.generateMCQQuestions); // Generate MCQ questions using Ollama

module.exports = router;
