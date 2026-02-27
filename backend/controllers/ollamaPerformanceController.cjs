// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * ML Service Controller
 * Handles integration with Python ML engine for student performance prediction
 */

const axios = require('axios');
const StudentPerformance = require('../models/StudentPerformance.cjs');
const StudentNotification = require('../models/StudentNotification.cjs');

// Ollama AI Service Configuration - External GPU Server
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://172.21.1.17:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

console.log('🤖 ML Engine Configuration:');
console.log(`   - Ollama URL: ${OLLAMA_BASE_URL}`);
console.log(`   - Model: ${OLLAMA_MODEL}`);

// Topic mapping (should match ML engine configuration)
const TOPICS = [
  { id: 0, name: 'Data Structures' },
  { id: 1, name: 'Algorithms' },
  { id: 2, name: 'Object-Oriented Programming' },
  { id: 3, name: 'Database Management' },
  { id: 4, name: 'Web Development' },
  { id: 5, name: 'Software Engineering' },
  { id: 6, name: 'Operating Systems' },
  { id: 7, name: 'Computer Networks' },
  { id: 8, name: 'Machine Learning' },
  { id: 9, name: 'Cloud Computing' }
];

/**
 * Record student interaction with a question
 */
exports.recordInteraction = async (req, res) => {
  try {
    const { topicId, topicName, questionId, correct, timeSpent } = req.body;
    const userId = req.user.uid;

    // Validate input
    if (topicId === undefined || correct === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: topicId, correct'
      });
    }

    // Find or create student performance record
    let performance = await StudentPerformance.findOne({ userId });
    
    if (!performance) {
      performance = new StudentPerformance({ userId });
    }

    // Add interaction
    await performance.addInteraction({
      topicId,
      topicName: topicName || TOPICS[topicId]?.name || `Topic ${topicId}`,
      questionId,
      correct: correct ? 1 : 0,
      timeSpent: timeSpent || 0
    });

    res.json({
      success: true,
      message: 'Interaction recorded',
      totalInteractions: performance.totalInteractions
    });

  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({
      error: 'Failed to record interaction',
      details: error.message
    });
  }
};

/**
 * Get performance prediction and recommendations for a student
 * Uses student's ACTUAL data from database - fully personalized
 */
exports.getPerformancePrediction = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Get student performance data
    const performance = await StudentPerformance.findOne({ userId });

    if (!performance || performance.interactions.length === 0) {
      return res.json({
        message: 'Welcome! Start solving problems to activate your personal AI trainer.',
        is_new_user: true,
        recommendation: {
          action_type: 'START',
          reason: 'Begin with any topic. Your personal AI will learn your style and guide you throughout your journey.',
          recommended_topic_id: 0,
          recommended_topic_name: TOPICS[0].name
        }
      });
    }

    // Generate AI prediction using Ollama
    const prompt = `You are an AI performance prediction system. Analyze student performance data and provide predictions.

Student ID: ${userId}
Total Interactions: ${performance.interactions.length}
Topics Attempted: ${performance.currentMastery.size}

Recent Performance:
${performance.interactions.slice(-5).map(i => `- Topic: ${TOPICS[i.topicId]?.name || 'Unknown'}, Correct: ${i.correct}, Time: ${i.timeSpent}s`).join('\n')}

Current Mastery Levels:
${Array.from(performance.currentMastery.entries()).map(([topicId, mastery]) => `- ${TOPICS[topicId]?.name || 'Unknown'}: ${(mastery * 100).toFixed(1)}%`).join('\n')}

Provide a JSON response with:
{
  "overall_mastery": <number 0-1>,
  "recommendation": {
    "action_type": "CONTINUE|REVIEW|NEW_TOPIC",
    "reason": "<explanation>",
    "recommended_topic_id": <number>,
    "recommended_topic_name": "<topic name>"
  },
  "mastery": {
    "<topic_name>": {"mastery_score": <number 0-1>}
  }
}`;

    const ollamaResponse = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false
    }, {
      timeout: 30000
    });

    const aiResponse = ollamaResponse.data.response || ollamaResponse.data;
    let prediction;
    
    try {
      const start = aiResponse.indexOf('{');
      const end = aiResponse.lastIndexOf('}') + 1;
      if (start >= 0 && end > start) {
        prediction = JSON.parse(aiResponse.substring(start, end));
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      // Fallback to simple calculation
      const avgMastery = Array.from(performance.currentMastery.values()).reduce((sum, m) => sum + m, 0) / performance.currentMastery.size || 0;
      const weakestTopic = Array.from(performance.currentMastery.entries()).sort((a, b) => a[1] - b[1])[0];
      
      prediction = {
        overall_mastery: avgMastery,
        recommendation: {
          action_type: avgMastery > 0.7 ? 'NEW_TOPIC' : 'REVIEW',
          reason: `Focus on improving weaker areas`,
          recommended_topic_id: weakestTopic ? weakestTopic[0] : 0,
          recommended_topic_name: weakestTopic ? TOPICS[weakestTopic[0]]?.name : TOPICS[0].name
        },
        mastery: {}
      };
      
      Array.from(performance.currentMastery.entries()).forEach(([topicId, score]) => {
        const topicName = TOPICS[topicId]?.name || 'Unknown';
        prediction.mastery[topicName] = { mastery_score: score };
      });
    }

    // Update current mastery in database
    if (prediction.mastery) {
      const masteryMap = new Map();
      Object.keys(prediction.mastery).forEach((topicName, index) => {
        masteryMap.set(index, prediction.mastery[topicName].mastery_score);
      });
      performance.currentMastery = masteryMap;
      performance.overallMastery = prediction.overall_mastery || 0;
      await performance.save();
    }

    // Check for new completions and send notifications
    const notifications = [];
    if (prediction.completed_topics && prediction.completed_topics.length > 0) {
      for (const completed of prediction.completed_topics) {
        // Create notification in database
        const notification = new StudentNotification({
          userId: req.user.uid,
          type: 'TOPIC_COMPLETED',
          title: `🎉 Congratulations! ${completed.topic} Mastered!`,
          message: `You've achieved ${(completed.mastery * 100).toFixed(1)}% mastery in ${completed.topic}. Your personal AI trainer is proud of you!`,
          metadata: new Map([
            ['topic', completed.topic],
            ['mastery', completed.mastery],
            ['timestamp', new Date().toISOString()]
          ])
        });
        await notification.save();
        
        notifications.push({
          type: 'TOPIC_COMPLETED',
          title: notification.title,
          message: notification.message,
          timestamp: notification.createdAt,
          mastery: completed.mastery
        });
      }
    }

    res.json({
      success: true,
      studentId: userId,
      totalInteractions: performance.totalInteractions,
      prediction: prediction,
      notifications: notifications,
      is_personal_ai: true
    });

  } catch (error) {
    console.error('Error getting performance prediction:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Personal AI trainer unavailable',
        message: 'Your AI guidance system is currently offline. Please try again later.'
      });
    }

    res.status(500).json({
      error: 'Failed to get performance prediction',
      details: error.message
    });
  }
};

