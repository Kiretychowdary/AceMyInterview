const ScheduledInterview = require('../models/ScheduledInterview.cjs');
const InterviewParticipation = require('../models/InterviewParticipation.cjs');

// Get all public scheduled interviews (for students)
exports.getPublicScheduledInterviews = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    } else {
      // By default, show upcoming and ongoing interviews
      query.status = { $in: ['upcoming', 'ongoing'] };
    }

    const interviews = await ScheduledInterview.find(query)
      .select('-createdBy') // Don't expose admin info to students
      .sort({ scheduledDate: 1, startTime: 1 });

    // Update status for each interview
    for (let interview of interviews) {
      interview.updateStatus();
      await interview.save();
    }

    // Separate into upcoming and ongoing
    const upcomingInterviews = interviews.filter(i => i.status === 'upcoming');
    const ongoingInterviews = interviews.filter(i => i.status === 'ongoing');

    res.json({
      success: true,
      interviews: {
        upcoming: upcomingInterviews,
        ongoing: ongoingInterviews
      }
    });
  } catch (error) {
    console.error('Get public scheduled interviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduled interviews'
    });
  }
};

// Get single scheduled interview details (public)
exports.getPublicInterviewDetails = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const interview = await ScheduledInterview.findOne({ interviewId })
      .select('-createdBy');

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Update status
    interview.updateStatus();
    await interview.save();

    res.json({
      success: true,
      interview
    });
  } catch (error) {
    console.error('Get public interview details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interview details'
    });
  }
};

// Submit interview participation (after completing interview)
exports.submitInterviewParticipation = async (req, res) => {
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
      completedAt
    } = req.body;

    // Validation
    if (!userId || !userName || !userEmail || !transcript) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Find the scheduled interview
    const scheduledInterview = await ScheduledInterview.findOne({ interviewId });

    if (!scheduledInterview) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled interview not found'
      });
    }

    // Create participation record
    const participation = new InterviewParticipation({
      scheduledInterviewId: scheduledInterview._id,
      interviewId: scheduledInterview.interviewId,
      userId,
      userName,
      userEmail,
      interviewType: scheduledInterview.interviewType,
      topics: scheduledInterview.topics,
      companyName: scheduledInterview.companyName,
      totalQuestions: totalQuestions || scheduledInterview.numberOfQuestions,
      questionsAnswered: questionsAnswered || 0,
      score: score || 0,
      maxScore: maxScore || 100,
      transcript,
      overallFeedback: overallFeedback || {},
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      status: 'completed'
    });

    await participation.save();

    res.status(201).json({
      success: true,
      message: 'Interview participation recorded successfully',
      participation: {
        id: participation._id,
        score: participation.score,
        percentageScore: participation.percentageScore,
        duration: participation.duration
      }
    });
  } catch (error) {
    console.error('Submit interview participation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record interview participation: ' + error.message
    });
  }
};

// Get user's interview history
exports.getUserInterviewHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const participations = await InterviewParticipation.find({ userId })
      .populate('scheduledInterviewId', 'interviewName scheduledDate')
      .sort({ completedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      participations
    });
  } catch (error) {
    console.error('Get user interview history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interview history'
    });
  }
};

// Get specific participation details (for user to view their results)
exports.getUserParticipationDetails = async (req, res) => {
  try {
    const { participationId } = req.params;
    const { userId } = req.query;

    const participation = await InterviewParticipation.findById(participationId)
      .populate('scheduledInterviewId', 'interviewName scheduledDate interviewType topics companyName');

    if (!participation) {
      return res.status(404).json({
        success: false,
        error: 'Participation record not found'
      });
    }

    // Verify user owns this participation
    if (userId && participation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    res.json({
      success: true,
      participation
    });
  } catch (error) {
    console.error('Get user participation details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participation details'
    });
  }
};
