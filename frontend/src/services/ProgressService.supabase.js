// Supabase Progress Service - replaces Firestore logic
import { supabase } from '../config/supabaseClient';

class ProgressService {
  constructor() {
    this.API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://acemyinterview.onrender.com'
        : 'http://localhost:5000');
  }

  // 📊 MCQ SESSION TRACKING
  async saveMCQSession(userId, sessionData) {
    try {
      console.log('💾 Saving MCQ session to backend...', { userId, topic: sessionData.topic });
      
      // Use the enhanced session data structure from MCQInterview
      const sessionPayload = sessionData.sessionId ? sessionData : {
        sessionId: `mcq_${Date.now()}_${userId}`,
        userId,
        topic: sessionData.topic,
        difficulty: sessionData.difficulty || 'medium',
        duration: sessionData.duration || 10,
        interviewType: 'mcq',
        totalQuestions: sessionData.totalQuestions || sessionData.questions?.length || 0,
        answeredQuestions: sessionData.answeredQuestions || Object.keys(sessionData.answers || {}).length,
        correctAnswers: sessionData.correctAnswers || 0,
        timeSpent: sessionData.timeSpent || 0,
        startTime: sessionData.startTime || new Date(),
        endTime: sessionData.endTime || new Date(),
        questions: sessionData.questions || [],
        answers: sessionData.answers || [],
        assessment: sessionData.assessment || {
          overallScore: Math.round((sessionData.correctAnswers / sessionData.totalQuestions) * 10 * 100) / 100,
          percentage: Math.round((sessionData.correctAnswers / sessionData.totalQuestions) * 100)
        }
      };

      // Save to MongoDB backend
      const response = await fetch(`${this.API_BASE_URL}/api/interview/store-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ MCQ session saved successfully:', result);

      // Update user progress summary
      try {
        await this.updateUserProgress(userId, {
          totalMCQAttempts: 1,
          totalMCQQuestions: sessionPayload.totalQuestions,
          totalCorrectAnswers: sessionPayload.correctAnswers,
          lastActivity: new Date().toISOString()
        });
      } catch (progressError) {
        console.warn('⚠️ Failed to update progress summary:', progressError);
        // Don't throw - session is already saved
      }

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
      console.log('💾 Saving coding session to backend...', { userId, topic: sessionData.topic });
      
      const sessionPayload = {
        sessionId: `coding_${Date.now()}_${userId}`,
        userId,
        topic: sessionData.topic,
        difficulty: sessionData.difficulty || 'medium',
        duration: sessionData.duration || 30,
        interviewType: 'coding',
        language: sessionData.language || 'javascript',
        totalQuestions: sessionData.totalProblems || 1,
        answeredQuestions: sessionData.solvedProblems || 0,
        timeSpent: sessionData.timeSpent || 0,
        startTime: sessionData.startTime || new Date(),
        endTime: sessionData.endTime || new Date(),
        questions: sessionData.problems || [],
        answers: sessionData.solutions || [],
        assessment: {
          overallScore: Math.round((sessionData.solvedProblems / sessionData.totalProblems) * 10 * 100) / 100,
          successRate: Math.round((sessionData.solvedProblems / sessionData.totalProblems) * 100)
        }
      };

      // Save to MongoDB backend
      const response = await fetch(`${this.API_BASE_URL}/api/interview/store-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Coding session saved successfully:', result);

      // Update user progress summary
      try {
        await this.updateUserProgress(userId, {
          totalCodingAttempts: 1,
          totalCodingProblems: sessionPayload.totalQuestions,
          totalSolvedProblems: sessionPayload.answeredQuestions,
          lastActivity: new Date().toISOString()
        });
      } catch (progressError) {
        console.warn('⚠️ Failed to update progress summary:', progressError);
      }

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
      console.log('💾 Saving interview assessment to backend...', { userId, topic: assessmentData.topic });
      
      const sessionPayload = {
        sessionId: `interview_${Date.now()}_${userId}`,
        userId,
        topic: assessmentData.topic,
        difficulty: assessmentData.difficulty || 'medium',
        duration: assessmentData.duration || 10,
        interviewType: assessmentData.interviewType || 'face-to-face',
        totalQuestions: assessmentData.interviewQuestions?.length || 0,
        answeredQuestions: assessmentData.userResponses?.length || 0,
        timeSpent: assessmentData.timeSpent || 0,
        startTime: assessmentData.startTime || new Date(),
        endTime: assessmentData.endTime || new Date(),
        questions: assessmentData.interviewQuestions || [],
        answers: assessmentData.userResponses || [],
        assessment: assessmentData.aiAssessment || assessmentData.assessment
      };

      // Save to MongoDB backend
      const response = await fetch(`${this.API_BASE_URL}/api/interview/store-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Interview assessment saved successfully:', result);

      // Update user progress summary
      try {
        await this.updateUserProgress(userId, {
          totalFaceToFaceInterviews: 1,
          lastAssessmentRating: sessionPayload.assessment?.overallScore || 0,
          lastActivity: new Date().toISOString()
        });
      } catch (progressError) {
        console.warn('⚠️ Failed to update progress summary:', progressError);
      }

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
      const response = await fetch(`${this.API_BASE_URL}/api/assess-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // 📈 UPDATE USER PROGRESS SUMMARY
  async updateUserProgress(userId, progressUpdate) {
    try {
      const { data, error } = await supabase
        .from('userProgress')
        .select('*')
        .eq('userId', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        const updatedData = {
          totalMCQAttempts: (data.totalMCQAttempts || 0) + (progressUpdate.totalMCQAttempts || 0),
          totalCodingAttempts: (data.totalCodingAttempts || 0) + (progressUpdate.totalCodingAttempts || 0),
          totalFaceToFaceInterviews: (data.totalFaceToFaceInterviews || 0) + (progressUpdate.totalFaceToFaceInterviews || 0),
          totalMCQQuestions: (data.totalMCQQuestions || 0) + (progressUpdate.totalMCQQuestions || 0),
          totalCorrectAnswers: (data.totalCorrectAnswers || 0) + (progressUpdate.totalCorrectAnswers || 0),
          totalCodingProblems: (data.totalCodingProblems || 0) + (progressUpdate.totalCodingProblems || 0),
          totalSolvedProblems: (data.totalSolvedProblems || 0) + (progressUpdate.totalSolvedProblems || 0),
          lastActivity: progressUpdate.lastActivity || data.lastActivity,
          lastAssessmentRating: progressUpdate.lastAssessmentRating || data.lastAssessmentRating,
          updatedAt: new Date().toISOString()
        };
        await supabase
          .from('userProgress')
          .update(updatedData)
          .eq('userId', userId);
      } else {
        await supabase
          .from('userProgress')
          .insert([
            {
              userId,
              totalMCQAttempts: progressUpdate.totalMCQAttempts || 0,
              totalCodingAttempts: progressUpdate.totalCodingAttempts || 0,
              totalFaceToFaceInterviews: progressUpdate.totalFaceToFaceInterviews || 0,
              totalMCQQuestions: progressUpdate.totalMCQQuestions || 0,
              totalCorrectAnswers: progressUpdate.totalCorrectAnswers || 0,
              totalCodingProblems: progressUpdate.totalCodingProblems || 0,
              totalSolvedProblems: progressUpdate.totalSolvedProblems || 0,
              lastActivity: progressUpdate.lastActivity,
              lastAssessmentRating: progressUpdate.lastAssessmentRating || 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]);
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  // 📊 GET USER SESSIONS
  async getUserSessions(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('interviewSessions')
        .select('*')
        .eq('userId', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  // 🎯 GET USER ASSESSMENTS
  async getUserAssessments(userId, limit = 5) {
    try {
      const { data, error } = await supabase
        .from('interviewAssessments')
        .select('*')
        .eq('userId', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user assessments:', error);
      return [];
    }
  }

  // 📈 GET COMPREHENSIVE USER PROGRESS
  async getUserProgress(userId) {
    try {
      const [progressRes, sessions, assessments] = await Promise.all([
        supabase.from('userProgress').select('*').eq('userId', userId).single(),
        this.getUserSessions(userId),
        this.getUserAssessments(userId)
      ]);
      const progressData = progressRes.data || {};
      return {
        progress: progressData,
        sessions,
        assessments,
        success: true
      };
    } catch (error) {
      console.error('Error fetching comprehensive user progress:', error);
      throw error;
    }
  }

  // 🎨 CALCULATE TOPIC STATISTICS
  calculateTopicStats(sessions) {
    const topicStats = {};
    sessions.forEach(session => {
      if (session.topic) {
        if (!topicStats[session.topic]) {
          topicStats[session.topic] = {
            attempts: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            totalProblems: 0,
            solvedProblems: 0
          };
        }
        topicStats[session.topic].attempts += 1;
        if (session.type === 'mcq') {
          topicStats[session.topic].totalQuestions += session.totalQuestions || 0;
          topicStats[session.topic].correctAnswers += session.correctAnswers || 0;
        } else if (session.type === 'coding') {
          topicStats[session.topic].totalProblems += session.totalProblems || 0;
          topicStats[session.topic].solvedProblems += session.solvedProblems || 0;
        }
      }
    });
    return Object.entries(topicStats).map(([topic, stats]) => {
      let successRate = 0;
      if (stats.totalQuestions > 0 || stats.totalProblems > 0) {
        const mcqRate = stats.totalQuestions > 0 ? 
          (stats.correctAnswers / stats.totalQuestions) : 0;
        const codingRate = stats.totalProblems > 0 ? 
          (stats.solvedProblems / stats.totalProblems) : 0;
        successRate = Math.round(((mcqRate + codingRate) / 
          (stats.totalQuestions > 0 ? 1 : 0) + (stats.totalProblems > 0 ? 1 : 0)) * 100);
      }
      return {
        topic,
        attempts: stats.attempts,
        successRate
      };
    });
  }
}

export const progressService = new ProgressService();
export default progressService;
