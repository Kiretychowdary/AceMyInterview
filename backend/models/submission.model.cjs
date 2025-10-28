const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  contest_id: { type: mongoose.Schema.Types.Mixed, default: null, index: true },
  problem_index: { type: Number, default: 0, index: true },
  user_id: { type: mongoose.Schema.Types.Mixed, default: null, index: true },
  username: { type: String, default: 'anonymous', index: true },
  language_id: { type: Number, default: null },
  code: { type: String, default: '' },
  verdict: { type: String, default: 'Unknown', index: true },
  status: { type: String, default: 'finished', index: true },
  time: { type: Number, default: null },
  memory: { type: Number, default: null },
  code_length: { type: Number, default: 0 },
  result: { type: mongoose.Schema.Types.Mixed, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index on contest + problem for fast contest problem queries
SubmissionSchema.index({ contest_id: 1, problem_index: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);
