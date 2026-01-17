// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * Chat Conversation Model
 * Stores conversations between user and AI agent
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
});

const chatConversationSchema = new mongoose.Schema({
  userId: {
    type: String,  // Firebase UID
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  context: {
    currentTopic: String,
    currentTopicId: Number,
    userMastery: {
      type: Map,
      of: Number
    },
    lastRecommendation: String,
    learningGoals: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatConversationSchema.index({ userId: 1, isActive: 1 });
chatConversationSchema.index({ userId: 1, lastInteraction: -1 });

// Method to add message
chatConversationSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({ role, content, metadata: new Map(Object.entries(metadata)) });
  this.lastInteraction = new Date();
  return this.save();
};

// Method to update context
chatConversationSchema.methods.updateContext = function(contextUpdate) {
  this.context = { ...this.context, ...contextUpdate };
  return this.save();
};

const ChatConversation = mongoose.model('ChatConversation', chatConversationSchema);

module.exports = ChatConversation;
