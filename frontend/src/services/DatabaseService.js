// Database Question Service - Fetches from MongoDB instead of Gemini
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class DatabaseService {
  /**
   * Fetch MCQ questions from database
   * @param {string} topic - Question topic (JavaScript, Python, React, etc.)
   * @param {string} difficulty - Difficulty level (easy, medium, hard)
   * @param {number} count - Number of questions to fetch
   * @returns {Promise<Object>} Response with questions array
   */
  async getMCQQuestions(topic, difficulty = 'medium', count = 10) {
    try {
      console.log(`🎯 Fetching ${count} ${difficulty} questions for ${topic}...`);
      
      const response = await fetch(`${API_BASE_URL}/api/mcq-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, difficulty, count })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log(`✅ Received ${data.questions?.length || 0} questions from ${data.metadata?.source || 'unknown'}`);
      
      if (data.success && data.questions && data.questions.length > 0) {
        return {
          success: true,
          questions: data.questions,
          metadata: {
            ...data.metadata,
            fetchedAt: new Date().toISOString(),
            count: data.questions.length
          },
          source: data.metadata?.source || 'database'
        };
      }
      
      // Handle empty or invalid response
      return {
        success: false,
        questions: [],
        error: 'No questions available for this topic/difficulty combination',
        source: 'error'
      };
    } catch (error) {
      console.error('❌ Error fetching MCQ questions from database:', error);
      return {
        success: false,
        questions: [],
        error: error.message,
        source: 'error'
      };
    }
  }

  /**
   * Fetch coding problem from database
   * @param {string} topic - Problem topic
   * @param {string} difficulty - Difficulty level
   * @returns {Promise<Object>} Coding problem details
   */
  async getCodingProblem(topic, difficulty = 'easy') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/bulk/coding/${topic}/${difficulty}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.problem) {
        return {
          success: true,
          problem: this.formatCodingProblem(data.problem),
          source: 'database'
        };
      }

      return {
        success: false,
        problem: null,
        error: 'No problem found',
        source: 'database'
      };
    } catch (error) {
      console.error('Error fetching coding problem from database:', error);
      return {
        success: false,
        problem: null,
        error: error.message,
        source: 'error'
      };
    }
  }

  /**
   * Format coding problem from database to match expected structure
   */
  formatCodingProblem(problem) {
    return {
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      topic: problem.topic,
      constraints: problem.constraints,
      examples: problem.examples,
      starterCode: problem.starterCode || {
        javascript: '// Write your solution here\n',
        python: '# Write your solution here\n',
        java: '// Write your solution here\n',
        cpp: '// Write your solution here\n'
      },
      testCases: problem.testCases || [],
      hints: problem.hints || [],
      timeComplexity: problem.timeComplexity,
      spaceComplexity: problem.spaceComplexity
    };
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bulk/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { totalMCQs: 0, totalCodingQuestions: 0, totalQuestions: 0 };
    }
  }
}

export default new DatabaseService();
