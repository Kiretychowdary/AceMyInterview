const axios = require('axios');
const Submission = require('../models/submission.model.cjs');
const mongoose = require('mongoose');

function ensureDbConnected(res) {
  if (mongoose.connection.readyState !== 1) {
    console.error('MongoDB not connected (readyState=' + mongoose.connection.readyState + ')');
    if (res && typeof res.status === 'function') {
      return res.status(503).json({ success: false, error: 'Database not connected', details: `Mongoose readyState=${mongoose.connection.readyState}` });
    }
    return false;
  }
  return true;
}

async function createSubmission(req, res) {
  try {
    const ok = ensureDbConnected(res);
    if (ok !== true) return;
    const payload = req.body || {};

    // Basic validation
    if (!payload || (typeof payload !== 'object')) {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }
    if (!payload.code && !payload.result) {
      return res.status(400).json({ success: false, error: 'Submission must include code or result' });
    }

    // Normalize fields for Mongo model
    const toInsert = {
      contest_id: payload.contestId ?? payload.contest_id ?? null,
      problem_index: payload.problemIndex ?? payload.problem_index ?? 0,
      user_id: payload.userId ?? payload.user_id ?? null,
      username: payload.username ?? payload.user_name ?? payload.user ?? 'anonymous',
      language_id: payload.languageId ?? payload.language_id ?? null,
      code: payload.code ?? '',
      verdict: payload.verdict ?? 'Unknown',
      status: payload.status ?? 'finished',
      time: payload.time ?? payload.exec_time ?? null,
      memory: payload.memory ?? null,
      code_length: payload.code_length ?? (payload.code ? payload.code.length : 0),
      result: payload.result ?? null,
    };

    // Write to MongoDB (primary server-side storage)
    const doc = await Submission.create(toInsert);

    // We only persist to MongoDB server-side. Supabase is used for authentication only.
    return res.status(201).json({ success: true, submission: doc });
  } catch (err) {
    console.error('createSubmission error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function listSubmissions(req, res) {
  try {
    const ok = ensureDbConnected(res);
    if (ok !== true) return;
    const { contestId, skip = 0, limit = 50 } = req.query;
    const q = {};
    if (contestId) q.contest_id = contestId;

    const rows = await Submission.find(q).sort({ created_at: -1 }).skip(parseInt(skip)).limit(parseInt(limit)).lean();
    res.json({ success: true, submissions: rows });
  } catch (err) {
    console.error('listSubmissions error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getSubmission(req, res) {
  try {
    const ok = ensureDbConnected(res);
    if (ok !== true) return;
    const id = req.params.id;
    const doc = await Submission.findById(id).lean();
    if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, submission: doc });
  } catch (err) {
    console.error('getSubmission error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { createSubmission, listSubmissions, getSubmission };
