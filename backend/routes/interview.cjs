// NMKRSPVLIDATA - Interview Storage Route
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Interview Session Schema
const InterviewSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  interviewType: { type: String, default: 'face-to-face' },
  
  // Timing data
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  timeSpent: { type: Number, required: true }, // in seconds
  
  // Questions and answers
  totalQuestions: { type: Number, required: true },
  answeredQuestions: { type: Number, required: true },
  questions: [{
    question: String,
    category: String,
    expectedPoints: [String],
    followUp: String
  }],
  answers: [{
    questionIndex: Number,
    question: String,
    answer: String,
    category: String,
    timestamp: Date,
    timeSpent: Number
  }],
  
  // Assessment data
  assessment: {
    overallScore: Number,
    summary: String,
    categoryScores: {
      technical: Number,
      communication: Number,
      problemSolving: Number,
      experience: Number
    },
    strengths: [String],
    improvements: [String],
    detailedFeedback: String,
    nextSteps: [String],
    interviewReadiness: String
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const InterviewSession = mongoose.model('InterviewSession', InterviewSessionSchema);

// Store interview session
router.post('/store-session', async (req, res) => {
  try {
    console.log('📝 Storing interview session...');
    
    const sessionData = req.body;
    
    // Validate required fields
    if (!sessionData.sessionId || !sessionData.userId || !sessionData.topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, userId, or topic'
      });
    }

    // Create new interview session
    const interviewSession = new InterviewSession({
      ...sessionData,
      updatedAt: new Date()
    });

    await interviewSession.save();
    
    console.log('✅ Interview session stored successfully');
    console.log(`📊 Session ID: ${sessionData.sessionId}`);
    console.log(`👤 User: ${sessionData.userId}`);
    console.log(`📚 Topic: ${sessionData.topic}`);
    console.log(`⏱️  Duration: ${sessionData.timeSpent}s`);
    
    res.json({
      success: true,
      message: 'Interview session stored successfully',
      sessionId: sessionData.sessionId,
      data: {
        totalQuestions: sessionData.totalQuestions,
        answeredQuestions: sessionData.answeredQuestions,
        timeSpent: sessionData.timeSpent,
        overallScore: sessionData.assessment?.overallScore
      }
    });

  } catch (error) {
    console.error('❌ Error storing interview session:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to store interview session',
      details: error.message
    });
  }
});

// Get user's interview history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const sessions = await InterviewSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('sessionId topic difficulty duration overallScore createdAt timeSpent answeredQuestions totalQuestions');

    const total = await InterviewSession.countDocuments({ userId });

    res.json({
      success: true,
      sessions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (error) {
    console.error('❌ Error fetching interview history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interview history'
    });
  }
});

// Get specific interview session details
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }

    res.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('❌ Error fetching interview session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interview session'
    });
  }
});

// Get interview analytics for a user
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Aggregate data
    const analytics = await InterviewSession.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          averageScore: { $avg: '$assessment.overallScore' },
          totalTimeSpent: { $sum: '$timeSpent' },
          topicsCount: { $addToSet: '$topic' },
          difficultyBreakdown: {
            $push: {
              difficulty: '$difficulty',
              score: '$assessment.overallScore'
            }
          }
        }
      }
    ]);

    const result = analytics[0] || {
      totalInterviews: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      topicsCount: [],
      difficultyBreakdown: []
    };

    // Calculate difficulty stats
    const difficultyStats = {};
    result.difficultyBreakdown.forEach(item => {
      if (!difficultyStats[item.difficulty]) {
        difficultyStats[item.difficulty] = { count: 0, totalScore: 0 };
      }
      difficultyStats[item.difficulty].count++;
      difficultyStats[item.difficulty].totalScore += item.score || 0;
    });

    Object.keys(difficultyStats).forEach(difficulty => {
      difficultyStats[difficulty].averageScore = 
        difficultyStats[difficulty].totalScore / difficultyStats[difficulty].count;
    });

    res.json({
      success: true,
      analytics: {
        totalInterviews: result.totalInterviews,
        averageScore: Math.round((result.averageScore || 0) * 10) / 10,
        totalTimeSpent: result.totalTimeSpent,
        uniqueTopics: result.topicsCount.length,
        difficultyStats,
        totalHours: Math.round((result.totalTimeSpent / 3600) * 10) / 10
      }
    });

  } catch (error) {
    console.error('❌ Error fetching interview analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interview analytics'
    });
  }
});

// Update interview session with assessment
router.put('/update-assessment/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { assessment } = req.body;

    const updatedSession = await InterviewSession.findOneAndUpdate(
      { sessionId },
      { 
        assessment,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedSession) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }

    res.json({
      success: true,
      message: 'Assessment updated successfully',
      session: updatedSession
    });

  } catch (error) {
    console.error('❌ Error updating assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update assessment'
    });
  }
});

module.exports = router;