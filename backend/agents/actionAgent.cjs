// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * ACTION AGENT
 * Executes specific learning actions
 * Generates content based on action type
 */

const axios = require('axios');
const LearningMaterial = require('../models/LearningMaterial.cjs');

class ActionAgent {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiUrl = process.env.GEMINI_API_URL || 
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Execute action based on type
   */
  async executeAction(actionType, context) {
    const actions = {
      'explain_topic': () => this.explainTopic(context),
      'give_practice': () => this.generatePractice(context),
      'run_assessment': () => this.createAssessment(context),
      'review_mistakes': () => this.reviewMistakes(context),
      'celebrate_progress': () => this.celebrateProgress(context),
      'motivate_user': () => this.motivateUser(context),
      'suggest_project': () => this.suggestProject(context),
      'onboard': () => this.onboardUser(context),
      'advance': () => this.advanceUser(context),
      'strengthen': () => this.strengthenWeakness(context)
    };

    const actionFunc = actions[actionType];
    if (!actionFunc) {
      return {
        type: 'error',
        message: 'Unknown action type'
      };
    }

    return await actionFunc();
  }

  /**
   * Explain a topic with examples
   */
  async explainTopic(context) {
    const { topic, userLevel, materials } = context;

    const prompt = `You are a technical interview coach explaining ${topic}.

USER LEVEL: ${userLevel || 'intermediate'}

LEARNING MATERIALS:
${materials ? materials.map(m => `- ${m.title}: ${m.content.substring(0, 200)}...`).join('\n') : 'No materials available'}

YOUR TASK:
Explain ${topic} in a clear, engaging way:
1. Start with a simple analogy
2. Define the concept
3. Give a practical example
4. Explain why it matters
5. Common use cases

Keep it conversational and encouraging. Max 400 words.`;

    try {
      const response = await this.callGemini(prompt);
      return {
        type: 'explanation',
        topic,
        content: response,
        nextAction: 'Would you like to try some practice problems on this topic?'
      };
    } catch (error) {
      return {
        type: 'error',
        message: 'Failed to generate explanation'
      };
    }
  }

  /**
   * Generate practice problems
   */
  async generatePractice(context) {
    const { topic, difficulty, count = 3 } = context;

    const prompt = `Generate ${count} practice problems for ${topic}.

DIFFICULTY: ${difficulty || 'medium'}

Format each as:
**Problem X:**
[Clear problem statement]

**Hint:** [Subtle hint]

**Key Concepts:** [What this tests]

Make them progressively harder. Be specific and practical.`;

    try {
      const response = await this.callGemini(prompt);
      return {
        type: 'practice',
        topic,
        content: response,
        nextAction: 'Start with Problem 1 when you\'re ready!'
      };
    } catch (error) {
      return {
        type: 'error',
        message: 'Failed to generate practice problems'
      };
    }
  }

  /**
   * Create assessment
   */
  async createAssessment(context) {
    const { topic } = context;

    const prompt = `Create a 5-question assessment for ${topic}.

Include:
- 3 conceptual questions
- 2 code-based questions

Format:
**Question X:**
[Question]

A) [Option]
B) [Option]
C) [Option]
D) [Option]

Make it challenging but fair.`;

    try {
      const response = await this.callGemini(prompt);
      return {
        type: 'assessment',
        topic,
        content: response,
        nextAction: 'Take your time. This will help measure your understanding!'
      };
    } catch (error) {
      return {
        type: 'error',
        message: 'Failed to create assessment'
      };
    }
  }

  /**
   * Review mistakes
   */
  async reviewMistakes(context) {
    const { recentErrors, topic } = context;

    const prompt = `The user is struggling with ${topic}.

RECENT MISTAKES:
${recentErrors ? recentErrors.map((e, i) => `${i + 1}. ${e}`).join('\n') : 'General difficulties'}

YOUR TASK:
1. Identify the root cause of these mistakes
2. Explain the correct approach
3. Give a memory trick or pattern
4. Suggest targeted practice

Be empathetic but constructive. Max 300 words.`;

    try {
      const response = await this.callGemini(prompt);
      return {
        type: 'review',
        topic,
        content: response,
        nextAction: 'Let\'s practice this specific area to build confidence.'
      };
    } catch (error) {
      return {
        type: 'error',
        message: 'Failed to review mistakes'
      };
    }
  }

