const mongoose = require('mongoose');

const InterviewParticipationSchema = new mongoose.Schema({
  // Reference to scheduled interview
  scheduledInterviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduledInterview',
    required: true
  },
  
  interviewId: {
    type: String,
    required: true
  },
  
  // Student Information
  userId: {
    type: String,
    required: true
  },
  
  userName: {
    type: String,
    required: true
  },
  
  userEmail: {
    type: String,
    required: true
  },
  
  // Interview Details
  interviewType: {
    type: String,
    enum: ['topic-based', 'company-based'],
    required: true
  },
  
  // What the interview was about
  topics: {
    type: [String],
    default: []
  },
  
  companyName: {
    type: String,
    default: ''
  },
  
  // Performance Metrics
  totalQuestions: {
    type: Number,
    default: 0
  },
  
  questionsAnswered: {
    type: Number,
    default: 0
  },
  
  score: {
    type: Number,
    default: 0
  },
  
  maxScore: {
    type: Number,
    default: 100
  },
  
  percentageScore: {
    type: Number,
    default: 0
  },
  
  // Interview Transcript
  transcript: [{
    questionNumber: Number,
    aiQuestion: String,
    userAnswer: String,
    aiEvaluation: {
      score: Number,
      feedback: String,
      strengths: [String],
      improvements: [String]
    },
    timestamp: Date
  }],
  
  // Overall AI Feedback
  overallFeedback: {
    summary: String,
    strengths: [String],
    areasForImprovement: [String],
    recommendations: [String],
    rating: String // 'Excellent', 'Good', 'Average', 'Needs Improvement'
  },
  
  // Timing Information
  startedAt: {
    type: Date,
    required: true
  },
  
  completedAt: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number, // in minutes
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['completed', 'incomplete'],
    default: 'completed'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate percentage score before saving
InterviewParticipationSchema.pre('save', function(next) {
  if (this.maxScore > 0) {
    this.percentageScore = Math.round((this.score / this.maxScore) * 100);
  }
  
  // Calculate duration
  if (this.startedAt && this.completedAt) {
    const diff = this.completedAt - this.startedAt;
    this.duration = Math.round(diff / (1000 * 60)); // Convert to minutes
  }
  
  next();
});

// Indexes for faster queries
InterviewParticipationSchema.index({ scheduledInterviewId: 1 });
InterviewParticipationSchema.index({ userId: 1 });
InterviewParticipationSchema.index({ interviewId: 1 });
InterviewParticipationSchema.index({ status: 1, createdAt: -1 });

const InterviewParticipation = mongoose.model('InterviewParticipation', InterviewParticipationSchema);

module.exports = InterviewParticipation;
