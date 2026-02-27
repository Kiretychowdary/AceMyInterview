const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  
  const adminToken = localStorage.getItem('ace_admin_token');
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }
  
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers,
    credentials: 'include',
    ...options
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error('API request failed: ' + res.status);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  
  return res.json();
}

/**
 * Get all active custom interviews (public endpoint)
 */
export const getAllCustomInterviews = async () => {
  try {
    const resp = await apiFetch('/public/custom-interviews');
    return resp.interviews || [];
  } catch (error) {
    console.error('Error fetching custom interviews:', error);
    return [];
  }
};

/**
 * Get a specific custom interview by ID
 */
export const getCustomInterviewById = async (interviewId) => {
  try {
    const resp = await apiFetch(`/public/custom-interviews/${interviewId}`);
    return resp.interview;
  } catch (error) {
    console.error('Error fetching custom interview:', error);
    throw error;
  }
};

/**
 * Check if user has already participated in this interview
 */
export const checkInterviewParticipation = async (interviewId, userId) => {
  try {
    const resp = await apiFetch(`/public/custom-interviews/${interviewId}/check-participation/${userId}`);
    return resp.hasParticipated || false;
  } catch (error) {
    console.error('Error checking participation:', error);
    return false;
  }
};

/**
 * Submit interview participation (called after interview completion)
 */
export const submitInterviewParticipation = async (interviewId, participationData) => {
  try {
    const resp = await apiFetch(`/public/custom-interviews/${interviewId}/participate`, {
      method: 'POST',
      body: JSON.stringify(participationData)
    });
    return resp;
  } catch (error) {
    console.error('Error submitting participation:', error);
    throw error;
  }
};
