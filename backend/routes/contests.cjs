const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contestsController.cjs');
const requireSupabaseAuth = require('../middleware/supabaseAuth.cjs');

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

// Protected: create, update, delete
router.post('/', requireSupabaseAuth, ctrl.createContest);
router.put('/:id', requireSupabaseAuth, ctrl.updateContest);
router.delete('/:id', requireSupabaseAuth, ctrl.deleteContest);

// Protected: update problems array
router.put('/:id/problems', requireSupabaseAuth, ctrl.updateProblems);

// Protected: publish/unpublish contest
router.put('/:id/publish', requireSupabaseAuth, ctrl.publishContest);

// User: register for contest (requires Supabase auth)
router.post('/:id/register', requireSupabaseAuth, ctrl.registerForContest);

// User: unregister from contest (requires auth)
router.delete('/:id/register', requireSupabaseAuth, ctrl.unregisterFromContest);

// User: get registered contests
router.get('/user/:userId/registrations', ctrl.getUserRegistrations);

module.exports = router;
