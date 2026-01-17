// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * Agentic AI Controller
 * Conversational AI that actively guides users based on their performance
 */

const axios = require('axios');
const ChatConversation = require('../models/ChatConversation.cjs');
const StudentPerformance = require('../models/StudentPerformance.cjs');
const LearningMaterial = require('../models/LearningMaterial.cjs');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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
 * Get or create active chat session
 */
exports.getChatSession = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Try to find active session
    let session = await ChatConversation.findOne({ 
      userId, 
      isActive: true 
    }).sort({ lastInteraction: -1 });

    // Create new session if none exists
    if (!session) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get user's current performance
      const performance = await StudentPerformance.findOne({ userId });
      const userMastery = performance ? Object.fromEntries(performance.currentMastery || new Map()) : {};
      
      session = new ChatConversation({
        userId,
        sessionId,
        messages: [{
          role: 'assistant',
          content: `👋 Hi! I'm your personal AI learning companion! I've been tracking your progress and I'm here to help you master interview preparation. 

I can:
• Guide you to the right topics based on your performance
• Explain concepts when you're stuck
• Celebrate your achievements
• Keep you motivated

What would you like to work on today?`,
          timestamp: new Date()
        }],
        context: {
          userMastery: new Map(Object.entries(userMastery))
        }
      });
      
      await session.save();
    }

    res.json({
      success: true,
      sessionId: session.sessionId,
      messages: session.messages,
      context: session.context
    });

  } catch (error) {
    console.error('Error getting chat session:', error);
    res.status(500).json({
      error: 'Failed to get chat session',
      details: error.message
    });
  }
};

/**
 * Send message to AI agent
 */
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Find session
    let session = await ChatConversation.findOne({ userId, sessionId, isActive: true });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Add user message
    await session.addMessage('user', message);

    // Get user's current performance data
    const performance = await StudentPerformance.findOne({ userId });
    const userMastery = performance ? Object.fromEntries(performance.currentMastery || new Map()) : {};
    
    // Get recent interactions for context
    const recentInteractions = performance ? performance.interactions.slice(-10) : [];
    
    // Calculate topic statistics
    const topicStats = {};
    TOPICS.forEach(topic => {
      const topicInteractions = performance ? 
        performance.interactions.filter(i => i.topicId === topic.id) : [];
      
      if (topicInteractions.length > 0) {
        const correct = topicInteractions.filter(i => i.correct === 1).length;
        topicStats[topic.name] = {
          attempts: topicInteractions.length,
          accuracy: (correct / topicInteractions.length * 100).toFixed(1),
          mastery: (userMastery[topic.id] || 0) * 100
        };
      }
    });

    // Retrieve relevant learning materials (RAG)
    const relevantMaterials = await retrieveRelevantMaterials(message, session.context.currentTopicId);

    // Build AI prompt with full context
    const aiPrompt = buildAgenticPrompt(
      message,
      session.messages.slice(-6),  // Last 3 exchanges
      userMastery,
      topicStats,
      recentInteractions,
      relevantMaterials,
      session.context
    );

    // Call Gemini API
    const aiResponse = await callGeminiAPI(aiPrompt);

    // Add AI response to session
    await session.addMessage('assistant', aiResponse, {
      userMastery,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      response: aiResponse,
      sessionId: session.sessionId,
      context: session.context
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      details: error.message
    });
  }
};

/**
 * Proactive AI suggestions based on user activity
 */
exports.getProactiveSuggestion = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Get user performance
    const performance = await StudentPerformance.findOne({ userId });
    
    if (!performance || performance.interactions.length === 0) {
      return res.json({
        suggestion: "👋 Let's get started! Choose any topic to begin your learning journey.",
        type: 'welcome'
      });
    }

    const userMastery = Object.fromEntries(performance.currentMastery || new Map());
    const recentInteractions = performance.interactions.slice(-5);

    // Analyze recent performance
    const recentCorrect = recentInteractions.filter(i => i.correct === 1).length;
    const recentAccuracy = recentCorrect / recentInteractions.length;

    let suggestion = '';
    let type = 'guidance';

    // Find weakest and strongest topics
    const masteryArray = Object.entries(userMastery);
    const weakestTopic = masteryArray.length > 0 ? 
      masteryArray.reduce((min, curr) => curr[1] < min[1] ? curr : min) : null;
    const strongestTopic = masteryArray.length > 0 ?
      masteryArray.reduce((max, curr) => curr[1] > max[1] ? curr : max) : null;

    // Generate contextual suggestion
    if (recentAccuracy < 0.5) {
      const topicName = TOPICS.find(t => t.id === parseInt(weakestTopic[0]))?.name || 'this topic';
      suggestion = `💪 I noticed you're facing some challenges with ${topicName}. Would you like me to explain the key concepts or provide practice tips?`;
      type = 'encouragement';
    } else if (recentAccuracy > 0.8 && strongestTopic && strongestTopic[1] > 0.7) {
      const topicName = TOPICS.find(t => t.id === parseInt(strongestTopic[0]))?.name || 'this';
      suggestion = `🎉 You're doing amazing with ${topicName}! Ready to explore a new challenge?`;
      type = 'celebration';
    } else if (performance.totalInteractions % 10 === 0) {
      suggestion = `📊 Great progress! You've completed ${performance.totalInteractions} problems. Let's review your strengths and areas to improve.`;
      type = 'milestone';
    } else {
      suggestion = `🚀 Keep going! You're on the right track. Want personalized guidance for your next topic?`;
      type = 'motivation';
    }

    res.json({
      suggestion,
      type,
      userStats: {
        totalInteractions: performance.totalInteractions,
        recentAccuracy: (recentAccuracy * 100).toFixed(1),
        weakestTopic: weakestTopic ? TOPICS.find(t => t.id === parseInt(weakestTopic[0]))?.name : null,
        strongestTopic: strongestTopic ? TOPICS.find(t => t.id === parseInt(strongestTopic[0]))?.name : null
      }
    });

  } catch (error) {
    console.error('Error getting proactive suggestion:', error);
    res.status(500).json({
      error: 'Failed to get suggestion',
      details: error.message
    });
  }
};

