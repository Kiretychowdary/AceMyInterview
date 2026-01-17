// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * Performance Tracker Hook
 * Records student interactions and provides real-time performance updates
 */

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const usePerformanceTracker = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);

  /**
   * Record a student interaction with a question
   * @param {number} topicId - Topic ID (0-9)
   * @param {string} topicName - Topic name
   * @param {string} questionId - Question identifier
   * @param {boolean} correct - Whether answer was correct
   * @param {number} timeSpent - Time spent in seconds
   */
  const recordInteraction = async (topicId, topicName, questionId, correct, timeSpent = 0) => {
    if (!user) {
      console.warn('User not authenticated, cannot record interaction');
      return null;
    }

    try {
      setIsRecording(true);
      const token = await user.getIdToken();

      const response = await axios.post(
        `${API_BASE_URL}/api/ml/interaction`,
        {
          topicId,
          topicName,
          questionId,
          correct,
          timeSpent
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error recording interaction:', error);
      return null;
    } finally {
      setIsRecording(false);
    }
  };

  /**
   * Get current performance prediction and recommendation
   */
  const getPrediction = async () => {
    if (!user) return null;

    try {
      const token = await user.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/ml/prediction`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting prediction:', error);
      return null;
    }
  };

  /**
   * Get detailed analytics
   */
  const getAnalytics = async () => {
    if (!user) return null;

    try {
      const token = await user.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/ml/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  };

  return {
    recordInteraction,
    getPrediction,
    getAnalytics,
    isRecording
  };
};
