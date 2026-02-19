const express = require('express');
const router = express.Router();
const publicInterviewController = require('../controllers/publicInterviewController.cjs');
const firebaseAuth = require('../middleware/firebaseAuth.cjs');

// Public routes (no auth required to view interviews)
router.get('/scheduled-interviews', publicInterviewController.getPublicScheduledInterviews);
router.get('/scheduled-interviews/:interviewId', publicInterviewController.getPublicInterviewDetails);

// Protected routes (require authentication)
router.post('/scheduled-interviews/:interviewId/participate', firebaseAuth, publicInterviewController.submitInterviewParticipation);
router.get('/users/:userId/interview-history', firebaseAuth, publicInterviewController.getUserInterviewHistory);
router.get('/participations/:participationId', firebaseAuth, publicInterviewController.getUserParticipationDetails);

module.exports = router;
