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
      const {
        topic,
        difficulty,
        totalQuestions,
        correctAnswers,
        timeSpent,
        questions,
        answers
      } = sessionData;
      const { data, error } = await supabase
        .from('interviewSessions')
        .insert([
          {
            userId,
            type: 'mcq',
            topic,
            difficulty,
            totalQuestions,
            correctAnswers,
            timeSpent,
            questions,
            answers,
            accuracy: Math.round((correctAnswers / totalQuestions) * 100),
            timestamp: new Date().toISOString()
          }
        ])
        .select();
      if (error) throw error;
      await this.updateUserProgress(userId, {
        totalMCQAttempts: 1,
        totalMCQQuestions: totalQuestions,
        totalCorrectAnswers: correctAnswers,
        lastActivity: new Date().toISOString()
      });
      const response = await fetch(`${this.API_BASE_URL}/api/store-mcq-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          topic,
          difficulty,
          totalQuestions,
          correctAnswers,
          timeSpent,
          questions,
          answers
        })
      });
      const result = await response.json();
      return {
        success: true,
        sessionId: data[0]?.id,
        data: result
      };
    } catch (error) {
      console.error('Error saving MCQ session:', error);
      throw error;
    }
  }

  // 💻 CODING SESSION TRACKING
  async saveCodingSession(userId, sessionData) {
    try {
      const {
        topic,
        difficulty,
        language,
        totalProblems,
        solvedProblems,
        timeSpent,
        problems,
        solutions
      } = sessionData;
      const { data, error } = await supabase
        .from('interviewSessions')
        .insert([
          {
            userId,
            type: 'coding',
            topic,
            difficulty,
            language,
            totalProblems,
            solvedProblems,
            timeSpent,
            problems,
            solutions,
            successRate: Math.round((solvedProblems / totalProblems) * 100),
            timestamp: new Date().toISOString()
          }
        ])
        .select();
      if (error) throw error;
      await this.updateUserProgress(userId, {
        totalCodingAttempts: 1,
        totalCodingProblems: totalProblems,
        totalSolvedProblems: solvedProblems,
        lastActivity: new Date().toISOString()
      });
      const response = await fetch(`${this.API_BASE_URL}/api/store-coding-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          topic,
          difficulty,
          language,
          totalProblems,
          solvedProblems,
          timeSpent,
          problems,
          solutions
        })
      });
      const result = await response.json();
      return {
        success: true,
        sessionId: data[0]?.id,
        data: result
      };
    } catch (error) {
      console.error('Error saving coding session:', error);
      throw error;
    }
  }

  // 🎤 FACE-TO-FACE INTERVIEW ASSESSMENT
  async saveInterviewAssessment(userId, assessmentData) {
    try {
      const {
        interviewType,
        topic,
        difficulty,
        duration,
        interviewQuestions,
        userResponses,
        aiAssessment
      } = assessmentData;
      const { data, error } = await supabase
        .from('interviewAssessments')
        .insert([
          {
            userId,
            type: 'interview',
            interviewType,
            topic,
            difficulty,
            duration,
            interviewQuestions,
            userResponses,
            assessment: aiAssessment,
            timestamp: new Date().toISOString()
          }
        ])
        .select();
      if (error) throw error;
      await this.updateUserProgress(userId, {
        totalFaceToFaceInterviews: 1,
        lastAssessmentRating: aiAssessment.overallRating,
        lastActivity: new Date().toISOString()
      });
      return {
        success: true,
        assessmentId: data[0]?.id,
        assessment: aiAssessment
      };
    } catch (error) {
      console.error('Error saving interview assessment:', error);
      throw error;
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
