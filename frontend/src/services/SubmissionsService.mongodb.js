// Submissions service - store and query submissions via backend API
// Firebase authentication tokens are automatically included in requests
import { authFetch } from '../utils/authUtils';

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

    // Post to backend API; backend is authoritative and persists to MongoDB.
    // Firebase auth token will be included automatically
    const resp = await authFetch(API_SUBMISSIONS_ENDPOINT, { 
      method: 'POST', 
      body: JSON.stringify(payload) 
    });
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
    // Fetch submissions via backend API
    let url = `${API_SUBMISSIONS_ENDPOINT}?contestId=${contestId}`;
    if (problemIndex !== null) {
      url += `&problemIndex=${problemIndex}`;
    }
    
    const resp = await authFetch(url);
    if (!resp.ok) {
      throw new Error(`Failed to fetch submissions: ${resp.status}`);
    }
    const data = await resp.json();
    return data.submissions || data;
  } catch (error) {
    console.error('Error fetching submissions by contest:', error);
    throw error;
  }
};

// Get a single submission
export const getSubmissionById = async (submissionId) => {
  try {
    const resp = await authFetch(`${API_SUBMISSIONS_ENDPOINT}/${submissionId}`);
    if (!resp.ok) {
      throw new Error(`Failed to fetch submission: ${resp.status}`);
    }
    const data = await resp.json();
    return data.submission || data;
  } catch (error) {
    console.error('Error fetching submission:', error);
    throw error;
  }
};

// Optional: get submissions by user
export const getSubmissionsByUser = async (userId) => {
  try {
    const resp = await authFetch(`${API_SUBMISSIONS_ENDPOINT}?userId=${userId}`);
    if (!resp.ok) {
      throw new Error(`Failed to fetch user submissions: ${resp.status}`);
    }
    const data = await resp.json();
    return data.submissions || data;
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
