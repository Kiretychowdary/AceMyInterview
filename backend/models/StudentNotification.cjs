// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * Student Notification Model
 * Tracks personal AI trainer notifications for each user
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'TOPIC_COMPLETED',
      'MILESTONE_REACHED',
      'RECOMMENDATION',
      'IMPROVEMENT_ALERT',
      'STREAK_ALERT',
      'PERSONAL_ACHIEVEMENT'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

const StudentNotification = mongoose.model('StudentNotification', notificationSchema);

module.exports = StudentNotification;
