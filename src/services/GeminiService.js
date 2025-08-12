// SIMPLE GEMINI SERVICE - DIRECT API CALLS
// NMKRSPVLIDATAPERMANENT - No more n8n complexity!

const API_BASE_URL = 'http://localhost:5000/api';

class GeminiService {
  static async getMCQQuestions(topic, difficulty = 'medium', count = 5) {
    console.log('🎯 GeminiService: Generating MCQ Questions');
    console.log(`📚 Topic: ${topic}, Difficulty: ${difficulty}, Count: ${count}`);

    try {
      const response = await fetch(`${API_BASE_URL}/mcq-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          difficulty,
          count
        })
      });

      const data = await response.json();
      console.log('✅ MCQ Response:', data);

      if (data.success) {
        return {
          success: true,
          questions: data.questions,
          source: 'gemini-direct'
        };
      } else {
        throw new Error(data.error || 'Failed to generate questions');
      }
    } catch (error) {
      console.error('❌ MCQ Generation Error:', error);
      
      // Simple fallback questions
      return {
        success: false,
        error: error.message,
        questions: this.getFallbackMCQs(topic),
        source: 'fallback'
      };
    }
  }

  static async getCodingProblem(topic, difficulty = 'medium', language = 'javascript') {
    console.log('🎯 GeminiService: Generating Coding Problem');
    console.log(`💻 Topic: ${topic}, Difficulty: ${difficulty}, Language: ${language}`);

    try {
      const response = await fetch(`${API_BASE_URL}/coding-problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          difficulty,
          language
        })
      });

      const data = await response.json();
      console.log('✅ Coding Problem Response:', data);

      if (data.success) {
        return {
          success: true,
          problem: data.problem,
          source: 'gemini-direct'
        };
      } else {
        throw new Error(data.error || 'Failed to generate problem');
      }
    } catch (error) {
      console.error('❌ Coding Problem Error:', error);
      
      // Simple fallback problem
      return {
        success: false,
        error: error.message,
        problem: this.getFallbackCodingProblem(topic, difficulty),
        source: 'fallback'
      };
    }
  }

  // Simple fallback questions
  static getFallbackMCQs(topic) {
    return [
      {
        question: `What is a key concept in ${topic}?`,
        options: [
          "Fundamental principle",
          "Advanced technique", 
          "Basic understanding",
          "Complex implementation"
        ],
        correctAnswer: 0,
        explanation: `Understanding fundamental principles is essential in ${topic}.`
      }
    ];
  }

  // Simple fallback coding problem
  static getFallbackCodingProblem(topic, difficulty) {
    return {
      title: `${topic} Challenge`,
      description: `Solve this ${difficulty} level problem related to ${topic}.`,
      inputFormat: "Input format will be provided",
      outputFormat: "Expected output format",
      constraints: "Standard constraints apply",
      examples: "Examples will be provided",
      difficulty: difficulty,
      topic: topic
    };
  }
}

export default GeminiService;
