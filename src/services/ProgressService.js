// PROGRESS TRACKING SERVICE - COMPREHENSIVE DATA MANAGEMENT
import { db } from '../components/firebase.config';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

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

      // Save to Firestore
      const sessionRef = await addDoc(collection(db, 'interviewSessions'), {
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
        timestamp: serverTimestamp()
      });

      // Update user progress summary
      await this.updateUserProgress(userId, {
        totalMCQAttempts: 1,
        totalMCQQuestions: totalQuestions,
        totalCorrectAnswers: correctAnswers,
        lastActivity: new Date()
      });

      // Also send to backend for additional processing
      const response = await fetch(`${this.API_BASE_URL}/api/store-mcq-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          topic,
          difficulty,
          totalQuestions,
          correctAnswers,
          timeSpent,
          questions,
          answers
        }),
      });

      const result = await response.json();
      
      return {
        success: true,
        sessionId: sessionRef.id,
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

      // Save to Firestore
      const sessionRef = await addDoc(collection(db, 'interviewSessions'), {
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
        timestamp: serverTimestamp()
      });

      // Update user progress summary
      await this.updateUserProgress(userId, {
        totalCodingAttempts: 1,
        totalCodingProblems: totalProblems,
        totalSolvedProblems: solvedProblems,
        lastActivity: new Date()
      });

      // Send to backend
      const response = await fetch(`${this.API_BASE_URL}/api/store-coding-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        }),
      });

      const result = await response.json();
      
      return {
        success: true,
        sessionId: sessionRef.id,
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

      // Save assessment to Firestore
      const assessmentRef = await addDoc(collection(db, 'interviewAssessments'), {
        userId,
        type: 'interview',
        interviewType,
        topic,
        difficulty,
        duration,
        interviewQuestions,
        userResponses,
        assessment: aiAssessment,
        timestamp: serverTimestamp()
      });

      // Update user progress summary
      await this.updateUserProgress(userId, {
        totalFaceToFaceInterviews: 1,
        lastAssessmentRating: aiAssessment.overallRating,
        lastActivity: new Date()
      });

      return {
        success: true,
        assessmentId: assessmentRef.id,
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Assessment failed');
      }

      return result.assessment;

    } catch (error) {
      console.error('Error getting AI assessment:', error);
      throw error;
    }
  }

  // 📈 UPDATE USER PROGRESS SUMMARY
  async updateUserProgress(userId, progressUpdate) {
    try {
      const userProgressRef = doc(db, 'userProgress', userId);
      const userProgressDoc = await getDoc(userProgressRef);

      if (userProgressDoc.exists()) {
        const currentData = userProgressDoc.data();
        const updatedData = {
          totalMCQAttempts: (currentData.totalMCQAttempts || 0) + (progressUpdate.totalMCQAttempts || 0),
          totalCodingAttempts: (currentData.totalCodingAttempts || 0) + (progressUpdate.totalCodingAttempts || 0),
          totalFaceToFaceInterviews: (currentData.totalFaceToFaceInterviews || 0) + (progressUpdate.totalFaceToFaceInterviews || 0),
          totalMCQQuestions: (currentData.totalMCQQuestions || 0) + (progressUpdate.totalMCQQuestions || 0),
          totalCorrectAnswers: (currentData.totalCorrectAnswers || 0) + (progressUpdate.totalCorrectAnswers || 0),
          totalCodingProblems: (currentData.totalCodingProblems || 0) + (progressUpdate.totalCodingProblems || 0),
          totalSolvedProblems: (currentData.totalSolvedProblems || 0) + (progressUpdate.totalSolvedProblems || 0),
          lastActivity: progressUpdate.lastActivity || currentData.lastActivity,
          lastAssessmentRating: progressUpdate.lastAssessmentRating || currentData.lastAssessmentRating,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(userProgressRef, updatedData);
      } else {
        // Create new progress document
        await setDoc(userProgressRef, {
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
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
      // Use simple query without orderBy to avoid compound index requirement
      const sessionsQuery = query(
        collection(db, 'interviewSessions'),
        where('userId', '==', userId),
        limit(limit * 2) // Get more to sort in memory
      );

      const snapshot = await getDocs(sessionsQuery);
      const sessions = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          // Sort by timestamp in memory
          const timeA = a.timestamp?.toDate?.() || a.timestamp || new Date(0);
          const timeB = b.timestamp?.toDate?.() || b.timestamp || new Date(0);
          return new Date(timeB) - new Date(timeA);
        })
        .slice(0, limit); // Take only the requested number

      return sessions;

    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return []; // Return empty array on error
    }
  }

  // 🎯 GET USER ASSESSMENTS
  async getUserAssessments(userId, limit = 5) {
    try {
      // Use simple query without orderBy to avoid compound index requirement
      const assessmentsQuery = query(
        collection(db, 'interviewAssessments'),
        where('userId', '==', userId),
        limit(limit * 2) // Get more to sort in memory
      );

      const snapshot = await getDocs(assessmentsQuery);
      const assessments = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {
          // Sort by timestamp in memory
          const timeA = a.timestamp?.toDate?.() || a.timestamp || new Date(0);
          const timeB = b.timestamp?.toDate?.() || b.timestamp || new Date(0);
          return new Date(timeB) - new Date(timeA);
        })
        .slice(0, limit); // Take only the requested number

      return assessments;

    } catch (error) {
      console.error('Error fetching user assessments:', error);
      return []; // Return empty array on error
    }
  }

  // 📈 GET COMPREHENSIVE USER PROGRESS
  async getUserProgress(userId) {
    try {
      const [progressDoc, sessions, assessments] = await Promise.all([
        getDoc(doc(db, 'userProgress', userId)),
        this.getUserSessions(userId),
        this.getUserAssessments(userId)
      ]);

      const progressData = progressDoc.exists() ? progressDoc.data() : {};

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

// Export singleton instance
export const progressService = new ProgressService();
export default progressService;
