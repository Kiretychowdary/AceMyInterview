// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * EVALUATOR AGENT
 * Analyzes user performance and provides feedback
 * Decides if user is ready to progress
 */

const axios = require('axios');

class EvaluatorAgent {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiUrl = process.env.GEMINI_API_URL || 
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  /**
   * Evaluate user's answer to a practice problem
   */
  async evaluateAnswer(context) {
    const { problem, userAnswer, topic } = context;

    const prompt = `You are evaluating a student's solution.

TOPIC: ${topic}
PROBLEM: ${problem}
STUDENT ANSWER: ${userAnswer}

Provide:
1. ✅/❌ Correctness
2. Feedback (what's good, what's wrong)
3. Correct approach (if wrong)
4. Tips to improve

Be constructive and encouraging. Max 300 words.`;

    try {
      const response = await this.callGemini(prompt);
      
      // Parse correctness
      const isCorrect = response.includes('✅') || 
                       response.toLowerCase().includes('correct') ||
                       response.toLowerCase().includes('right');

      return {
        isCorrect,
        feedback: response,
        type: 'evaluation'
      };
    } catch (error) {
      return {
        isCorrect: false,
        feedback: 'Unable to evaluate answer. Please try again.',
        type: 'error'
      };
    }
  }

  /**
   * Analyze overall performance
   */
  analyzePerformance(userPerformance) {
    const { mastery, recentActivity, totalInteractions } = userPerformance;

    const analysis = {
      overallScore: 0,
      strengths: [],
      weaknesses: [],
      trends: [],
      recommendations: []
    };

    const topicNames = [
      'Data Structures', 'Algorithms', 'OOP', 'Database Management',
      'Web Development', 'Software Engineering', 'Operating Systems',
      'Computer Networks', 'Machine Learning', 'Cloud Computing'
    ];

    // Calculate overall score
    const masteryValues = Object.values(mastery);
    analysis.overallScore = masteryValues.length > 0
      ? Math.round(masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length)
      : 0;

    // Identify strengths (mastery >= 75%)
    Object.entries(mastery).forEach(([topicId, score]) => {
      if (score >= 75) {
        analysis.strengths.push({
          topic: topicNames[topicId],
          score: Math.round(score)
        });
      }
    });

    // Identify weaknesses (mastery < 60%)
    Object.entries(mastery).forEach(([topicId, score]) => {
      if (score < 60) {
        analysis.weaknesses.push({
          topic: topicNames[topicId],
          score: Math.round(score)
        });
      }
    });

    // Analyze trends from recent activity
    if (recentActivity && recentActivity.length >= 5) {
      const last5 = recentActivity.slice(0, 5);
      const correctCount = last5.filter(a => a.correct).length;
      const accuracy = (correctCount / 5) * 100;

      if (accuracy >= 80) {
        analysis.trends.push('🔥 Hot streak - high accuracy recently!');
      } else if (accuracy <= 40) {
        analysis.trends.push('⚠️ Struggling lately - review needed');
      }

      // Check speed
      const avgTime = last5.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / 5;
      if (avgTime < 60) {
        analysis.trends.push('⚡ Fast problem solver!');
      }
    }

    // Generate recommendations
    if (analysis.weaknesses.length > 0) {
      const weakest = analysis.weaknesses[0];
      analysis.recommendations.push(
        `Focus on ${weakest.topic} - your weakest area at ${weakest.score}%`
      );
    }

    if (analysis.strengths.length >= 3) {
      analysis.recommendations.push(
        'You have strong fundamentals - consider building projects!'
      );
    }

    if (totalInteractions < 20) {
      analysis.recommendations.push(
        'Complete more practice to get accurate skill assessment'
      );
    }

    return analysis;
  }

