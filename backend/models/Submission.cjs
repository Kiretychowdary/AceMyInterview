const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'c']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'],
    default: 'pending'
  },
  testResults: [{
    testCaseId: String,
    passed: Boolean,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    executionTime: Number,
    memory: Number,
    error: String,
    isHidden: Boolean // Track if this was a hidden test case
  }],
  // Total score calculation
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Test case statistics
  totalTestCases: {
    type: Number,
    default: 0
  },
  passedTestCases: {
    type: Number,
    default: 0
  },
  // Marks obtained (percentage or points)
  marksObtained: {
    type: Number,
    default: 0
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  // Completion status for UI indicators
  completionStatus: {
    type: String,
    enum: ['not_attempted', 'partially_solved', 'fully_solved'],
    default: 'not_attempted'
  },
  executionTime: {
    type: Number, // in milliseconds
    default: 0
  },
  memory: {
    type: Number, // in KB
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  judgedAt: {
    type: Date,
    default: null
  },
  // Contest timing flags
  isPracticeMode: {
    type: Boolean,
    default: false // True if submitted after contest ended
  },
  countsForScore: {
    type: Boolean,
    default: true // False if submitted after contest ended
  }
}, {
  timestamps: true
});

// Index for efficient queries
submissionSchema.index({ userId: 1, contestId: 1, problemId: 1 });
submissionSchema.index({ contestId: 1, status: 1 });
submissionSchema.index({ submittedAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
