const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const ScheduledInterviewSchema = new mongoose.Schema({
  // Unique Interview ID
  interviewId: {
    type: String,
    unique: true,
    required: true,
    default: () => nanoid(10)
  },
  
  // Admin who created this interview
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  
  // Interview Basic Info
  interviewName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Scheduled Date and Time
  scheduledDate: {
    type: Date,
    required: true
  },
  
  startTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  
  endTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  
  duration: {
    type: Number, // in minutes
    required: true
  },
  
  // Interview Type (determines what to focus on)
  interviewType: {
    type: String,
    enum: ['topic-based', 'company-based'],
    required: true
  },
  
  // For topic-based interviews
  topics: {
    type: [String],
    default: []
  },
  
  // For company-based interviews
  companyName: {
    type: String,
    default: ''
  },
  
  // Additional Settings
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  
  numberOfQuestions: {
    type: Number,
    default: 5
  },
  
  description: {
    type: String,
    default: ''
  },
  
  // Status
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Automatically update status based on time
ScheduledInterviewSchema.methods.updateStatus = function() {
  const now = new Date();
  const interviewDate = new Date(this.scheduledDate);
  const [startHour, startMin] = this.startTime.split(':').map(Number);
  const [endHour, endMin] = this.endTime.split(':').map(Number);
  
  interviewDate.setHours(startHour, startMin, 0, 0);
  const endDate = new Date(this.scheduledDate);
  endDate.setHours(endHour, endMin, 0, 0);
  
  if (now < interviewDate) {
    this.status = 'upcoming';
  } else if (now >= interviewDate && now <= endDate) {
    this.status = 'ongoing';
  } else if (now > endDate) {
    this.status = 'completed';
  }
};

// Update status before saving
ScheduledInterviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.updateStatus();
  next();
});

// Indexes for faster queries
ScheduledInterviewSchema.index({ createdBy: 1, status: 1 });
ScheduledInterviewSchema.index({ scheduledDate: 1, status: 1 });
ScheduledInterviewSchema.index({ interviewId: 1 });

const ScheduledInterview = mongoose.model('ScheduledInterview', ScheduledInterviewSchema);

module.exports = ScheduledInterview;
