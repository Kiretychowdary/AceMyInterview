// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * Agentic AI Routes
 * Conversational AI that actively guides users
 */

const express = require('express');
const router = express.Router();
const agenticAIController = require('../controllers/agenticAIController.cjs');
const { verifyToken } = require('../middleware/firebaseAuth.cjs');

// All routes require authentication
router.use(verifyToken);

// Get or create chat session
router.get('/session', agenticAIController.getChatSession);

// Send message to AI
router.post('/chat', agenticAIController.sendMessage);

// Get proactive suggestion
router.get('/suggestion', agenticAIController.getProactiveSuggestion);

// Get chat history
router.get('/history', agenticAIController.getChatHistory);

module.exports = router;
