const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  tags: [{
    type: String
  }],
  inputFormat: {
    type: String,
    required: true
  },
  outputFormat: {
    type: String,
    required: true
  },
  constraints: {
    type: String,
    required: true
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [{
    input: String,
    output: String,
    isHidden: {
      type: Boolean,
      default: false
    },
    points: {
      type: Number,
      default: 1
    }
  }],
  timeLimit: {
    type: Number, // in seconds
    default: 2
  },
  memoryLimit: {
    type: Number, // in MB
    default: 256
  },
  points: {
    type: Number,
    default: 100
  },
  order: {
    type: Number,
    default: 0
  },
  hints: [{
    type: String
  }],
  solutionTemplate: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  editorialSolution: {
    type: String,
    default: ''
  },
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }]
}, {
  timestamps: true
});

// Index for efficient queries
problemSchema.index({ contestId: 1, order: 1 });
problemSchema.index({ difficulty: 1 });

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