/**
 * Get chat history
 */
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 5 } = req.query;

    const sessions = await ChatConversation
      .find({ userId })
      .sort({ lastInteraction: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      sessions: sessions.map(s => ({
        sessionId: s.sessionId,
        messageCount: s.messages.length,
        lastInteraction: s.lastInteraction,
        isActive: s.isActive,
        preview: s.messages.length > 0 ? s.messages[s.messages.length - 1].content.substring(0, 100) : ''
      }))
    });

  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      error: 'Failed to get chat history',
      details: error.message
    });
  }
};

/**
 * Helper: Retrieve relevant learning materials using RAG
 */
async function retrieveRelevantMaterials(query, topicId) {
  try {
    const searchQuery = {
      $or: [
        { $text: { $search: query } },
        { keywords: { $in: query.toLowerCase().split(' ') } }
      ]
    };

    if (topicId !== undefined) {
      searchQuery.topicId = topicId;
    }

    const materials = await LearningMaterial
      .find(searchQuery)
      .limit(3)
      .select('title content materialType difficulty');

    return materials;
  } catch (error) {
    console.error('Error retrieving materials:', error);
    return [];
  }
}

/**
 * Helper: Build comprehensive prompt for AI
 */
function buildAgenticPrompt(userMessage, conversationHistory, userMastery, topicStats, recentInteractions, materials, context) {
  const masteryText = Object.entries(userMastery)
    .map(([topicId, score]) => {
      const topic = TOPICS.find(t => t.id === parseInt(topicId));
      return `${topic?.name || `Topic ${topicId}`}: ${(score * 100).toFixed(1)}%`;
    })
    .join(', ');

  const historyText = conversationHistory
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const materialsText = materials.length > 0 ?
    materials.map(m => `- ${m.title}: ${m.content.substring(0, 200)}...`).join('\n') :
    'No specific materials available';

  const prompt = `You are an expert AI learning companion for interview preparation. You're having a conversation with a student.

STUDENT'S CURRENT PERFORMANCE:
${masteryText || 'Just starting out'}

TOPIC STATISTICS:
${Object.entries(topicStats).map(([topic, stats]) => 
  `${topic}: ${stats.attempts} attempts, ${stats.accuracy}% accuracy, ${stats.mastery.toFixed(1)}% mastery`
).join('\n') || 'No practice yet'}

RECENT ACTIVITY:
${recentInteractions.length > 0 ? 
  recentInteractions.map(i => {
    const topic = TOPICS.find(t => t.id === i.topicId);
    return `${topic?.name}: ${i.correct ? '✓' : '✗'}`;
  }).join(', ') : 
  'No recent activity'}

RELEVANT LEARNING MATERIALS:
${materialsText}

CONVERSATION HISTORY:
${historyText}

CURRENT CONTEXT:
- Current Topic: ${context.currentTopic || 'Not set'}
- Last Recommendation: ${context.lastRecommendation || 'None'}

STUDENT'S MESSAGE:
${userMessage}

YOUR ROLE:
- Be encouraging, supportive, and motivating
- Provide specific, actionable guidance
- Celebrate achievements
- Explain concepts clearly when asked
- Recommend next topics based on mastery
- Use emojis to keep it engaging
- Keep responses concise (2-3 paragraphs max)
- Always be proactive in guiding learning

Respond naturally and helpfully:`;

  return prompt;
}

/**
 * Helper: Call Gemini API
 */
async function callGeminiAPI(prompt) {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.8,
          topK: 40
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text.trim();
    }

    return "I'm here to help! Could you tell me more about what you'd like to learn?";

  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    return "I'm having trouble connecting right now, but I'm still here to support your learning journey! Let me know how I can help.";
  }
}
