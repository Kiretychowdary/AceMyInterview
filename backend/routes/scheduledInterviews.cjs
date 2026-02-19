const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth.cjs');
const scheduledInterviewController = require('../controllers/scheduledInterviewController.cjs');

// All routes require admin authentication
router.use(adminAuth);

// Scheduled Interview CRUD
router.post('/scheduled-interviews', scheduledInterviewController.createScheduledInterview);
router.get('/scheduled-interviews', scheduledInterviewController.getScheduledInterviews);
router.get('/scheduled-interviews/analytics', scheduledInterviewController.getScheduledInterviewsAnalytics);
router.get('/scheduled-interviews/:interviewId', scheduledInterviewController.getScheduledInterviewById);
router.put('/scheduled-interviews/:interviewId', scheduledInterviewController.updateScheduledInterview);
router.delete('/scheduled-interviews/:interviewId', scheduledInterviewController.deleteScheduledInterview);

// Participation/Analytics
router.get('/scheduled-interviews/:interviewId/participations', scheduledInterviewController.getInterviewParticipations);
router.get('/participations/:participationId', scheduledInterviewController.getParticipationDetails);

module.exports = router;
