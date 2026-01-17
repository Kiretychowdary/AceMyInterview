const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contestsController.cjs');
const requireAuth = require('../middleware/firebaseAuth.cjs');
const verifyAdminToken = require('../middleware/adminAuth.cjs');

// Public: list contests (with filters: upcoming, ongoing, completed)
router.get('/', ctrl.listContests);

// Public: get upcoming contests
router.get('/upcoming', ctrl.getUpcomingContests);

// Public: get ongoing contests
router.get('/ongoing', ctrl.getOngoingContests);

// Public: check contest id uniqueness
router.get('/check-id', ctrl.checkId);

// Public: get single problem by ID (must be before /:id routes)
router.get('/problem/:problemId', ctrl.getProblem);

// Public: get all registrations for a contest (for admin view) - BEFORE /:id
router.get('/:id/registrations', ctrl.getContestRegistrations);

// Public: get by id
router.get('/:id', ctrl.getContest);

// Public: get contest status with timing info
router.get('/:id/status', ctrl.getContestStatus);

// Public: get user progress in contest
router.get('/:id/progress/:userId', ctrl.getUserProgress);

// Public: get contest with all problems (for registered users)
router.get('/:id/problems', ctrl.getContestWithProblems);

// Public: get contest leaderboard
router.get('/:id/leaderboard', ctrl.getLeaderboard);

// Public: check registration status
router.get('/:id/registration-status/:userId', ctrl.checkRegistrationStatus);

// Protected: create, update, delete (Admin only)
router.post('/', verifyAdminToken, ctrl.createContest);
router.put('/:id', verifyAdminToken, ctrl.updateContest);
router.delete('/:id', verifyAdminToken, ctrl.deleteContest);

// Protected: update problems array (Admin only)
router.put('/:id/problems', verifyAdminToken, ctrl.updateProblems);

// Protected: publish/unpublish contest (Admin only)
router.put('/:id/publish', verifyAdminToken, ctrl.publishContest);

// User: register for contest (requires Firebase auth)
router.post('/:id/register', requireAuth, ctrl.registerForContest);

// User: unregister from contest (requires auth)
router.delete('/:id/register', requireAuth, ctrl.unregisterFromContest);

// User: get registered contests
router.get('/user/:userId/registrations', ctrl.getUserRegistrations);

// Contest Progress Tracking
router.post('/:id/progress', requireAuth, ctrl.updateProgress);
router.post('/:id/heartbeat', ctrl.updateHeartbeat); // Removed auth requirement for heartbeat
router.get('/:id/active-count', ctrl.getActiveParticipants);

module.exports = router;