  /**
   * Check readiness to progress
   */
  checkReadiness(topicMastery, practiceCount, recentAccuracy) {
    const requirements = {
      mastery: 70,        // 70% mastery minimum
      practice: 10,       // At least 10 problems
      accuracy: 60        // 60% accuracy in recent problems
    };

    const checks = {
      masteryCheck: topicMastery >= requirements.mastery,
      practiceCheck: practiceCount >= requirements.practice,
      accuracyCheck: recentAccuracy >= requirements.accuracy
    };

    const isReady = checks.masteryCheck && checks.practiceCheck && checks.accuracyCheck;

    return {
      isReady,
      checks,
      requirements,
      feedback: this.getReadinessFeedback(checks, requirements, {
        topicMastery,
        practiceCount,
        recentAccuracy
      })
    };
  }

  /**
   * Get feedback on readiness
   */
  getReadinessFeedback(checks, requirements, current) {
    const feedback = [];

    if (!checks.masteryCheck) {
      feedback.push(
        `❌ Mastery: ${Math.round(current.topicMastery)}% (need ${requirements.mastery}%)`
      );
    } else {
      feedback.push(`✅ Mastery: ${Math.round(current.topicMastery)}%`);
    }

    if (!checks.practiceCheck) {
      feedback.push(
        `❌ Practice: ${current.practiceCount} problems (need ${requirements.practice})`
      );
    } else {
      feedback.push(`✅ Practice: ${current.practiceCount} problems`);
    }

    if (!checks.accuracyCheck) {
      feedback.push(
        `❌ Accuracy: ${Math.round(current.recentAccuracy)}% (need ${requirements.accuracy}%)`
      );
    } else {
      feedback.push(`✅ Accuracy: ${Math.round(current.recentAccuracy)}%`);
    }

    return feedback;
  }

  /**
   * Provide detailed performance report
   */
  async generateReport(userPerformance) {
    const analysis = this.analyzePerformance(userPerformance);

    const prompt = `Generate a personalized performance report.

OVERALL SCORE: ${analysis.overallScore}%
STRENGTHS: ${analysis.strengths.map(s => `${s.topic} (${s.score}%)`).join(', ')}
WEAKNESSES: ${analysis.weaknesses.map(w => `${w.topic} (${w.score}%)`).join(', ')}
TRENDS: ${analysis.trends.join(', ')}
TOTAL PRACTICE: ${userPerformance.totalInteractions}

Create a motivating report that:
1. Celebrates progress
2. Identifies patterns
3. Gives actionable next steps
4. Sets realistic goals

Be personal, specific, and encouraging. Max 400 words.`;

    try {
      const aiReport = await this.callGemini(prompt);
      
      return {
        analysis,
        aiReport,
        type: 'performance_report'
      };
    } catch (error) {
      return {
        analysis,
        aiReport: 'Performance analysis completed. Check the metrics above!',
        type: 'report'
      };
    }
  }

  /**
   * Detect learning patterns
   */
  detectPatterns(recentActivity) {
    const patterns = {
      learningStyle: null,
      commonMistakes: [],
      bestTimeToLearn: null,
      difficultyPreference: null
    };

    if (!recentActivity || recentActivity.length < 10) {
      return patterns;
    }

    // Detect learning style (fast/slow, accuracy-focused/speed-focused)
    const avgTime = recentActivity.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / recentActivity.length;
    const avgAccuracy = (recentActivity.filter(a => a.correct).length / recentActivity.length) * 100;

    if (avgTime < 60 && avgAccuracy > 70) {
      patterns.learningStyle = 'Fast and accurate - excellent problem solver!';
    } else if (avgTime > 120 && avgAccuracy > 80) {
      patterns.learningStyle = 'Thoughtful and careful - great attention to detail!';
    } else if (avgTime < 60 && avgAccuracy < 60) {
      patterns.learningStyle = 'Quick but needs accuracy improvement';
    }

    // Detect difficulty preference
    const difficulties = recentActivity.map(a => a.difficulty);
    const avgDifficulty = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
    
    if (avgDifficulty > 7) {
      patterns.difficultyPreference = 'Prefers challenging problems';
    } else if (avgDifficulty < 4) {
      patterns.difficultyPreference = 'Building confidence with easier problems';
    } else {
      patterns.difficultyPreference = 'Balanced difficulty progression';
    }

    return patterns;
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

module.exports = EvaluatorAgent;