  /**
   * Celebrate progress
   */
  celebrateProgress(context) {
    const { milestone, stats } = context;

    const messages = [
      `🎉 **Incredible work!** You've solved ${stats?.total || 'many'} problems! Your dedication is impressive.`,
      `🔥 **You're on fire!** ${stats?.streak || 'Your'} correct answers in a row! Keep this momentum going!`,
      `⭐ **Outstanding!** You've mastered ${stats?.mastered || 'this topic'}. Ready for the next challenge?`,
      `🚀 **Unstoppable!** Your progress is phenomenal. You're interview-ready!`
    ];

    return {
      type: 'celebration',
      content: milestone?.message || messages[Math.floor(Math.random() * messages.length)],
      badge: milestone?.badge || '🏆',
      nextAction: 'Keep pushing forward - you\'re doing amazing!'
    };
  }

  /**
   * Motivate user
   */
  motivateUser(context) {
    const { struggle, mastery } = context;

    const messages = [
      `💪 **Don't give up!** Every expert was once a beginner. The fact that you're practicing shows you're already ahead of most people.`,
      `🌱 **Growth mindset!** Mistakes are proof you're learning. Each error teaches you something new.`,
      `🎯 **Focus on progress, not perfection!** You've come this far - that's already an achievement.`,
      `⚡ **Small wins matter!** Even understanding one concept today is progress. Keep going!`
    ];

    return {
      type: 'motivation',
      content: messages[Math.floor(Math.random() * messages.length)],
      nextAction: 'Let\'s tackle this together, one step at a time.'
    };
  }

  /**
   * Suggest project
   */
  async suggestProject(context) {
    const { masteredTopics, userLevel } = context;

    const prompt = `The user has mastered: ${masteredTopics?.join(', ') || 'core topics'}.

USER LEVEL: ${userLevel || 'intermediate'}

Suggest 3 real-world projects that:
1. Apply these mastered topics
2. Challenge them appropriately
3. Are portfolio-worthy

For each project:
**Project: [Name]**
[2-sentence description]
**Technologies:** [stack]
**Learning outcomes:** [what they'll gain]

Be inspiring and practical.`;

    try {
      const response = await this.callGemini(prompt);
      return {
        type: 'project_suggestion',
        content: response,
        nextAction: 'Pick a project and let\'s break it down into steps!'
      };
    } catch (error) {
      return {
        type: 'error',
        message: 'Failed to suggest projects'
      };
    }
  }

  /**
   * Onboard new user
   */
  onboardUser(context) {
    return {
      type: 'onboarding',
      content: `👋 **Welcome to your personal learning journey!**

I'm your AI study companion, here to guide you every step of the way.

**Here's how I'll help you:**
✅ Track your progress across all topics
✅ Identify your strengths and weaknesses  
✅ Create personalized learning plans
✅ Provide practice problems and explanations
✅ Celebrate your wins and support you through challenges

**Let's start with Data Structures** - the foundation of everything!

First, let me assess your current level. Ready for a quick diagnostic?`,
      nextAction: 'Start Diagnostic Assessment'
    };
  }

  /**
   * Advance user to next level
   */
  advanceUser(context) {
    const { masteredTopics } = context;

    return {
      type: 'advancement',
      content: `🎓 **Congratulations!** You've mastered all core topics:

${masteredTopics?.map(t => `✅ ${t}`).join('\n') || '✅ All topics'}

**You're now ready for:**
🚀 Advanced system design
🏗️ Building real-world projects  
💼 Technical interview preparation
🌟 Contributing to open source

**Your next challenge:** Build a full-stack application that showcases everything you've learned!

Want me to help you plan it?`,
      nextAction: 'Plan Capstone Project'
    };
  }

  /**
   * Strengthen weakness
   */
  async strengthenWeakness(context) {
    const { weakTopic, currentMastery } = context;

    const prompt = `The user is weak in ${weakTopic} (${currentMastery}% mastery).

Create a targeted 7-day improvement plan:

**Day 1-2:** [Foundation review]
**Day 3-4:** [Guided practice]  
**Day 5-6:** [Challenging problems]
**Day 7:** [Assessment]

For each day, give:
- Specific goals
- Practice problems
- Success criteria

Be structured and actionable.`;

    try {
      const response = await this.callGemini(prompt);
      return {
        type: 'improvement_plan',
        topic: weakTopic,
        content: response,
        nextAction: 'Let\'s start Day 1 today!'
      };
    } catch (error) {
      return {
        type: 'error',
        message: 'Failed to create improvement plan'
      };
    }
  }

  /**
   * Call Gemini API
   */
  async callGemini(prompt) {
    const response = await axios.post(
      `${this.geminiUrl}?key=${this.geminiApiKey}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  }
}

module.exports = ActionAgent;
