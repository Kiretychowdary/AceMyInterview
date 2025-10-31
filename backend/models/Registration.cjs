const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  registrationTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['registered', 'participated', 'completed', 'cancelled'],
    default: 'registered'
  },
  score: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: null
  },
  submissions: [{
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem'
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    },
    score: Number,
    submittedAt: Date
  }],
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ userId: 1, contestId: 1 }, { unique: true });

// Index for leaderboard queries
registrationSchema.index({ contestId: 1, score: -1, completedAt: 1 });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
