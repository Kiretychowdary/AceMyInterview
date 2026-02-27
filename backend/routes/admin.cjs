const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController.cjs');

// Public routes
router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/interviews/public/:interviewId', ctrl.getPublicInterviewDetails);

// Protected routes
router.get('/profile', ctrl.verifyAdmin, ctrl.getProfile);

// Custom Interview Management Routes
router.post('/interviews', ctrl.verifyAdmin, ctrl.createCustomInterview);
router.get('/interviews', ctrl.verifyAdmin, ctrl.getMyInterviews);
router.get('/interviews/analytics', ctrl.verifyAdmin, ctrl.getInterviewAnalytics);
router.get('/interviews/:interviewId', ctrl.verifyAdmin, ctrl.getInterviewDetails);
router.get('/interviews/:interviewId/participations', ctrl.verifyAdmin, ctrl.getInterviewParticipations);
router.get('/interviews/:interviewId/download', ctrl.verifyAdmin, ctrl.downloadInterviewParticipations);
router.put('/interviews/:interviewId', ctrl.verifyAdmin, ctrl.updateInterview);
router.delete('/interviews/:interviewId', ctrl.verifyAdmin, ctrl.deleteInterview);
router.patch('/interviews/:interviewId/toggle', ctrl.verifyAdmin, ctrl.toggleInterviewStatus);

module.exports = router;
