const ScheduledInterview = require('../models/ScheduledInterview.cjs');
const InterviewParticipation = require('../models/InterviewParticipation.cjs');
const InterviewRegistration = require('../models/InterviewRegistration.cjs');

// Create a new scheduled interview
exports.createScheduledInterview = async (req, res) => {
  try {
    const {
      interviewName,
      scheduledDate,
      startTime,
      endTime,
      availableFromDate,
      availableFromTime,
      availableToDate,
      availableToTime,
      duration,
      interviewType,
      topics,
      companyName,
      difficulty,
      numberOfQuestions,
      description
    } = req.body;

    // Validation - support both old and new formats
    if (!interviewName || !interviewType) {
      return res.status(400).json({
        success: false,
        error: 'Please provide interviewName and interviewType'
      });
    }

    // Check if using new flexible timing or legacy timing
    const useFlexibleTiming = availableFromDate && availableFromTime && availableToDate && availableToTime;
    const useLegacyTiming = scheduledDate && startTime && endTime;

    if (!useFlexibleTiming && !useLegacyTiming) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either flexible timing (availableFromDate/Time and availableToDate/Time) or legacy timing (scheduledDate, startTime, endTime)'
      });
    }

    if (interviewType === 'topic-based' && (!topics || topics.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one topic for topic-based interviews'
      });
    }

    if (interviewType === 'company-based' && !companyName) {
      return res.status(400).json({
        success: false,
        error: 'Please provide company name for company-based interviews'
      });
    }

    // Create scheduled interview
    const interviewData = {
      createdBy: req.admin._id,
      interviewName,
      duration: duration || 30,
      interviewType,
      topics: interviewType === 'topic-based' ? topics : [],
      companyName: interviewType === 'company-based' ? companyName : '',
      difficulty: difficulty || 'medium',
      numberOfQuestions: numberOfQuestions || 5,
      description: description || ''
    };

    // Add timing fields based on what was provided
    if (useFlexibleTiming) {
      interviewData.availableFromDate = new Date(availableFromDate);
      interviewData.availableFromTime = availableFromTime;
      interviewData.availableToDate = new Date(availableToDate);
      interviewData.availableToTime = availableToTime;
    } else {
      // Legacy timing
      interviewData.scheduledDate = new Date(scheduledDate);
      interviewData.startTime = startTime;
      interviewData.endTime = endTime;
    }

    const scheduledInterview = new ScheduledInterview(interviewData);

    await scheduledInterview.save();

    res.status(201).json({
      success: true,
      message: 'Scheduled interview created successfully',
      interview: scheduledInterview
    });
  } catch (error) {
    console.error('Create scheduled interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create scheduled interview: ' + error.message
    });
  }
};

// Get all scheduled interviews (with filters)
exports.getScheduledInterviews = async (req, res) => {
  try {
    const { status, interviewType } = req.query;
    
    const query = { createdBy: req.admin._id };
    
    if (status) {
      query.status = status;
    }
    
    if (interviewType) {
      query.interviewType = interviewType;
    }

    const interviews = await ScheduledInterview.find(query)
      .sort({ scheduledDate: -1, createdAt: -1 });

    // Update status for each interview
    for (let interview of interviews) {
      interview.updateStatus();
      await interview.save();
    }

    res.json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Get scheduled interviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduled interviews'
    });
  }
};

// Get single scheduled interview by ID
exports.getScheduledInterviewById = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const interview = await ScheduledInterview.findOne({ interviewId })
      .populate('createdBy', 'username email');

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
    console.error('Get scheduled interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interview'
    });
  }
};

// Update scheduled interview
exports.updateScheduledInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const updates = req.body;

    const interview = await ScheduledInterview.findOne({
      interviewId,
      createdBy: req.admin._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found or unauthorized'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'interviewName', 'scheduledDate', 'startTime', 'endTime',
      'availableFromDate', 'availableFromTime', 'availableToDate', 'availableToTime',
      'duration', 'interviewType', 'topics', 'companyName',
      'difficulty', 'numberOfQuestions', 'description', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'scheduledDate' || field === 'availableFromDate' || field === 'availableToDate') {
          interview[field] = new Date(updates[field]);
        } else {
          interview[field] = updates[field];
        }
      }
    });

    await interview.save();

    res.json({
      success: true,
      message: 'Interview updated successfully',
      interview
    });
  } catch (error) {
    console.error('Update scheduled interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update interview'
    });
  }
};

// Delete scheduled interview
exports.deleteScheduledInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await ScheduledInterview.findOneAndDelete({
      interviewId,
      createdBy: req.admin._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    console.error('Delete scheduled interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete interview'
    });
  }
};