/**
 * Get detailed analytics for a student
 * Uses personal data only
 */
exports.getStudentAnalytics = async (req, res) => {
  try {
    const userId = req.user.uid;

    const performance = await StudentPerformance.findOne({ userId });

    if (!performance || performance.interactions.length === 0) {
      return res.json({
        message: 'No data available. Start your learning journey!',
        totalInteractions: 0
      });
    }

    // Calculate analytics locally (no need for external ML service)
    const topicBreakdown = {};
    TOPICS.forEach(topic => {
      const topicInteractions = performance.interactions.filter(
        i => i.topicId === topic.id
      );
      
      if (topicInteractions.length > 0) {
        const correct = topicInteractions.filter(i => i.correct === 1).length;
        topicBreakdown[topic.name] = {
          attempts: topicInteractions.length,
          correct: correct,
          accuracy: correct / topicInteractions.length,
          averageTime: topicInteractions.reduce((sum, i) => sum + (i.timeSpent || 0), 0) / topicInteractions.length
        };
      }
    });

    res.json({
      success: true,
      studentId: userId,
      localStats: {
        topicBreakdown,
        totalInteractions: performance.totalInteractions,
        lastUpdated: performance.lastUpdated
      },
      personal_insights: {
        learning_style: performance.interactions.length > 10 ? 'Progressive' : 'Getting Started',
        consistency_score: performance.totalInteractions / Math.max(1, Math.ceil((new Date() - performance.createdAt) / (1000 * 60 * 60 * 24)))
      }
    });

  } catch (error) {
    console.error('Error getting student analytics:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      details: error.message
    });
  }
};

/**
 * Get dashboard summary for student
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.uid;

    const performance = await StudentPerformance.findOne({ userId });

    if (!performance || performance.interactions.length === 0) {
      return res.json({
        message: 'Start solving problems to see your progress',
        stats: {
          totalInteractions: 0,
          overallMastery: 0,
          topicsStarted: 0
        }
      });
    }

    // Calculate basic stats
    const uniqueTopics = new Set(performance.interactions.map(i => i.topicId));
    const recentInteractions = performance.getRecentInteractions(10);
    const recentCorrect = recentInteractions.filter(i => i.correct === 1).length;

    res.json({
      success: true,
      stats: {
        totalInteractions: performance.totalInteractions,
        overallMastery: performance.overallMastery || 0,
        topicsStarted: uniqueTopics.size,
        recentAccuracy: recentInteractions.length > 0 ? recentCorrect / recentInteractions.length : 0
      },
      recentActivity: recentInteractions.map(i => ({
        topic: i.topicName,
        correct: i.correct === 1,
        timestamp: i.timestamp
      }))
    });

  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({
      error: 'Failed to get dashboard summary',
      details: error.message
    });
  }
};

/**
 * Get available topics
 */
exports.getTopics = async (req, res) => {
  try {
    res.json({
      topics: TOPICS,
      total: TOPICS.length,
      source: 'local'
    });
  } catch (error) {
    console.error('Error getting topics:', error);
    res.status(500).json({
      error: 'Failed to get topics',
      details: error.message
    });
  }
};

/**
 * Health check for Ollama service integration
 */
exports.healthCheck = async (req, res) => {
  try {
    const ollamaResponse = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
      timeout: 5000
    });

    res.json({
      status: 'healthy',
      ollama: {
        status: 'connected',
        url: OLLAMA_BASE_URL,
        model: OLLAMA_MODEL,
        available_models: ollamaResponse.data.models || []
      },
      database: 'connected',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ollama health check failed:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      ollama: {
        status: 'disconnected',
        error: error.message,
        hint: 'Start Ollama: ollama serve'
      },
      database: 'connected'
    });
  }
};

/**
 * Get user notifications from personal AI trainer
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { unreadOnly = false, limit = 20 } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await StudentNotification
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await StudentNotification.countDocuments({
      userId,
      read: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length
    });

  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      error: 'Failed to get notifications',
      details: error.message
    });
  }
};

/**
 * Mark notification as read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.uid;

    const notification = await StudentNotification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification:', error);
    res.status(500).json({
      error: 'Failed to mark notification',
      details: error.message
    });
  }
};
