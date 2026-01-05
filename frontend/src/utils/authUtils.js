// Authentication utilities for API calls
import { auth } from '../config/firebaseClient';

/**
 * Get Firebase authentication headers for API requests
 * @returns {Promise<Object>} Headers object with Authorization token
 */
export async function getAuthHeaders() {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.warn('Failed to get auth token:', error.message);
    return {
      'Content-Type': 'application/json'
    };
  }
}

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function authFetch(url, options = {}) {
  const headers = await getAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
}
