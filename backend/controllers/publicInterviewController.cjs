const ScheduledInterview = require('../models/ScheduledInterview.cjs');
const InterviewParticipation = require('../models/InterviewParticipation.cjs');
const InterviewRegistration = require('../models/InterviewRegistration.cjs');

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

    console.log(`📅 Found ${interviews.length} interviews before status update`);

    // Update status for each interview
    for (let interview of interviews) {
      const oldStatus = interview.status;
      interview.updateStatus();
      if (oldStatus !== interview.status) {
        console.log(`🔄 Interview "${interview.interviewName}" status changed: ${oldStatus} -> ${interview.status}`);
        await interview.save();
      }
    }

    // Re-fetch to get all interviews regardless of status, then categorize
    const allInterviews = await ScheduledInterview.find({})
      .select('-createdBy')
      .sort({ availableFromDate: 1, scheduledDate: 1 });

    // Update status for all interviews
    for (let interview of allInterviews) {
      interview.updateStatus();
      await interview.save();
    }

    // Separate into upcoming and ongoing
    const upcomingInterviews = allInterviews.filter(i => i.status === 'upcoming');
    const ongoingInterviews = allInterviews.filter(i => i.status === 'ongoing');

    console.log(`✅ Returning: ${upcomingInterviews.length} upcoming, ${ongoingInterviews.length} ongoing`);

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

    // Update registration status to mark as attended
    const registration = await InterviewRegistration.findOne({
      userId,
      interviewId
    });

    if (registration) {
      registration.hasAttended = true;
      registration.attendedAt = new Date(startedAt) || new Date();
      registration.participationId = participation._id;
      await registration.save();
    }

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

// Register for an interview
exports.registerForInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { userId, userName, userEmail } = req.body;

    // Validation
    if (!userId || !userName || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Please provide userId, userName, and userEmail'
      });
    }

    // Find the scheduled interview
    const scheduledInterview = await ScheduledInterview.findOne({ interviewId });

    if (!scheduledInterview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Update interview status
    scheduledInterview.updateStatus();
    await scheduledInterview.save();

    // Check if interview is available for registration
    if (scheduledInterview.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'This interview has already ended'
      });
    }

    if (scheduledInterview.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'This interview has been cancelled'
      });
    }

    // Check if user is already registered
    const existingRegistration = await InterviewRegistration.findOne({
      userId,
      interviewId
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        error: 'You are already registered for this interview',
        registration: existingRegistration
      });
    }

    // Create registration
    const registration = new InterviewRegistration({
      scheduledInterviewId: scheduledInterview._id,
      interviewId: scheduledInterview.interviewId,
      userId,
      userName,
      userEmail,
      registeredAt: new Date()
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the interview!',
      registration: {
        id: registration._id,
        interviewId: registration.interviewId,
        registeredAt: registration.registeredAt
      }
    });
  } catch (error) {
    console.error('Register for interview error:', error);
    
    // Handle duplicate registration error (from unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You are already registered for this interview'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to register for interview: ' + error.message
    });
  }
};

// Check registration status
exports.checkRegistrationStatus = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const registration = await InterviewRegistration.findOne({
      userId,
      interviewId
    });

    res.json({
      success: true,
      isRegistered: !!registration,
      registration: registration || null
    });
  } catch (error) {
    console.error('Check registration status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check registration status'
    });
  }
};

// Get interview registrations (for a specific interview)
exports.getInterviewRegistrations = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const registrations = await InterviewRegistration.find({ interviewId })
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    console.error('Get interview registrations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registrations'
    });
  }
};

// Get user's registrations
exports.getUserRegistrations = async (req, res) => {
  try {
    const { userId } = req.params;

    const registrations = await InterviewRegistration.find({ userId })
      .populate('scheduledInterviewId', 'interviewName scheduledDate availableFromDate availableToDate startTime endTime status')
      .sort({ registeredAt: -1 });

    res.json({
      success: true,
      registrations
    });
  } catch (error) {
    console.error('Get user registrations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user registrations'
    });
  }
};

