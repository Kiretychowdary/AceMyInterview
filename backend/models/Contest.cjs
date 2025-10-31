const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true
  },
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  createdBy: {
    type: String,
    required: true
  },
  maxParticipants: {
    type: Number,
    default: null // null means unlimited
  },
  registrations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration'
  }],
  rules: {
    type: String,
    default: ''
  },
  prizes: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  tags: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual field to get participant count
contestSchema.virtual('participantCount').get(function() {
  return this.registrations ? this.registrations.length : 0;
});

// Method to check if registration is open
contestSchema.methods.isRegistrationOpen = function() {
  const now = new Date();
  return now < this.registrationDeadline && this.status !== 'cancelled' && this.isPublished;
};

// Method to check if contest is active
contestSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime && this.status === 'ongoing';
};

// Method to update contest status based on time
contestSchema.methods.updateStatus = function() {
  const now = new Date();
  
  if (this.status === 'cancelled') {
    return this.status;
  }
  
  if (now < this.startTime) {
    this.status = 'scheduled';
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = 'ongoing';
  } else if (now > this.endTime) {
    this.status = 'completed';
  }
  
  return this.status;
};

// Index for efficient queries
contestSchema.index({ startTime: 1, status: 1 });
contestSchema.index({ createdBy: 1 });

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;