// Get interview participation/analytics
exports.getInterviewParticipations = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Verify admin owns this interview
    const interview = await ScheduledInterview.findOne({
      interviewId,
      createdBy: req.admin._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found or unauthorized'
      });
    }

    const participations = await InterviewParticipation.find({
      scheduledInterviewId: interview._id
    }).sort({ completedAt: -1 });

    // Get registrations
    const registrations = await InterviewRegistration.find({
      interviewId: interviewId
    }).sort({ registeredAt: -1 });

    // Calculate analytics
    const analytics = {
      totalRegistrations: registrations.length,
      totalParticipants: participations.length,
      attendanceRate: registrations.length > 0
        ? Math.round((participations.length / registrations.length) * 100)
        : 0,
      averageScore: participations.length > 0
        ? Math.round(participations.reduce((sum, p) => sum + p.percentageScore, 0) / participations.length)
        : 0,
      averageDuration: participations.length > 0
        ? Math.round(participations.reduce((sum, p) => sum + p.duration, 0) / participations.length)
        : 0,
      completionRate: participations.length > 0
        ? Math.round((participations.filter(p => p.status === 'completed').length / participations.length) * 100)
        : 0
    };

    res.json({
      success: true,
      registrations,
      participations,
      analytics
    });
  } catch (error) {
    console.error('Get interview participations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participations'
    });
  }
};

// Get detailed participation record
exports.getParticipationDetails = async (req, res) => {
  try {
    const { participationId } = req.params;

    const participation = await InterviewParticipation.findById(participationId)
      .populate('scheduledInterviewId');

    if (!participation) {
      return res.status(404).json({
        success: false,
        error: 'Participation record not found'
      });
    }

    // Verify admin owns this interview
    const interview = await ScheduledInterview.findOne({
      _id: participation.scheduledInterviewId,
      createdBy: req.admin._id
    });

    if (!interview) {
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
    console.error('Get participation details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participation details'
    });
  }
};

// Get overall analytics for all scheduled interviews
exports.getScheduledInterviewsAnalytics = async (req, res) => {
  try {
    const interviews = await ScheduledInterview.find({ createdBy: req.admin._id });
    const interviewIds = interviews.map(i => i._id);

    const participations = await InterviewParticipation.find({
      scheduledInterviewId: { $in: interviewIds }
    });

    const analytics = {
      totalInterviews: interviews.length,
      upcomingInterviews: interviews.filter(i => i.status === 'upcoming').length,
      ongoingInterviews: interviews.filter(i => i.status === 'ongoing').length,
      completedInterviews: interviews.filter(i => i.status === 'completed').length,
      totalParticipants: participations.length,
      averageScore: participations.length > 0
        ? Math.round(participations.reduce((sum, p) => sum + p.percentageScore, 0) / participations.length)
        : 0,
      topicBasedCount: interviews.filter(i => i.interviewType === 'topic-based').length,
      companyBasedCount: interviews.filter(i => i.interviewType === 'company-based').length
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};

// Download interview performance data (CSV format)
exports.downloadInterviewPerformanceData = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Find the interview and verify ownership
    const interview = await ScheduledInterview.findOne({
      interviewId,
      createdBy: req.admin._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found or unauthorized'
      });
    }

    // Get all participations for this interview
    const participations = await InterviewParticipation.find({
      interviewId
    }).sort({ completedAt: -1 });

    if (participations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No participation data found for this interview'
      });
    }

    // Prepare CSV data
    let csvContent = 'Participant Name,Email,Started At,Completed At,Duration (min),Total Questions,Questions Answered,Score,Percentage,Rating,Status\n';

    participations.forEach(p => {
      const duration = Math.round((new Date(p.completedAt) - new Date(p.startedAt)) / 60000);
      const rating = p.overallFeedback?.rating || 'N/A';
      
      csvContent += `"${p.userName}","${p.userEmail}","${new Date(p.startedAt).toLocaleString()}","${new Date(p.completedAt).toLocaleString()}",${duration},${p.totalQuestions},${p.questionsAnswered},${p.score},${p.percentageScore.toFixed(2)}%,"${rating}",${p.status}\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="interview-${interviewId}-performance-${Date.now()}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Download performance data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download performance data'
    });
  }
};

// Download detailed interview performance data (JSON format)
exports.downloadDetailedPerformanceData = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Find the interview and verify ownership
    const interview = await ScheduledInterview.findOne({
      interviewId,
      createdBy: req.admin._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found or unauthorized'
      });
    }

    // Get all participations with full details
    const participations = await InterviewParticipation.find({
      interviewId
    }).sort({ completedAt: -1 });

    if (participations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No participation data found for this interview'
      });
    }

    // Prepare detailed data
    const detailedData = {
      interview: {
        interviewId: interview.interviewId,
        interviewName: interview.interviewName,
        interviewType: interview.interviewType,
        topics: interview.topics,
        companyName: interview.companyName,
        difficulty: interview.difficulty,
        availableFrom: interview.availableFromDate ? new Date(interview.availableFromDate).toISOString() : null,
        availableTo: interview.availableToDate ? new Date(interview.availableToDate).toISOString() : null
      },
      totalParticipants: participations.length,
      participations: participations.map(p => ({
        userName: p.userName,
        userEmail: p.userEmail,
        startedAt: p.startedAt,
        completedAt: p.completedAt,
        durationMinutes: Math.round((new Date(p.completedAt) - new Date(p.startedAt)) / 60000),
        performance: {
          totalQuestions: p.totalQuestions,
          questionsAnswered: p.questionsAnswered,
          score: p.score,
          maxScore: p.maxScore,
          percentageScore: p.percentageScore
        },
        transcript: p.transcript,
        overallFeedback: p.overallFeedback
      }))
    };

    // Set headers for JSON download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="interview-${interviewId}-detailed-${Date.now()}.json"`);
    res.json(detailedData);

  } catch (error) {
    console.error('Download detailed performance data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download detailed performance data'
    });
  }
};
