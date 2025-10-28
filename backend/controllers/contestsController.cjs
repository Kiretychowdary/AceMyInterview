const Contest = require('../models/contest.model.cjs');
const mongoose = require('mongoose');

function ensureDbConnected(res) {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    console.error('MongoDB not connected (readyState=' + mongoose.connection.readyState + ')');
    if (res && typeof res.status === 'function') {
      return res.status(503).json({ success: false, error: 'Database not connected', details: `Mongoose readyState=${mongoose.connection.readyState}` });
    }
    return false;
  }
  return true;
}

// Create a new contest
exports.createContest = async (req, res) => {
  try {
    const payload = req.body || {};
    const now = new Date().toISOString();

    // Server-side validation
    if (!payload.title || typeof payload.title !== 'string' || !payload.title.trim()) {
      return res.status(400).json({ success: false, error: 'Contest title is required' });
    }

    // If problems provided, validate each problem structure
    if (payload.problems && Array.isArray(payload.problems)) {
      for (let i = 0; i < payload.problems.length; i++) {
        const p = payload.problems[i];
        if (!p || typeof p !== 'object') {
          return res.status(400).json({ success: false, error: `Problem at index ${i} must be an object` });
        }
        if (!p.title || typeof p.title !== 'string' || !p.title.trim()) {
          return res.status(400).json({ success: false, error: `Problem at index ${i} is missing title` });
        }
        if (typeof p.points === 'undefined' || Number.isNaN(Number(p.points))) {
          return res.status(400).json({ success: false, error: `Problem at index ${i} must have numeric points` });
        }
        if (!p.testCases || !Array.isArray(p.testCases) || p.testCases.length === 0) {
          return res.status(400).json({ success: false, error: `Problem at index ${i} must have at least one test case` });
        }
        for (let j = 0; j < p.testCases.length; j++) {
          const t = p.testCases[j];
          if (!t || typeof t !== 'object' || typeof t.input === 'undefined' || typeof t.output === 'undefined') {
            return res.status(400).json({ success: false, error: `Problem at index ${i} has invalid test case at index ${j}` });
          }
        }
      }
    }

    const doc = new Contest({
      ...payload,
      createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(now),
      updatedAt: new Date(now)
    });

    // If an ID was provided and unique, set it
    if (payload.id) doc.id = payload.id;

    const saved = await doc.save();
    return res.json({ success: true, data: saved });
  } catch (err) {
    console.error('contestsController.createContest error:', err.message || err);
    // handle duplicate key (id) error
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Contest with this ID already exists', details: err.message });
    }
    return res.status(500).json({ success: false, error: 'Failed to create contest', details: err.message });
  }
};

// Check if a given contest ID exists
exports.checkId = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: 'Missing id query parameter' });
    const exists = await Contest.findOne({ id }).lean();
    return res.json({ success: true, exists: !!exists });
  } catch (err) {
    console.error('contestsController.checkId error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to check id', details: err.message });
  }
};

// List contests
exports.listContests = async (req, res) => {
  try {
    const ok = ensureDbConnected(res);
    if (ok !== true) return; // response already sent with 503
    const contests = await Contest.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: contests });
  } catch (err) {
    console.error('contestsController.listContests error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to list contests', details: err.message });
  }
};

// Get contest by ID
exports.getContest = async (req, res) => {
  try {
    const { id } = req.params;
    // Accept either custom string `id` or Mongo _id. Only include _id match when id is a valid ObjectId.
    const queryOr = [{ id }];
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryOr.push({ _id: id });
    }
    const contest = await Contest.findOne({ $or: queryOr }).lean();
    if (!contest) return res.status(404).json({ success: false, error: 'Contest not found' });
    return res.json({ success: true, data: contest });
  } catch (err) {
    console.error('contestsController.getContest error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to get contest', details: err.message });
  }
};

// Update contest
exports.updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    payload.updatedAt = new Date();
    const queryOr = [{ id }];
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) queryOr.push({ _id: id });
    const updated = await Contest.findOneAndUpdate({ $or: queryOr }, { $set: payload }, { new: true, upsert: false }).lean();
    if (!updated) return res.status(404).json({ success: false, error: 'Contest not found' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('contestsController.updateContest error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to update contest', details: err.message });
  }
};

// Delete contest
exports.deleteContest = async (req, res) => {
  try {
    const { id } = req.params;
    const queryOr = [{ id }];
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) queryOr.push({ _id: id });
    await Contest.deleteOne({ $or: queryOr });
    return res.json({ success: true });
  } catch (err) {
    console.error('contestsController.deleteContest error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to delete contest', details: err.message });
  }
};

// Update problems array for a contest
exports.updateProblems = async (req, res) => {
  try {
    const { id } = req.params;
    const { problems } = req.body;
    const queryOr = [{ id }];
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) queryOr.push({ _id: id });
    const updated = await Contest.findOneAndUpdate({ $or: queryOr }, { $set: { problems, updatedAt: new Date() } }, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, error: 'Contest not found' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('contestsController.updateProblems error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to update problems', details: err.message });
  }
};
