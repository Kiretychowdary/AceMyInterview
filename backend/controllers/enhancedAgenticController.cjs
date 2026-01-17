// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * ENHANCED AGENTIC AI CONTROLLER
 * Multi-agent system: Planner + Action + Evaluator
 * Autonomous decision-making and proactive guidance
 */

const StudentPerformance = require('../models/StudentPerformance.cjs');
const ChatConversation = require('../models/ChatConversation.cjs');
const LearningMaterial = require('../models/LearningMaterial.cjs');
const axios = require('axios');

// Import AI Agents
const PlannerAgent = require('../agents/plannerAgent.cjs');
const ActionAgent = require('../agents/actionAgent.cjs');
const EvaluatorAgent = require('../agents/evaluatorAgent.cjs');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL || 
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:5000';

// Initialize agents
const plannerAgent = new PlannerAgent();
const actionAgent = new ActionAgent();
const evaluatorAgent = new EvaluatorAgent();

/**
 * AUTONOMOUS AGENT LOOP
 * Observe → Plan → Act → Evaluate → Learn
 */
exports.autonomousGuidance = async (req, res) => {
  try {
    const userId = req.user.uid;

    // 1. OBSERVE: Gather user state
    const userState = await observeUserState(userId);

    // 2. PLAN: Create learning plan
    const plan = await plannerAgent.createLearningPlan(userState);

    // 3. DECIDE: What action to take
    const nextAction = plannerAgent.decideNextAction(
      userState, 
      userState.recentActivity
    );

    // 4. ACT: Execute the action
    const actionResult = await actionAgent.executeAction(
      nextAction.action,
      {
        topic: plan.currentFocus,
        userLevel: userState.level,
        materials: await retrieveRelevantMaterials(plan.currentFocus),
        recentErrors: userState.recentActivity
          ?.filter(a => !a.correct)
          .map(a => a.topicName),
        milestone: plannerAgent.checkMilestones(userState.totalInteractions),
        stats: {
          total: userState.totalInteractions,
          mastered: Object.entries(userState.mastery)
            .filter(([_, score]) => score >= 85)
            .map(([id, _]) => getTopicName(parseInt(id))),
          streak: plannerAgent.getCorrectStreak(userState.recentActivity || [])
        },
        masteredTopics: Object.entries(userState.mastery)
          .filter(([_, score]) => score >= 85)
          .map(([id, _]) => getTopicName(parseInt(id))),
        weakTopic: plan.currentFocus,
        currentMastery: Math.round(userState.mastery[getTopicId(plan.currentFocus)] || 0),
        difficulty: userState.level === 'beginner' ? 'easy' : 'medium'
      }
    );

    // 5. EVALUATE: Analyze performance
    const performance = evaluatorAgent.analyzePerformance(userState);

    // 6. SAVE: Update conversation context
    await updateConversationContext(userId, {
      plan,
      action: nextAction,
      performance
    });

    res.json({
      success: true,
      guidance: {
        plan,
        action: actionResult,
        performance,
        nextAction: nextAction.reason
      }
    });

  } catch (error) {
    console.error('Error in autonomous guidance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate guidance'
    });
  }
};

/**
 * Get learning plan for user
 */
exports.getLearningPlan = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userState = await observeUserState(userId);
    const plan = await plannerAgent.createLearningPlan(userState);

    res.json({
      success: true,
      plan
    });

  } catch (error) {
    console.error('Error generating plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate plan'
    });
  }
};

/**
 * Get performance analysis
 */
exports.getPerformanceAnalysis = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userState = await observeUserState(userId);
    const report = await evaluatorAgent.generateReport(userState);

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
};

/**
 * Evaluate user answer
 */
exports.evaluateAnswer = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { problem, answer, topic } = req.body;

    const evaluation = await evaluatorAgent.evaluateAnswer({
      problem,
      userAnswer: answer,
      topic
    });

    // Record this interaction
    await StudentPerformance.create({
      userId,
      topicId: getTopicId(topic),
      interactionType: 'practice',
      correct: evaluation.isCorrect,
      timeTaken: 0,
      difficulty: 5,
      timestamp: new Date()
    });

    res.json({
      success: true,
      evaluation
    });

  } catch (error) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate answer'
    });
  }
};

/**
 * Check if ready to progress
 */
