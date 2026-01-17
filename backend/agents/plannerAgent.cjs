// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * PLANNER AGENT
 * Analyzes user state and creates learning plans
 * Decides what the user should do next
 */

const axios = require('axios');

class PlannerAgent {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiUrl = process.env.GEMINI_API_URL || 
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Analyze user state and create learning plan
   */
  async createLearningPlan(userState) {
    const { mastery, totalInteractions, weakTopics, strengths, goal } = userState;

    // Decision tree logic
    const plan = {
      currentFocus: null,
      nextSteps: [],
      reasoning: '',
      timeEstimate: '',
      actionType: null
    };

    // Identify current focus topic
    const topicNames = [
      'Data Structures', 'Algorithms', 'OOP', 'Database Management',
      'Web Development', 'Software Engineering', 'Operating Systems',
      'Computer Networks', 'Machine Learning', 'Cloud Computing'
    ];

    // Find topics that need work (mastery < 70%)
    const needsWork = Object.entries(mastery)
      .filter(([_, score]) => score < 70)
      .sort((a, b) => a[1] - b[1]) // Sort by lowest mastery first
      .map(([topicId, score]) => ({ 
        topicId: parseInt(topicId), 
        topicName: topicNames[topicId],
        score 
      }));

    // Find mastered topics (mastery >= 85%)
    const mastered = Object.entries(mastery)
      .filter(([_, score]) => score >= 85)
      .map(([topicId, score]) => ({ 
        topicId: parseInt(topicId), 
        topicName: topicNames[topicId],
        score 
      }));

    // DECISION LOGIC
    if (totalInteractions === 0) {
      // Complete beginner
      plan.currentFocus = topicNames[0];
      plan.actionType = 'onboard';
      plan.reasoning = 'New learner - starting with fundamentals';
      plan.nextSteps = [
        'Complete Data Structures assessment',
        'Learn basic array operations',
        'Practice 5 easy problems'
      ];
      plan.timeEstimate = '1 week';

    } else if (needsWork.length === 0) {
      // All topics mastered!
      plan.currentFocus = 'Advanced Projects';
      plan.actionType = 'advance';
      plan.reasoning = 'All core topics mastered - ready for real projects';
      plan.nextSteps = [
        'Build a full-stack project',
        'Contribute to open source',
        'Prepare for system design interviews'
      ];
      plan.timeEstimate = '2-3 weeks';

    } else if (weakTopics && weakTopics.length > 0) {
      // Has specific weak topics
      const weakestTopic = needsWork[0];
      plan.currentFocus = weakestTopic.topicName;
      plan.actionType = 'strengthen';
      plan.reasoning = `Focusing on weakest area: ${weakestTopic.topicName} (${Math.round(weakestTopic.score)}% mastery)`;
      plan.nextSteps = [
        `Review ${weakestTopic.topicName} fundamentals`,
        'Practice targeted problems',
        'Take assessment to measure improvement'
      ];
      plan.timeEstimate = '3-5 days';

    } else {
      // Progressive learning path
      const currentTopic = needsWork[0];
      plan.currentFocus = currentTopic.topicName;
      plan.actionType = 'progress';
      plan.reasoning = `Next topic in learning path: ${currentTopic.topicName}`;
      plan.nextSteps = [
        `Learn ${currentTopic.topicName} concepts`,
        'Complete practice exercises',
        'Move to next topic after 70% mastery'
      ];
      plan.timeEstimate = '1 week';
    }

    // Get AI-enhanced plan with reasoning
    const enhancedPlan = await this.enhancePlanWithAI(plan, userState);
    
    return enhancedPlan;
  }

