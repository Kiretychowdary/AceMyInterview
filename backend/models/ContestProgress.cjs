const mongoose = require('mongoose');

const contestProgressSchema = new mongoose.Schema({
  contestId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: String,
  email: String,
  
  // Progress tracking
  problemsAttempted: [{
    problemId: String,
    problemTitle: String,
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'solved', 'failed'],
      default: 'not-started'
    },
    attempts: {
      type: Number,
      default: 0
    },
    lastAttemptAt: Date,
    solvedAt: Date,
    timeSpent: {
      type: Number,
      default: 0
    } // in seconds
  }],
  
  // Overall contest stats
  totalProblems: {
    type: Number,
    default: 0
  },
  problemsSolved: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  
  // Activity tracking
  isActive: {
    type: Boolean,
    default: false
  },
  lastActiveAt: Date,
  startedAt: Date,
  completedAt: Date,
  
  // Time tracking
  totalTimeSpent: {
    type: Number,
    default: 0
  } // in seconds
}, {
  timestamps: true
});

// Compound index for efficient queries
contestProgressSchema.index({ contestId: 1, userId: 1 }, { unique: true });
contestProgressSchema.index({ contestId: 1, isActive: 1 });

// Method to update active status
contestProgressSchema.methods.updateActiveStatus = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  this.isActive = this.lastActiveAt && this.lastActiveAt > fiveMinutesAgo;
  return this.isActive;
};

// Static method to get active participants count
contestProgressSchema.statics.getActiveCount = async function(contestId) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return await this.countDocuments({
    contestId,
    lastActiveAt: { $gte: fiveMinutesAgo }
  });
};

module.exports = mongoose.model('ContestProgress', contestProgressSchema);
