const ScheduledInterview = require('../models/ScheduledInterview.cjs');
const InterviewParticipation = require('../models/InterviewParticipation.cjs');

// Create a new scheduled interview
exports.createScheduledInterview = async (req, res) => {
  try {
    const {
      interviewName,
      scheduledDate,
      startTime,
      endTime,
      duration,
      interviewType,
      topics,
      companyName,
      difficulty,
      numberOfQuestions,
      description
    } = req.body;

    // Validation
    if (!interviewName || !scheduledDate || !startTime || !endTime || !interviewType) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: interviewName, scheduledDate, startTime, endTime, interviewType'
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
    const scheduledInterview = new ScheduledInterview({
      createdBy: req.admin._id,
      interviewName,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      duration: duration || 30,
      interviewType,
      topics: interviewType === 'topic-based' ? topics : [],
      companyName: interviewType === 'company-based' ? companyName : '',
      difficulty: difficulty || 'medium',
      numberOfQuestions: numberOfQuestions || 5,
      description: description || ''
    });

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
      'duration', 'interviewType', 'topics', 'companyName',
      'difficulty', 'numberOfQuestions', 'description', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        interview[field] = updates[field];
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

    // Calculate analytics
    const analytics = {
      totalParticipants: participations.length,
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
