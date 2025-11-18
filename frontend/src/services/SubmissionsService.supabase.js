// Submissions service - store and query submissions in Supabase
import { supabase } from '../config/supabaseClient';

const API_SUBMISSIONS_ENDPOINT = '/api/submissions';

// Create a new submission record
export const createSubmission = async (submission) => {
  try {
    const now = new Date().toISOString();
    const payload = {
      ...submission,
      createdAt: submission.createdAt || now,
      updatedAt: submission.updatedAt || now
    };

    // Always post to backend API; backend is authoritative and persists to MongoDB.
    const headers = { 'Content-Type': 'application/json' };
    // If frontend has a Supabase session, it will include Authorization header automatically.
    const resp = await fetch(API_SUBMISSIONS_ENDPOINT, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Backend submissions API responded ${resp.status}: ${text}`);
    }
    const data = await resp.json();
    return data.submission || data;
  } catch (error) {
    console.error('Error creating submission via backend API:', error);
    throw error;
  }
};

// Get submissions for a contest (optionally for a specific problem)
export const getSubmissionsByContest = async (contestId, problemIndex = null) => {
  try {
    let query = supabase.from(SUBMISSIONS_TABLE).select('*').eq('contestId', contestId).order('createdAt', { ascending: true });
    if (problemIndex !== null) {
      query = query.eq('problemIndex', problemIndex);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching submissions by contest:', error);
    throw error;
  }
};

// Get a single submission
export const getSubmissionById = async (submissionId) => {
  try {
    const { data, error } = await supabase.from(SUBMISSIONS_TABLE).select('*').eq('id', submissionId).single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching submission:', error);
    throw error;
  }
};

// Optional: get submissions by user
export const getSubmissionsByUser = async (userId) => {
  try {
    const { data, error } = await supabase.from(SUBMISSIONS_TABLE).select('*').eq('userId', userId).order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching submissions by user:', error);
    throw error;
  }
};

export default {
  createSubmission,
  getSubmissionsByContest,
  getSubmissionById,
  getSubmissionsByUser
};
