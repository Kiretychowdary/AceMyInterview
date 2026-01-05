const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/submissionsController.cjs');
const requireAuth = require('../middleware/firebaseAuth.cjs');

// POST /api/submissions -> create a submission (requires Firebase auth token)
router.post('/', requireAuth, ctrl.createSubmission);

// GET /api/submissions -> list (optional query: contestId, skip, limit)
router.get('/', ctrl.listSubmissions);

// GET /api/submissions/contest/:contestId/user/:userId -> get user's submissions for a contest
router.get('/contest/:contestId/user/:userId', ctrl.getUserContestSubmissions);

// GET /api/submissions/status/:userId/:contestId/:problemId -> get problem submission status
router.get('/status/:userId/:contestId/:problemId', ctrl.getProblemSubmissionStatus);

// GET /api/submissions/:id -> get by id
router.get('/:id', ctrl.getSubmission);

module.exports = router;
