const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  id: { type: String, required: false, index: true, unique: true, sparse: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, default: 'Algorithm' },
  difficulty: { type: String, default: 'Medium' },
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  duration: { type: String, default: '2 hours' },
  status: { type: String, default: 'upcoming' },
  prize: { type: String, default: '' },
  rating: { type: String, default: '' },
  tags: { type: [String], default: [] },
  technology: { type: [String], default: [] },
  participants: { type: Number, default: 0 },
  problems: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'contests' });

module.exports = mongoose.model('Contest', ContestSchema);
