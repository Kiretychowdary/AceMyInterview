const mongoose = require('mongoose');

const InterviewRegistrationSchema = new mongoose.Schema({
  // Reference to scheduled interview
  scheduledInterviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduledInterview',
    required: true
  },
  
  interviewId: {
    type: String,
    required: true,
    index: true
  },
  
  // User Information
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  userName: {
    type: String,
    required: true
  },
  
  userEmail: {
    type: String,
    required: true
  },
  
  // Registration Info
  registeredAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Status tracking
  hasAttended: {
    type: Boolean,
    default: false
  },
  
  attendedAt: {
    type: Date
  },
  
  // Reference to participation (if attended)
  participationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewParticipation'
  }
});

// Compound index to prevent duplicate registrations
InterviewRegistrationSchema.index({ userId: 1, interviewId: 1 }, { unique: true });

// Index for querying registrations by interview
InterviewRegistrationSchema.index({ interviewId: 1, registeredAt: 1 });

const InterviewRegistration = mongoose.model('InterviewRegistration', InterviewRegistrationSchema);

module.exports = InterviewRegistration;
