// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * Student Performance Model
 * Tracks student interactions with questions/problems for ML analysis
 */

const mongoose = require('mongoose');

const performanceInteractionSchema = new mongoose.Schema({
  topicId: {
    type: Number,
    required: true
  },
  topicName: {
    type: String,
    required: true
  },
  questionId: {
    type: String
  },
  correct: {
    type: Number,
    required: true,
    enum: [0, 1]  // 0 = incorrect, 1 = correct
  },
  timeSpent: {
    type: Number,  // in seconds
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const studentPerformanceSchema = new mongoose.Schema({
  userId: {
    type: String,  // Firebase UID
    required: true,
    index: true
  },
  interactions: [performanceInteractionSchema],
  currentMastery: {
    type: Map,
    of: Number,  // topic_id -> mastery_score (0-1)
    default: new Map()
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  totalInteractions: {
    type: Number,
    default: 0
  },
  overallMastery: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
studentPerformanceSchema.index({ userId: 1, 'interactions.timestamp': -1 });

// Method to add new interaction
studentPerformanceSchema.methods.addInteraction = function(interaction) {
  this.interactions.push(interaction);
  this.totalInteractions = this.interactions.length;
  this.lastUpdated = new Date();
  return this.save();
};

// Method to get recent interactions
studentPerformanceSchema.methods.getRecentInteractions = function(limit = 50) {
  return this.interactions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

const StudentPerformance = mongoose.model('StudentPerformance', studentPerformanceSchema);

module.exports = StudentPerformance;
