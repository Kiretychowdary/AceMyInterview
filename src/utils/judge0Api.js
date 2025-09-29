// Judge0 API Wrapper for AceMyInterview
// This utility file provides functions for interacting with either
// the self-hosted Judge0 instance or the RapidAPI version

import { LANGUAGE_IDS, shouldUseAuthHeaders } from './judge0Config';

// Base URL - this will automatically choose the appropriate endpoint
// based on environment and availability
const getBaseUrl = () => {
  // In development, prefer local Judge0
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:2358';
  }
  
  // In production, use RapidAPI or other configured endpoints
  return 'https://judge0-ce.p.rapidapi.com';
};

// Get headers based on whether we need auth or not
const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  
  // Add authentication headers only if needed (RapidAPI, not local)
  if (shouldUseAuthHeaders()) {
    headers['X-RapidAPI-Key'] = import.meta.env.VITE_RAPIDAPI_KEY || '1690033ea2mshd19e1cbf16ab7e6p15099ajsnb73c9a715dc5';
    headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  }
  
  return headers;
};

// Create a submission
export const createSubmission = async (code, languageId, stdin = '') => {
  try {
    const response = await fetch(`${getBaseUrl()}/submissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: stdin,
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
};

// Get a submission by token
export const getSubmission = async (token) => {
  try {
    const response = await fetch(`${getBaseUrl()}/submissions/${token}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting submission:', error);
    throw error;
  }
};

// Get supported languages
export const getLanguages = async () => {
  try {
    const response = await fetch(`${getBaseUrl()}/languages`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting languages:', error);
    throw error;
  }
};

// Execute code and wait for the result
export const executeCode = async (code, language, input = '') => {
  try {
    // Get language ID
    const languageId = typeof language === 'string' ? LANGUAGE_IDS[language] : language.id;
    
    // Create submission
    const submission = await createSubmission(code, languageId, input);
    
    if (!submission || !submission.token) {
      throw new Error('Failed to create submission');
    }
    
    // Poll for result (with timeout)
    let result;
    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = 1000; // 1 second
    
    while (!result && attempts < maxAttempts) {
      attempts++;
      
      // Wait for poll interval
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // Check submission status
      const status = await getSubmission(submission.token);
      
      // If processing is done
      if (status.status && status.status.id > 2) {
        result = status;
        break;
      }
    }
    
    if (!result) {
      throw new Error('Execution timed out');
    }
    
    return result;
  } catch (error) {
    console.error('Error executing code:', error);
    throw error;
  }
};

export default {
  createSubmission,
  getSubmission,
  getLanguages,
  executeCode
};