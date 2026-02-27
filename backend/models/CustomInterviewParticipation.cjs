const mongoose = require('mongoose');

const CustomInterviewParticipationSchema = new mongoose.Schema({
  // Reference to custom interview
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
  interviewTitle: {
    type: String,
    required: true
  },
  
  role: {
    type: String,
    required: true
  },
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
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
    type: Date
  },
  
  duration: {
    type: Number, // in minutes
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['started', 'completed', 'incomplete'],
    default: 'started'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate percentage score before saving
CustomInterviewParticipationSchema.pre('save', function(next) {
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
CustomInterviewParticipationSchema.index({ interviewId: 1 });
CustomInterviewParticipationSchema.index({ userId: 1 });
CustomInterviewParticipationSchema.index({ status: 1, createdAt: -1 });
CustomInterviewParticipationSchema.index({ interviewId: 1, userId: 1 });

const CustomInterviewParticipation = mongoose.model('CustomInterviewParticipation', CustomInterviewParticipationSchema);

module.exports = CustomInterviewParticipation;
