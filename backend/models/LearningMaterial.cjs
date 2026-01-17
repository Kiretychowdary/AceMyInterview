// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * Learning Material Model - For RAG System
 * Stores learning materials, explanations, and resources per topic
 */

const mongoose = require('mongoose');

const learningMaterialSchema = new mongoose.Schema({
  topicId: {
    type: Number,
    required: true,
    index: true
  },
  topicName: {
    type: String,
    required: true,
    index: true
  },
  materialType: {
    type: String,
    enum: ['concept', 'example', 'practice', 'explanation', 'tip', 'common_mistake'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  keywords: [{
    type: String
  }],
  relatedTopics: [{
    type: Number
  }],
  embedding: {
    type: [Number],  // For vector search (RAG)
    default: []
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true
});

// Indexes for efficient search
learningMaterialSchema.index({ topicId: 1, difficulty: 1 });
learningMaterialSchema.index({ keywords: 1 });
learningMaterialSchema.index({ topicName: 'text', content: 'text', title: 'text' });

const LearningMaterial = mongoose.model('LearningMaterial', learningMaterialSchema);

module.exports = LearningMaterial;
