const express = require('express');
const router = express.Router();
const publicInterviewController = require('../controllers/publicInterviewController.cjs');
const firebaseAuth = require('../middleware/firebaseAuth.cjs');
const CustomInterview = require('../models/CustomInterview.cjs');
const CustomInterviewParticipation = require('../models/CustomInterviewParticipation.cjs');

// Public routes (no auth required to view interviews)
router.get('/scheduled-interviews', publicInterviewController.getPublicScheduledInterviews);
router.get('/scheduled-interviews/:interviewId', publicInterviewController.getPublicInterviewDetails);

// Registration routes (require authentication)
router.post('/scheduled-interviews/:interviewId/register', firebaseAuth, publicInterviewController.registerForInterview);
router.get('/scheduled-interviews/:interviewId/registration-status', firebaseAuth, publicInterviewController.checkRegistrationStatus);
router.get('/scheduled-interviews/:interviewId/registrations', publicInterviewController.getInterviewRegistrations);
router.get('/users/:userId/registrations', firebaseAuth, publicInterviewController.getUserRegistrations);

// Protected routes (require authentication)
router.post('/scheduled-interviews/:interviewId/participate', firebaseAuth, publicInterviewController.submitInterviewParticipation);
router.get('/users/:userId/interview-history', firebaseAuth, publicInterviewController.getUserInterviewHistory);
router.get('/participations/:participationId', firebaseAuth, publicInterviewController.getUserParticipationDetails);

// Custom Interview Public Routes
// Get all active custom interviews (for public listing in contests page)
router.get('/custom-interviews', async (req, res) => {
  try {
    const interviews = await CustomInterview.find({
      status: 'active',
      $or: [
        { expiresAt: null },
        { expiresAt: { $gte: new Date() } }
      ]
    })
    .select('-createdBy -__v')
    .sort({ createdAt: -1 });

    return res.json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Error fetching public interviews:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch interviews'
    });
  }
});

// Get single custom interview by ID (public access)
router.get('/custom-interviews/:interviewId', async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const interview = await CustomInterview.findOne({
      interviewId,
      status: 'active'
    }).select('-createdBy -__v');

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found or is no longer available'
      });
    }

    // Check if interview has expired
    if (interview.expiresAt && new Date() > interview.expiresAt) {
      return res.status(410).json({
        success: false,
        error: 'Interview has expired',
        expiredAt: interview.expiresAt
      });
    }

    return res.json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Error fetching interview:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch interview'
    });
  }
});

// Submit custom interview participation (after completion)
router.post('/custom-interviews/:interviewId/participate', async (req, res) => {
  try {
    const { interviewId } = req.params;
    const {
      userId,
      userName,
      userEmail,
      totalQuestions,
      questionsAnswered,
      score,
      maxScore,
      transcript,
      overallFeedback,
      startedAt,
      completedAt,
      status
    } = req.body;

    // Verify interview exists and is active
    const interview = await CustomInterview.findOne({
      interviewId,
      status: 'active'
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found or is no longer active'
      });
    }

    // Check if user has already participated (prevent duplicates)
    if (userId && userId !== 'guest') {
      const existingParticipation = await CustomInterviewParticipation.findOne({
        interviewId,
        userId
      });

      if (existingParticipation) {
        return res.status(409).json({
          success: false,
          error: 'You have already participated in this interview',
          participation: {
            id: existingParticipation._id,
            score: existingParticipation.score,
            completedAt: existingParticipation.completedAt
          }
        });
      }
    }

    // Create participation record
    const participation = new CustomInterviewParticipation({
      interviewId,
      userId,
      userName,
      userEmail,
      interviewTitle: interview.title,
      role: interview.role,
      difficulty: interview.difficulty,
      totalQuestions,
      questionsAnswered,
      score,
      maxScore,
      transcript,
      overallFeedback,
      startedAt,
      completedAt,
      status
    });

    await participation.save();

    // Update interview statistics
    interview.totalAttempts = (interview.totalAttempts || 0) + 1;
    if (status === 'completed') {
      interview.completedAttempts = (interview.completedAttempts || 0) + 1;
    }
    await interview.save();

    // Emit Socket.IO event for real-time admin updates
    try {
      const app = require('../server.js');
      const io = app.locals?.io;
      if (io) {
        io.to(`interview:${interviewId}`).emit('new-participation', {
          interviewId,
          participation: {
            id: participation._id,
            userName,
            userEmail,
            score,
            percentageScore: participation.percentageScore,
            status,
            completedAt
          }
        });
        console.log('📡 Real-time update sent to admin for interview:', interviewId);
      }
    } catch (ioError) {
      console.warn('⚠️  Socket.IO update failed:', ioError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Interview participation recorded successfully',
      participation: {
        id: participation._id,
        score: participation.score,
        percentageScore: participation.percentageScore
      }
    });

  } catch (error) {
    console.error('Error recording interview participation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to record participation'
    });
  }
});

// Check if user has already participated in custom interview
router.get('/custom-interviews/:interviewId/check-participation/:userId', async (req, res) => {
  try {
    const { interviewId, userId } = req.params;

    const participation = await CustomInterviewParticipation.findOne({
      interviewId,
      userId
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      hasParticipated: !!participation,
      participation: participation ? {
        status: participation.status,
        score: participation.score,
        percentageScore: participation.percentageScore,
        completedAt: participation.completedAt
      } : null
    });

  } catch (error) {
    console.error('Error checking participation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check participation'
    });
  }
});

module.exports = router;
