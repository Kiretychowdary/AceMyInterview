// OLLAMA SERVICE - Simple Frontend API for Ollama Backend
// Uses the Cloudflare tunnel endpoint configured in backend
// nmkrspvlidata - radhakrishna

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_API_BASE_URL + '/api' ||
  (process.env.NODE_ENV === 'production' 
    ? 'https://acemyinterview-backend.onrender.com/api'
    : 'http://localhost:5000/api');

class OllamaService {
  /**
   * Generate MCQ questions using Ollama backend
   * @param {string} topic - Topic for questions
   * @param {string} difficulty - 'easy', 'medium', 'hard'
   * @param {number} count - Number of questions
   * @returns {Promise<Object>} Generated questions
   */
  static async getMCQQuestions(topic, difficulty = 'medium', count = 5) {
    console.log('🎯 OllamaService: Generating MCQ Questions');
    console.log(`📚 Topic: ${topic}, Difficulty: ${difficulty}, Count: ${count}`);
    console.log(`🌐 Endpoint: ${API_BASE_URL}/ollama/generate-mcq`);

    try {
      const response = await fetch(`${API_BASE_URL}/ollama/generate-mcq`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          count
        }),
        timeout: 60000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.questions)) {
        console.log('✅ MCQ Questions Generated:', data.questions.length);
        return {
          success: true,
          questions: data.questions,
          source: 'ollama-backend'
        };
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (error) {
      console.error('❌ MCQ Generation Error:', error.message);
      
      // Use fallback questions
      return {
        success: false,
        error: error.message,
        questions: this.getFallbackMCQs(topic, count),
        source: 'fallback'
      };
    }
  }

  /**
   * Health check for Ollama backend
   */
  static async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/ollama/health`);
      return response.ok;
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return false;
    }
  }

  /**
   * Simple fallback MCQ questions
   */
  static getFallbackMCQs(topic, count = 5) {
    const fallbackQuestions = [
      {
        question: `What is the primary purpose of using ${topic}?`,
        options: [
          'To improve code efficiency',
          'To enhance developer productivity',
          'To ensure code maintainability',
          'To simplify deployment'
        ],
        correctAnswer: 0,
        explanation: `${topic} is primarily used to improve code efficiency and help developers write better code.`
      },
      {
        question: `Which of the following is a key feature of ${topic}?`,
        options: [
          'Automatic code generation',
          'Real-time debugging',
          'Pattern recognition',
          'Self-optimization'
        ],
        correctAnswer: 2,
        explanation: `Pattern recognition is a fundamental feature that makes ${topic} effective.`
      },
      {
        question: `How does ${topic} impact software development?`,
        options: [
          'Reduces development time',
          'Increases complexity',
          'Requires more resources',
          'Limits code flexibility'
        ],
        correctAnswer: 0,
        explanation: `${topic} helps reduce development time by streamlining processes and improving efficiency.`
      },
      {
        question: `What should developers prioritize when using ${topic}?`,
        options: [
          'Code readability',
          'Performance optimization',
          'Testing and validation',
          'Documentation'
        ],
        correctAnswer: 2,
        explanation: `Testing and validation are critical priorities to ensure code quality with ${topic}.`
      },
      {
        question: `Which best practice is most important for ${topic}?`,
        options: [
          'Following naming conventions',
          'Regular code reviews',
          'Continuous monitoring',
          'Version control'
        ],
        correctAnswer: 1,
        explanation: `Regular code reviews help maintain quality standards with ${topic}.`
      }
    ];

    return fallbackQuestions.slice(0, count);
  }

  /**
   * Store question answer in backend
   */
  static async storeQuestionAnswer(sessionId, userId, questionData, userAnswer, isCorrect) {
    try {
      const response = await fetch(`${API_BASE_URL}/interview/store-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          questionData,
          userAnswer,
          isCorrect
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to store Q&A:', error);
      return { success: false, error: error.message };
    }
  }
}

export default OllamaService;
