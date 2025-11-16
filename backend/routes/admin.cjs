const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController.cjs');

// Public routes
router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);

// Protected routes
router.get('/profile', ctrl.verifyAdmin, ctrl.getProfile);

module.exports = router;