exports.checkReadiness = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { topic } = req.query;

    const userState = await observeUserState(userId);
    const topicId = getTopicId(topic);
    
    // Get recent accuracy for this topic
    const topicActivity = userState.recentActivity?.filter(a => a.topicId === topicId) || [];
    const recentAccuracy = topicActivity.length > 0
      ? (topicActivity.filter(a => a.correct).length / topicActivity.length) * 100
      : 0;

    const readiness = evaluatorAgent.checkReadiness(
      userState.mastery[topicId] || 0,
      topicActivity.length,
      recentAccuracy
    );

    res.json({
      success: true,
      readiness
    });

  } catch (error) {
    console.error('Error checking readiness:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check readiness'
    });
  }
};

/**
 * Enhanced chat with multi-agent system
 */
exports.agenticChat = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { message } = req.body;

    // Get or create session
    let session = await ChatConversation.findOne({ 
      userId, 
      isActive: true 
    }).sort({ updatedAt: -1 });

    if (!session) {
      session = await ChatConversation.create({
        userId,
        sessionId: `session_${Date.now()}`,
        messages: [],
        context: {},
        isActive: true
      });
    }

    // Observe user state
    const userState = await observeUserState(userId);

    // Check if message requires specific action
    const actionType = detectActionType(message);

    let response;

    if (actionType) {
      // Execute specific action
      const plan = await plannerAgent.createLearningPlan(userState);
      const actionResult = await actionAgent.executeAction(actionType, {
        topic: plan.currentFocus,
        userLevel: userState.level,
        materials: await retrieveRelevantMaterials(plan.currentFocus),
        masteredTopics: Object.entries(userState.mastery)
          .filter(([_, score]) => score >= 85)
          .map(([id, _]) => getTopicName(parseInt(id))),
        weakTopic: plan.currentFocus,
        currentMastery: Math.round(userState.mastery[getTopicId(plan.currentFocus)] || 0)
      });

      response = formatActionResponse(actionResult);

    } else {
      // Regular conversation with context
      const materials = await retrieveRelevantMaterials(message);
      const context = buildAgenticContext(userState, materials, session);
      response = await callGeminiAPI(message, context);
    }

    // Save messages
    session.messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'ai', content: response, timestamp: new Date() }
    );
    await session.save();

    res.json({
      success: true,
      response,
      sessionId: session.sessionId
    });

  } catch (error) {
    console.error('Error in agentic chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
};

/**
 * HELPER FUNCTIONS
 */

/**
 * Observe user state (all relevant data)
 */
async function observeUserState(userId) {
  try {
    // Get all performance data
    const allPerformance = await StudentPerformance.find({ userId })
      .sort({ timestamp: -1 })
      .limit(100);

    // Calculate mastery per topic
    const mastery = {};
    for (let i = 0; i < 10; i++) {
      const topicPerformance = allPerformance.filter(p => p.topicId === i);
      if (topicPerformance.length > 0) {
        const correctCount = topicPerformance.filter(p => p.correct).length;
        mastery[i] = (correctCount / topicPerformance.length) * 100;
      } else {
        mastery[i] = 0;
      }
    }

    // Recent activity (last 10)
    const recentActivity = allPerformance.slice(0, 10).map(p => ({
      topicId: p.topicId,
      topicName: getTopicName(p.topicId),
      correct: p.correct,
      timeTaken: p.timeTaken,
      difficulty: p.difficulty,
      timestamp: p.timestamp
    }));

    // Determine level
    const avgMastery = Object.values(mastery).reduce((a, b) => a + b, 0) / 10;
    const level = avgMastery < 40 ? 'beginner' : avgMastery < 70 ? 'intermediate' : 'advanced';

    // Identify weak topics
    const weakTopics = Object.entries(mastery)
      .filter(([_, score]) => score < 60)
      .map(([id, score]) => ({ id: parseInt(id), name: getTopicName(parseInt(id)), score }));

    // Identify strengths
    const strengths = Object.entries(mastery)
      .filter(([_, score]) => score >= 75)
      .map(([id, score]) => ({ id: parseInt(id), name: getTopicName(parseInt(id)), score }));

    return {
      userId,
      mastery,
      totalInteractions: allPerformance.length,
      recentActivity,
      level,
      weakTopics,
      strengths,
      goal: 'Master all topics for technical interviews'
    };

  } catch (error) {
    console.error('Error observing user state:', error);
    return {
      userId,
      mastery: {},
      totalInteractions: 0,
      recentActivity: [],
      level: 'beginner',
      weakTopics: [],
      strengths: [],
      goal: 'Master all topics'
    };
  }
}

/**
 * Retrieve relevant learning materials
 */
async function retrieveRelevantMaterials(query) {
  try {
    const materials = await LearningMaterial.find({
      $or: [
        { $text: { $search: query } },
        { topicName: new RegExp(query, 'i') },
        { keywords: { $in: [query.toLowerCase()] } }
      ]
    })
    .limit(5)
    .select('title content materialType difficulty');

    return materials;
  } catch (error) {
    console.error('Error retrieving materials:', error);
    return [];
  }
}

/**
 * Build agentic context for Gemini
 */
function buildAgenticContext(userState, materials, session) {
  const context = `You are an autonomous AI learning agent, not just a chatbot.

USER STATE:
- Level: ${userState.level}
- Total practice: ${userState.totalInteractions} problems
- Current mastery: ${JSON.stringify(Object.entries(userState.mastery).map(([id, score]) => 
    `${getTopicName(parseInt(id))}: ${Math.round(score)}%`
  ))}
- Strengths: ${userState.strengths.map(s => s.name).join(', ') || 'Building foundations'}
- Weak areas: ${userState.weakTopics.map(w => w.name).join(', ') || 'None yet'}

LEARNING MATERIALS:
${materials.map(m => `- ${m.title}: ${m.content.substring(0, 150)}...`).join('\n')}

RECENT CONVERSATION:
${session.messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}

YOUR ROLE:
You are NOT a passive Q&A bot. You are an ACTIVE learning guide who:
✅ Observes patterns in user behavior
✅ Decides what they need next
✅ Guides them proactively
✅ Challenges them appropriately
✅ Celebrates wins and supports struggles

RESPOND AS:
- A mentor who knows their journey
- Someone who plans their next steps
- A guide who asks diagnostic questions
- An agent who takes initiative

Be conversational but purposeful. Guide, don't just answer.`;

  return context;
}

/**
 * Detect if message requires specific action
 */
function detectActionType(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('explain') || lower.includes('what is') || lower.includes('how does')) {
    return 'explain_topic';
  }
  if (lower.includes('practice') || lower.includes('problem') || lower.includes('exercise')) {
    return 'give_practice';
  }
  if (lower.includes('assess') || lower.includes('test me') || lower.includes('quiz')) {
    return 'run_assessment';
  }
  if (lower.includes('plan') || lower.includes('roadmap') || lower.includes('what next')) {
    return null; // Handle via planner
  }
  if (lower.includes('project') || lower.includes('build')) {
    return 'suggest_project';
  }
  
  return null; // General conversation
}

