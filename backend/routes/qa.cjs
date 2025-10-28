const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/qaController.cjs');

router.post('/store-mcq-session', ctrl.storeMcqSession);
router.post('/store-coding-session', ctrl.storeCodingSession);
router.post('/store-qa', ctrl.storeQa);
router.get('/qa-history/:userId', ctrl.getQaHistory);
router.get('/session/:sessionId', ctrl.getSession);
router.get('/qa-analytics', ctrl.getAnalytics);

module.exports = router;
