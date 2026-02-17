const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const CustomInterviewSchema = new mongoose.Schema({
  // Unique Interview ID (shareable link)
  interviewId: {
    type: String,
    unique: true,
    required: true,
    default: () => nanoid(10) // Generate 10-character unique ID
  },
  
  // Admin who created this interview
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  
  // Interview Configuration
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    default: ''
  },
  
  role: {
    type: String,
    required: true,
    trim: true
  },
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  
  duration: {
    type: Number, // in minutes
    required: true,
    default: 30
  },
  
  numberOfQuestions: {
    type: Number,
    required: true,
    default: 5
  },
  
  // Custom Questions (optional - if empty, AI generates)
  customQuestions: [{
    questionText: String,
    category: String,
    expectedPoints: [String],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    }
  }],
  
  // Interview Settings
  settings: {
    allowTextInput: {
      type: Boolean,
      default: true
    },
    allowVoiceInput: {
      type: Boolean,
      default: true
    },
    showTimer: {
      type: Boolean,
      default: true
    },
    recordVideo: {
      type: Boolean,
      default: false
    },
    aiGenerated: {
      type: Boolean,
      default: true // Use AI to generate questions
    }
  },
  
  // Interview Status
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'archived'],
    default: 'active'
  },
  
  // Access Control
  accessType: {
    type: String,
    enum: ['public', 'private'], // public = anyone with link, private = invited only
    default: 'public'
  },
  
  invitedCandidates: [{
    email: String,
    name: String,
    invitedAt: Date,
    status: {
      type: String,
      enum: ['invited', 'started', 'completed'],
      default: 'invited'
    }
  }],
  
  // Interview Link
  interviewLink: {
    type: String
  },
  
  // Analytics
  totalAttempts: {
    type: Number,
    default: 0
  },
  
  completedAttempts: {
    type: Number,
    default: 0
  },
  
  averageScore: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  expiresAt: {
    type: Date,
    default: null // null = never expires
  }
});

// Generate interview link before saving
CustomInterviewSchema.pre('save', function(next) {
  if (!this.interviewLink) {
    // Generate link: https://yourdomain.com/interview/abc123xyz
    this.interviewLink = `/interview/${this.interviewId}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
CustomInterviewSchema.index({ createdBy: 1, status: 1 });
CustomInterviewSchema.index({ status: 1, createdAt: -1 });

const CustomInterview = mongoose.model('CustomInterview', CustomInterviewSchema);

module.exports = CustomInterview;