/**
 * Format action response for chat
 */
function formatActionResponse(actionResult) {
  return `${actionResult.content}\n\n**${actionResult.nextAction || 'What would you like to do next?'}**`;
}

/**
 * Call Gemini API
 */
async function callGeminiAPI(message, context) {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: `${context}\n\nUSER MESSAGE: ${message}\n\nRESPOND:` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return "I'm here to help! Let me guide you through your learning journey. What topic would you like to focus on?";
  }
}

/**
 * Update conversation context
 */
async function updateConversationContext(userId, data) {
  try {
    await ChatConversation.updateOne(
      { userId, isActive: true },
      {
        $set: {
          'context.currentTopic': data.plan?.currentFocus,
          'context.lastRecommendation': data.action?.reason,
          'context.userMastery': data.performance?.overallScore
        }
      }
    );
  } catch (error) {
    console.error('Error updating context:', error);
  }
}

/**
 * Get topic name from ID
 */
function getTopicName(topicId) {
  const topics = [
    'Data Structures', 'Algorithms', 'OOP', 'Database Management',
    'Web Development', 'Software Engineering', 'Operating Systems',
    'Computer Networks', 'Machine Learning', 'Cloud Computing'
  ];
  return topics[topicId] || 'Unknown';
}

/**
 * Get topic ID from name
 */
function getTopicId(topicName) {
  const topics = [
    'Data Structures', 'Algorithms', 'OOP', 'Database Management',
    'Web Development', 'Software Engineering', 'Operating Systems',
    'Computer Networks', 'Machine Learning', 'Cloud Computing'
  ];
  return topics.findIndex(t => t.toLowerCase() === topicName.toLowerCase());
}
