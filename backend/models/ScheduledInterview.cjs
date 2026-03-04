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
  
  // Scheduled Date and Time (Legacy - kept for backward compatibility)
  scheduledDate: {
    type: Date,
    required: false
  },
  
  startTime: {
    type: String, // Format: "HH:MM"
    required: false
  },
  
  endTime: {
    type: String, // Format: "HH:MM"
    required: false
  },
  
  // New Flexible Timing Fields
  availableFromDate: {
    type: Date,
    required: false // Will become required after migration
  },
  
  availableFromTime: {
    type: String, // Format: "HH:MM"
    required: false
  },
  
  availableToDate: {
    type: Date,
    required: false
  },
  
  availableToTime: {
    type: String, // Format: "HH:MM"
    required: false
  },
  
  duration: {
    type: Number, // in minutes (per user session)
    required: true,
    default: 30
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
  
  console.log(`🔍 Updating status for: "${this.interviewName}"`);
  console.log(`   Current time: ${now.toISOString()}`);
  
  // Use new flexible timing if available, otherwise fall back to legacy fields
  let startDateTime, endDateTime;
  
  if (this.availableFromDate && this.availableFromTime && this.availableToDate && this.availableToTime) {
    // New flexible timing model
    try {
      startDateTime = new Date(this.availableFromDate);
      const [startHour, startMin] = this.availableFromTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMin, 0, 0);
      
      endDateTime = new Date(this.availableToDate);
      const [endHour, endMin] = this.availableToTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMin, 0, 0);
      
      console.log(`   ✅ Flexible timing: ${startDateTime.toISOString()} to ${endDateTime.toISOString()}`);
    } catch (error) {
      console.error('   ❌ Error parsing flexible timing:', error);
      return; // Keep current status if parsing fails
    }
  } else if (this.scheduledDate && this.startTime && this.endTime) {
    // Legacy timing model
    try {
      startDateTime = new Date(this.scheduledDate);
      const [startHour, startMin] = this.startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMin, 0, 0);
      
      endDateTime = new Date(this.scheduledDate);
      const [endHour, endMin] = this.endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMin, 0, 0);
      
      console.log(`   ✅ Legacy timing: ${startDateTime.toISOString()} to ${endDateTime.toISOString()}`);
    } catch (error) {
      console.error('   ❌ Error parsing legacy timing:', error);
      return; // Keep current status if parsing fails
    }
  } else {
    // No valid timing data
    console.log('   ⚠️ No valid timing data found');
    return;
  }
  
  const oldStatus = this.status;
  
  if (now < startDateTime) {
    this.status = 'upcoming';
  } else if (now >= startDateTime && now <= endDateTime) {
    this.status = 'ongoing';
  } else if (now > endDateTime) {
    this.status = 'completed';
  }
  
  if (oldStatus !== this.status) {
    console.log(`   🔄 Status changed: ${oldStatus} -> ${this.status}`);
  } else {
    console.log(`   ✓ Status unchanged: ${this.status}`);
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