  /**
   * Use Gemini to enhance plan with detailed reasoning
   */
  async enhancePlanWithAI(basePlan, userState) {
    const prompt = `You are an expert learning planner for technical interview preparation.

USER STATE:
- Total practice: ${userState.totalInteractions} problems
- Mastery levels: ${JSON.stringify(userState.mastery)}
- Goal: ${userState.goal || 'Master all topics'}

BASE PLAN:
- Focus: ${basePlan.currentFocus}
- Action: ${basePlan.actionType}
- Steps: ${basePlan.nextSteps.join(', ')}

YOUR TASK:
Enhance this plan with:
1. Detailed reasoning (WHY this focus?)
2. Specific, actionable steps (WHAT to do?)
3. Success criteria (HOW to know you're ready?)
4. Motivation (encouraging message)

Format as JSON:
{
  "reasoning": "detailed explanation",
  "steps": ["step1", "step2", "step3"],
  "successCriteria": "when to move on",
  "motivation": "encouraging message"
}`;

    try {
      const response = await axios.post(
        `${this.geminiUrl}?key=${this.geminiApiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        }
      );

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const enhanced = JSON.parse(jsonMatch[0]);
        return {
          ...basePlan,
          reasoning: enhanced.reasoning,
          nextSteps: enhanced.steps,
          successCriteria: enhanced.successCriteria,
          motivation: enhanced.motivation
        };
      }
    } catch (error) {
      console.error('Error enhancing plan with AI:', error.message);
    }

    return basePlan;
  }

  /**
   * Decide next action based on user state
   */
  decideNextAction(userState, recentActivity) {
    const actions = {
      EXPLAIN: 'explain_topic',
      PRACTICE: 'give_practice',
      ASSESS: 'run_assessment',
      REVIEW: 'review_mistakes',
      CELEBRATE: 'celebrate_progress',
      MOTIVATE: 'motivate_user',
      PROJECT: 'suggest_project'
    };

    // Decision tree
    if (!recentActivity || recentActivity.length === 0) {
      return { 
        action: actions.EXPLAIN,
        reason: 'No recent activity - start with explanation'
      };
    }

    const lastActivity = recentActivity[0];
    const incorrectCount = recentActivity.filter(a => !a.correct).length;
    const correctStreak = this.getCorrectStreak(recentActivity);

    // User struggling (3+ incorrect in last 5)
    if (incorrectCount >= 3 && recentActivity.length >= 5) {
      return {
        action: actions.REVIEW,
        reason: 'Struggling with concepts - review needed'
      };
    }

    // User on winning streak (5+ correct)
    if (correctStreak >= 5) {
      return {
        action: actions.CELEBRATE,
        reason: 'Excellent performance - celebrate success'
      };
    }

    // User mastered topic (85%+)
    const currentMastery = userState.mastery[lastActivity.topicId] || 0;
    if (currentMastery >= 85) {
      return {
        action: actions.PROJECT,
        reason: 'Topic mastered - suggest real project'
      };
    }

    // Default: continue practice
    return {
      action: actions.PRACTICE,
      reason: 'Continue targeted practice'
    };
  }

  /**
   * Calculate correct answer streak
   */
  getCorrectStreak(recentActivity) {
    let streak = 0;
    for (const activity of recentActivity) {
      if (activity.correct) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  /**
   * Evaluate if user is ready to move on
   */
  isReadyToAdvance(topicMastery, practiceCount) {
    return topicMastery >= 70 && practiceCount >= 10;
  }

  /**
   * Generate milestone rewards
   */
  checkMilestones(totalInteractions) {
    const milestones = {
      10: { badge: '🌱 Getting Started', message: '10 problems solved!' },
      25: { badge: '🔥 On Fire', message: '25 problems conquered!' },
      50: { badge: '⭐ Rising Star', message: '50 problems mastered!' },
      100: { badge: '🏆 Champion', message: '100 problems destroyed!' },
      250: { badge: '👑 Legend', message: '250 problems annihilated!' },
      500: { badge: '🚀 Unstoppable', message: '500 problems obliterated!' }
    };

    return milestones[totalInteractions] || null;
  }
}

module.exports = PlannerAgent;
