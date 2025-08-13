// SIMPLE GEMINI SERVICE - DIRECT API CALLS
// NMKRSPVLIDATAPERMANENT - No more n8n complexity!

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_API_BASE_URL + '/api' ||
  (process.env.NODE_ENV === 'production' 
    ? 'https://acemyinterview-production.up.railway.app/api'
    : 'http://localhost:5000/api');

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
        questions: this.getFallbackMCQs(topic, count),
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
  static getFallbackMCQs(topic, count = 5) {
    const questionTemplates = [
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
      },
      {
        question: `Which of the following is most important when learning ${topic}?`,
        options: [
          "Practice and hands-on experience",
          "Memorizing syntax only",
          "Reading documentation once",
          "Avoiding challenging problems"
        ],
        correctAnswer: 0,
        explanation: `Practice and hands-on experience are crucial for mastering ${topic}.`
      },
      {
        question: `What is considered a best practice in ${topic}?`,
        options: [
          "Following established conventions",
          "Ignoring code structure",
          "Using deprecated methods",
          "Avoiding documentation"
        ],
        correctAnswer: 0,
        explanation: `Following established conventions leads to better code quality in ${topic}.`
      },
      {
        question: `When working with ${topic}, what should you prioritize?`,
        options: [
          "Code readability and maintainability",
          "Writing code as fast as possible",
          "Using the most complex solution",
          "Avoiding comments"
        ],
        correctAnswer: 0,
        explanation: `Code readability and maintainability are essential in ${topic} development.`
      },
      {
        question: `What is a common mistake beginners make in ${topic}?`,
        options: [
          "Not understanding the fundamentals",
          "Reading too much documentation",
          "Practicing too often",
          "Asking for help"
        ],
        correctAnswer: 0,
        explanation: `Not understanding the fundamentals is a common beginner mistake in ${topic}.`
      }
    ];

    // Return the requested number of questions (up to available templates)
    const questionsToReturn = questionTemplates.slice(0, Math.min(count, questionTemplates.length));
    
    // If we need more questions than templates, cycle through them
    while (questionsToReturn.length < count) {
      const remainingNeeded = count - questionsToReturn.length;
      const additionalQuestions = questionTemplates
        .slice(0, Math.min(remainingNeeded, questionTemplates.length))
        .map((q, index) => ({
          ...q,
          question: `${q.question} (Question ${questionsToReturn.length + index + 1})`
        }));
      questionsToReturn.push(...additionalQuestions);
    }

    return questionsToReturn;
  }

  // Simple fallback coding problem
  static getFallbackCodingProblem(topic, difficulty) {
    const testCases = [
      { input: "5", output: "5" },
      { input: "10", output: "10" },
      { input: "1", output: "1" }
    ];

    if (topic === 'arrays') {
      return {
        title: "Sum of Array Elements",
        description: "Write a function that takes an array of integers and returns the sum of all elements.",
        inputFormat: "First line contains n (number of elements), followed by n integers.",
        outputFormat: "Single integer representing the sum.",
        constraints: "1 ≤ n ≤ 1000, -1000 ≤ elements ≤ 1000",
        examples: "Input: 3\n1 2 3\nOutput: 6",
        testCases: [
          { input: "3\n1 2 3", output: "6" },
          { input: "4\n-1 0 1 2", output: "2" },
          { input: "1\n5", output: "5" }
        ],
        difficulty: difficulty,
        topic: topic
      };
    }

    return {
      title: `${topic} Challenge - Echo Number`,
      description: `A simple ${difficulty} level problem: Read a number and output the same number.`,
      inputFormat: "Single integer n",
      outputFormat: "Single integer n", 
      constraints: "1 ≤ n ≤ 100",
      examples: "Input: 5\nOutput: 5",
      testCases: testCases,
      difficulty: difficulty,
      topic: topic
    };
  }
}

export default GeminiService;
