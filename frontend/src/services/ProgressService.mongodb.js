// Progress Service - MongoDB Backend
// Handles all data storage operations for interviews
import { authFetch } from '../utils/authUtils';

class ProgressService {
  constructor() {
    this.API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://acemyinterview.onrender.com'
        : 'http://localhost:5000');
    
    console.log('🔧 [ProgressService] Initialized');
    console.log('🌐 [ProgressService] API Base URL:', this.API_BASE_URL);
    console.log('🏗️  [ProgressService] Environment:', process.env.NODE_ENV || 'development');
  }

  // 📊 MCQ SESSION TRACKING
  async saveMCQSession(userId, sessionData) {
    try {
      console.log('💾 [ProgressService] Saving MCQ session to MongoDB backend...');
      console.log('📋 User ID:', userId);
      console.log('📋 Session Data received:', sessionData);
      
      // Ensure all required fields are present
      const sessionPayload = {
        sessionId: sessionData.sessionId || `mcq_${Date.now()}_${userId}`,
        userId: sessionData.userId || userId,
        topic: sessionData.topic,
        difficulty: sessionData.difficulty || 'medium',
        duration: sessionData.duration || 10,
        interviewType: sessionData.interviewType || 'mcq',
        totalQuestions: sessionData.totalQuestions || 0,
        answeredQuestions: sessionData.answeredQuestions || 0,
        correctAnswers: sessionData.correctAnswers || 0,
        timeSpent: sessionData.timeSpent || 0,
        startTime: sessionData.startTime || new Date().toISOString(),
        endTime: sessionData.endTime || new Date().toISOString(),
        questions: sessionData.questions || [],
        answers: sessionData.answers || [],
        assessment: sessionData.assessment || {}
      };
      
      // Verify required fields
      if (!sessionPayload.sessionId || !sessionPayload.userId || !sessionPayload.topic) {
        console.error('❌ Missing required fields!');
        console.error('sessionId:', sessionPayload.sessionId);
        console.error('userId:', sessionPayload.userId);
        console.error('topic:', sessionPayload.topic);
        throw new Error('Missing required fields: sessionId, userId, or topic');
      }

      console.log('📦 Sending payload:', JSON.stringify(sessionPayload, null, 2));

      // Save to MongoDB backend
      console.log('🌐 POST to:', `${this.API_BASE_URL}/api/interview/store-session`);
      
      const response = await authFetch(`${this.API_BASE_URL}/api/interview/store-session`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json'
        },
        body: JSON.stringify(sessionPayload)
      });

      console.log('📡 Backend response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend API error:', response.status);
        console.error('❌ Error response:', errorText);
        throw new Error(`Backend API returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ MCQ session saved successfully to MongoDB!');
      console.log('📊 Session ID:', result.sessionId);
      console.log('👤 Stored for user:', sessionPayload.userId);

      return {
        success: true,
        sessionId: result.sessionId || sessionPayload.sessionId,
        data: result
      };
    } catch (error) {
      console.error('❌ Error saving MCQ session:', error);
      // Return graceful failure instead of throwing
      return {
        success: false,
        error: error.message,
        sessionId: null
      };
    }
  }

  // 💻 CODING SESSION TRACKING
  async saveCodingSession(userId, sessionData) {
    try {
      console.log('💾 [ProgressService] Saving coding session to MongoDB backend...');
      console.log('📋 User ID:', userId);
      console.log('📋 Session Data received:', sessionData);
      
      const sessionPayload = {
        sessionId: sessionData.sessionId || `coding_${Date.now()}_${userId}`,
        userId: sessionData.userId || userId,
        topic: sessionData.topic,
        difficulty: sessionData.difficulty || 'medium',
        duration: sessionData.duration || 30,
        interviewType: sessionData.interviewType || 'coding',
        language: sessionData.language || 'javascript',
        totalQuestions: sessionData.totalProblems || sessionData.totalQuestions || 1,
        answeredQuestions: sessionData.solvedProblems || sessionData.answeredQuestions || 0,
        correctAnswers: sessionData.correctAnswers || sessionData.solvedProblems || 0,
        timeSpent: sessionData.timeSpent || 0,
        startTime: sessionData.startTime || new Date().toISOString(),
        endTime: sessionData.endTime || new Date().toISOString(),
        questions: sessionData.problems || sessionData.questions || [],
        answers: sessionData.solutions || sessionData.answers || [],
        assessment: sessionData.assessment || {
          overallScore: sessionData.overallScore || 0,
          successRate: sessionData.successRate || 0
        }
      };

      // Save to MongoDB backend with Firebase user ID
      console.log('🌐 Sending to MongoDB:', `${this.API_BASE_URL}/api/interview/store-session`);
      console.log('📦 Payload userId:', sessionPayload.userId);
      
      const response = await authFetch(`${this.API_BASE_URL}/api/interview/store-session`, {
        method: 'POST',
        body: JSON.stringify(sessionPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend API error:', response.status, errorText);
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Coding session saved successfully to MongoDB');
      console.log('📊 Session ID:', result.sessionId);
      console.log('👤 Stored for user:', sessionPayload.userId);

      return {
        success: true,
        sessionId: result.sessionId,
        data: result
      };
    } catch (error) {
      console.error('❌ Error saving coding session:', error);
      return {
        success: false,
        error: error.message,
        sessionId: null
      };
    }
  }

  // 🎤 FACE-TO-FACE INTERVIEW ASSESSMENT
  async saveInterviewAssessment(userId, assessmentData) {
    try {
      console.log('💾 [ProgressService] Saving interview assessment to MongoDB backend...');
      console.log('📋 User ID:', userId);
      console.log('📋 Assessment Data received:', assessmentData);
      
      const sessionPayload = {
        sessionId: assessmentData.sessionId || `interview_${Date.now()}_${userId}`,
        userId: assessmentData.userId || userId,
        topic: assessmentData.topic || 'General Interview',
        difficulty: assessmentData.difficulty || 'medium',
        duration: assessmentData.duration || 10,
        interviewType: assessmentData.interviewType || 'face-to-face',
        totalQuestions: assessmentData.totalQuestions || assessmentData.interviewQuestions?.length || 0,
        answeredQuestions: assessmentData.answeredQuestions || assessmentData.userResponses?.length || 0,
        correctAnswers: assessmentData.correctAnswers || 0,
        timeSpent: assessmentData.timeSpent || 0,
        startTime: assessmentData.startTime || new Date().toISOString(),
        endTime: assessmentData.endTime || new Date().toISOString(),
        questions: assessmentData.questions || assessmentData.interviewQuestions || [],
        answers: assessmentData.answers || assessmentData.userResponses || [],
        assessment: assessmentData.assessment || assessmentData.aiAssessment || {}
      };

      // Save to MongoDB backend with Firebase user ID
      console.log('🌐 Sending to MongoDB:', `${this.API_BASE_URL}/api/interview/store-session`);
      console.log('📦 Payload userId:', sessionPayload.userId);
      
      const response = await authFetch(`${this.API_BASE_URL}/api/interview/store-session`, {
        method: 'POST',
        body: JSON.stringify(sessionPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend API error:', response.status, errorText);
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Interview assessment saved successfully to MongoDB');
      console.log('📊 Session ID:', result.sessionId);
      console.log('👤 Stored for user:', sessionPayload.userId);

      return {
        success: true,
        assessmentId: result.sessionId,
        assessment: sessionPayload.assessment
      };
    } catch (error) {
      console.error('❌ Error saving interview assessment:', error);
      return {
        success: false,
        error: error.message,
        assessmentId: null
      };
    }
  }

  // 🤖 GET AI INTERVIEW ASSESSMENT
  async getAIAssessment(assessmentData) {
    try {
      const response = await authFetch(`${this.API_BASE_URL}/api/assess-interview`, {
        method: 'POST',
        body: JSON.stringify(assessmentData)
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Assessment failed');
      return result.assessment;
    } catch (error) {
      console.error('Error getting AI assessment:', error);
      throw error;
    }
  }

}

export const progressService = new ProgressService();
export default progressService;
