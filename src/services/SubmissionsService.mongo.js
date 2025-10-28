import { ObjectId } from 'mongodb';
import mongoClient from './mongodbClient.js';

async function createSubmission(payload = {}) {
  await mongoClient.connect();
  const db = mongoClient.getDb();
  const col = db.collection('submissions');

  const now = new Date();
  const doc = {
    contest_id: payload.contestId ?? null,
    problem_index: payload.problemIndex ?? 0,
    user_id: payload.userId ?? null,
    username: payload.username ?? payload.user_name ?? 'anonymous',
    language_id: payload.languageId ?? null,
    code: payload.code ?? '',
    verdict: payload.verdict ?? 'Unknown',
    status: payload.status ?? 'finished',
    time: payload.time ?? null,
    memory: payload.memory ?? null,
    code_length: payload.code_length ?? (payload.code ? payload.code.length : 0),
    result: payload.result ?? null,
    created_at: now,
    updated_at: now,
  };

  const r = await col.insertOne(doc);
  doc._id = r.insertedId;
  return doc;
}

async function getSubmissionsByContest(contestId = null, { skip = 0, limit = 50 } = {}) {
  await mongoClient.connect();
  const db = mongoClient.getDb();
  const col = db.collection('submissions');
  const q = {};
  if (contestId) q.contest_id = contestId;
  const cursor = col.find(q).sort({ created_at: -1 }).skip(skip).limit(limit);
  const rows = await cursor.toArray();
  return rows;
}

async function getSubmissionById(id) {
  await mongoClient.connect();
  const db = mongoClient.getDb();
  const col = db.collection('submissions');
  const _id = (typeof id === 'string' && ObjectId.isValid(id)) ? new ObjectId(id) : id;
  return col.findOne({ _id });
}

export default {
  createSubmission,
  getSubmissionsByContest,
  getSubmissionById,
};
