// NMKRSPVLIDATA_XCEL_DOWNLOAD
// Contest Performance Tracking Model for Excel Reports
const mongoose = require('mongoose');

const questionPerformanceSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  problemTitle: String,
  problemDifficulty: String,
  maxMarks: {
    type: Number,
    default: 100
  },
  marksObtained: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['not_attempted', 'attempted', 'partially_solved', 'fully_solved'],
    default: 'not_attempted'
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  passedTestCases: {
    type: Number,
    default: 0
  },
  failedTestCases: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0 // percentage
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  firstAttemptAt: Date,
  lastAttemptAt: Date,
  solvedAt: Date,
  bestSubmissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  },
  language: String,
  executionTime: Number, // ms
  memoryUsed: Number // KB
}, { _id: false });

const contestPerformanceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: String,
  userName: String,
  
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true,
    index: true
  },
  contestTitle: String,
  contestDifficulty: String,
  
  // Registration info
  registeredAt: {
    type: Date,
    required: true
  },
  registrationStatus: {
    type: String,
    enum: ['registered', 'started', 'in_progress', 'completed', 'cancelled'],
    default: 'registered'
  },
  
  // Contest participation
  startedAt: Date,
  completedAt: Date,
  lastActivityAt: Date,
  totalTimeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  
  // Overall performance metrics
  totalProblems: {
    type: Number,
    default: 0
  },
  problemsAttempted: {
    type: Number,
    default: 0
  },
  problemsPartiallySolved: {
    type: Number,
    default: 0
  },
  problemsFullySolved: {
    type: Number,
    default: 0
  },
  problemsNotAttempted: {
    type: Number,
    default: 0
  },
  
  // Completion status
  completionStatus: {
    type: String,
    enum: ['not_started', 'partial', 'full', 'incomplete'],
    default: 'not_started'
  },
  completionPercentage: {
    type: Number,
    default: 0 // 0-100
  },
  
  // Score and marks
  totalMaxMarks: {
    type: Number,
    default: 0
  },
  totalMarksObtained: {
    type: Number,
    default: 0
  },
  scorePercentage: {
    type: Number,
    default: 0 // 0-100
  },
  finalScore: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: null
  },
  
  // Submission statistics
  totalSubmissions: {
    type: Number,
    default: 0
  },
  successfulSubmissions: {
    type: Number,
    default: 0
  },
  failedSubmissions: {
    type: Number,
    default: 0
  },
  
  // Question-wise performance
  questionPerformances: [questionPerformanceSchema],
  
  // Additional metrics
  averageTimePerProblem: {
    type: Number,
    default: 0 // in seconds
  },
  averageAttemptsPerProblem: {
    type: Number,
    default: 0
  },
  averageSuccessRate: {
    type: Number,
    default: 0 // percentage
  },
  
  // Flags
  isActive: {
    type: Boolean,
    default: false
  },
  submittedAfterDeadline: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
contestPerformanceSchema.index({ contestId: 1, userId: 1 }, { unique: true });
contestPerformanceSchema.index({ contestId: 1, finalScore: -1 });
contestPerformanceSchema.index({ contestId: 1, completionStatus: 1 });
contestPerformanceSchema.index({ registeredAt: 1 });

// Method to calculate and update performance metrics
contestPerformanceSchema.methods.calculateMetrics = function() {
  const questions = this.questionPerformances || [];
  
  // Count problem statuses
  this.problemsAttempted = questions.filter(q => 
    q.status !== 'not_attempted'
  ).length;
  
  this.problemsFullySolved = questions.filter(q => 
    q.status === 'fully_solved'
  ).length;
  
  this.problemsPartiallySolved = questions.filter(q => 
    q.status === 'partially_solved'
  ).length;
  
  this.problemsNotAttempted = questions.filter(q => 
    q.status === 'not_attempted'
  ).length;
  
  // Calculate total marks
  this.totalMaxMarks = questions.reduce((sum, q) => sum + (q.maxMarks || 0), 0);
  this.totalMarksObtained = questions.reduce((sum, q) => sum + (q.marksObtained || 0), 0);
  
  // Calculate percentages
  this.scorePercentage = this.totalMaxMarks > 0 
    ? Math.round((this.totalMarksObtained / this.totalMaxMarks) * 100) 
    : 0;
  
  this.completionPercentage = this.totalProblems > 0
    ? Math.round((this.problemsAttempted / this.totalProblems) * 100)
    : 0;
  
  // Determine completion status
  if (this.problemsAttempted === 0) {
    this.completionStatus = 'not_started';
  } else if (this.problemsFullySolved === this.totalProblems) {
    this.completionStatus = 'full';
  } else if (this.problemsAttempted > 0) {
    this.completionStatus = 'partial';
  } else {
    this.completionStatus = 'incomplete';
  }
  
  // Calculate averages
  if (this.problemsAttempted > 0) {
    this.averageTimePerProblem = Math.round(
      this.totalTimeSpent / this.problemsAttempted
    );
    
    this.averageAttemptsPerProblem = Math.round(
      (questions.reduce((sum, q) => sum + q.totalAttempts, 0) / this.problemsAttempted) * 10
    ) / 10;
    
    this.averageSuccessRate = Math.round(
      questions.reduce((sum, q) => sum + q.successRate, 0) / this.problemsAttempted
    );
  }
  
  this.finalScore = this.totalMarksObtained;
  this.lastUpdated = new Date();
  
  return this;
};

// Method to update question performance
contestPerformanceSchema.methods.updateQuestionPerformance = function(problemId, updates) {
  const question = this.questionPerformances.find(q => 
    q.problemId.toString() === problemId.toString()
  );
  
  if (question) {
    Object.assign(question, updates);
    
    // Calculate success rate
    if (question.totalTestCases > 0) {
      question.successRate = Math.round(
        (question.passedTestCases / question.totalTestCases) * 100
      );
    }
    
    // Update status based on success rate
    if (question.totalAttempts === 0) {
      question.status = 'not_attempted';
    } else if (question.successRate === 100) {
      question.status = 'fully_solved';
    } else if (question.successRate > 0) {
      question.status = 'partially_solved';
    } else {
      question.status = 'attempted';
    }
  }
  
  return this;
};

// Static method to get contest performance summary
contestPerformanceSchema.statics.getContestSummary = async function(contestId) {
  const performances = await this.find({ contestId });
  
  return {
    totalRegistered: performances.length,
    totalStarted: performances.filter(p => p.startedAt).length,
    totalCompleted: performances.filter(p => p.completedAt).length,
    totalFullCompletion: performances.filter(p => p.completionStatus === 'full').length,
    totalPartialCompletion: performances.filter(p => p.completionStatus === 'partial').length,
    totalNotStarted: performances.filter(p => p.completionStatus === 'not_started').length,
    averageScore: performances.length > 0 
      ? Math.round(performances.reduce((sum, p) => sum + p.finalScore, 0) / performances.length)
      : 0,
    averageCompletionPercentage: performances.length > 0
      ? Math.round(performances.reduce((sum, p) => sum + p.completionPercentage, 0) / performances.length)
      : 0
  };
};

const ContestPerformance = mongoose.model('ContestPerformance', contestPerformanceSchema);

module.exports = ContestPerformance;
