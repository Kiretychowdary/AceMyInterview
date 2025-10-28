const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contestsController.cjs');
const requireSupabaseAuth = require('../middleware/supabaseAuth.cjs');

// Public: list contests
router.get('/', ctrl.listContests);

// Public: check contest id uniqueness
router.get('/check-id', ctrl.checkId);

// Public: get by id
router.get('/:id', ctrl.getContest);

// Protected: create, update, delete
router.post('/', requireSupabaseAuth, ctrl.createContest);
router.put('/:id', requireSupabaseAuth, ctrl.updateContest);
router.delete('/:id', requireSupabaseAuth, ctrl.deleteContest);

// Protected: update problems array
router.put('/:id/problems', requireSupabaseAuth, ctrl.updateProblems);

module.exports = router;
