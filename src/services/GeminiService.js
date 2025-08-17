//nmkrspvlidata
//radhakrishna
// SIMPLE GEMINI SERVICE - DIRECT API CALLS
// NMKRSPVLIDATAPERMANENT - No more n8n complexity!

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_API_BASE_URL + '/api' ||
  (process.env.NODE_ENV === 'production' 
    ? 'https://radhakrishna-8d46e.web.app/api'  // Firebase Hosting URL
    : 'http://localhost:5000/api');

class GeminiService {
  // 🌟 MOTIVATIONAL QUOTES FOR LOADING STATES
  static getMotivationalQuote() {
    const motivationalQuotes = [
      "🚀 \"Success is not final, failure is not fatal: it is the courage to continue that counts.\" - Winston Churchill",
      "💡 \"The only way to do great work is to love what you do.\" - Steve Jobs",
      "🎯 \"Believe you can and you're halfway there.\" - Theodore Roosevelt",
      "⭐ \"Your limitation—it's only your imagination.\"",
      "🔥 \"Push yourself, because no one else is going to do it for you.\"",
      "💪 \"Great things never come from comfort zones.\"",
      "🌟 \"Dream it. Wish it. Do it.\"",
      "🚀 \"Success doesn't just find you. You have to go out and get it.\"",
      "💎 \"The harder you work for something, the greater you'll feel when you achieve it.\"",
      "🎪 \"Dream bigger. Do bigger.\"",
      "🔥 \"Don't stop when you're tired. Stop when you're done.\"",
      "⚡ \"Wake up with determination. Go to bed with satisfaction.\"",
      "🌈 \"Do something today that your future self will thank you for.\"",
      "💫 \"Little progress is still progress.\"",
      "🎯 \"The expert in anything was once a beginner.\"",
      "🚀 \"Code is poetry written in logic.\"",
      "💡 \"Every expert was once a beginner. Every pro was once an amateur.\"",
      "⭐ \"Debugging is being the detective in a crime movie where you are also the murderer.\"",
      "🔥 \"Programming isn't about what you know; it's about what you can figure out.\"",
      "💪 \"The best error message is the one that never shows up.\"",
      "🌟 \"Clean code always looks like it was written by someone who cares.\"",
      "🎪 \"First, solve the problem. Then, write the code.\"",
      "💎 \"The most important skill for a programmer is the ability to effectively communicate with others.\"",
      "🚀 \"Code never lies, comments sometimes do.\"",
      "⚡ \"Programming is thinking, not typing.\"",
      "🌈 \"The computer was born to solve problems that did not exist before.\"",
      "💫 \"In programming, the hard part isn't solving problems, but deciding what problems to solve.\"",
      "🎯 \"Good programmers use their brains, but good guidelines save us having to think out every case.\"",
      "🔥 \"Testing leads to failure, and failure leads to understanding.\"",
      "💡 \"The function of good software is to make the complex appear to be simple.\""
    ];

    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  }

  // 💾 Q&A STORAGE METHODS
  static async storeQuestionAnswer(sessionId, userId, questionData, userAnswer, isCorrect) {
    console.log('💾 Storing Q&A:', { sessionId, userId, isCorrect });
    
    try {
      const response = await fetch(`${API_BASE_URL}/store-qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId,
          questionData,
          userAnswer,
          isCorrect
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to store Q&A:', error);
      return { success: false, error: error.message };
    }
  }

  static async getUserQAHistory(userId, limit = 50) {
    console.log('📚 Fetching Q&A history for:', userId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/qa-history/${userId}?limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch Q&A history:', error);
      return { success: false, error: error.message };
    }
  }

  static async getSessionDetails(sessionId) {
    console.log('🔍 Fetching session details:', sessionId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/session/${sessionId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch session details:', error);
      return { success: false, error: error.message };
    }
  }

  static async getQAAnalytics() {
    console.log('📊 Fetching Q&A analytics');
    
    try {
      const response = await fetch(`${API_BASE_URL}/qa-analytics`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch Q&A analytics:', error);
      return { success: false, error: error.message };
    }
  }

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

  static async generateInterviewQuestions(topic, difficulty = 'medium', count = 5) {
    console.log('🎯 GeminiService: Generating Interview Questions');
    console.log(`📚 Topic: ${topic}, Difficulty: ${difficulty}, Count: ${count}`);

    try {
      // For Face-to-Face interviews, we can reuse the MCQ generation
      const response = await this.getMCQQuestions(topic, difficulty, count);
      
      if (response.success) {
        return {
          success: true,
          questions: response.questions.map(q => ({
            ...q,
            type: 'face-to-face',
            expectedDuration: '2-3 minutes'
          })),
          source: 'gemini-direct'
        };
      } else {
        throw new Error(response.error || 'Failed to generate interview questions');
      }
    } catch (error) {
      console.error('❌ Interview Questions Error:', error);
      
      // Fallback interview questions
      return {
        success: false,
        error: error.message,
        questions: this.getFallbackInterviewQuestions(topic, count),
        source: 'fallback'
      };
    }
  }

  static async getCodingProblem(topic, difficulty = 'medium', language = 'javascript') {
    console.log('🎯 GeminiService: Generating Coding Problem');
    console.log(`💻 Topic: ${topic}, Difficulty: ${difficulty}, Language: ${language}`);
    console.log(`🌐 API Base URL: ${API_BASE_URL}`);

    try {
      // Create an AbortController for timeout control
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

      const response = await fetch(`${API_BASE_URL}/coding-problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          difficulty,
          language
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

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

  // Dynamic fallback questions with randomization
  static getFallbackMCQs(topic, count = 5) {
    const timestamp = Date.now();
    const randomSeed = Math.random().toString(36).substr(2, 9);
    
    const questionPools = {
      concepts: [
        `What is the most fundamental concept every ${topic} developer should understand?`,
        `Which principle forms the foundation of effective ${topic} development?`,
        `What core concept distinguishes ${topic} from other technologies?`,
        `Which fundamental idea is essential when starting with ${topic}?`
      ],
      practices: [
        `What is considered the industry standard best practice in ${topic}?`,
        `Which approach do experienced ${topic} developers recommend most?`,
        `What methodology has proven most effective for ${topic} projects?`,
        `Which strategy leads to the most maintainable ${topic} code?`
      ],
      applications: [
        `In real-world ${topic} projects, what should developers prioritize first?`,
        `When implementing ${topic} solutions, what is the most critical factor?`,
        `For production ${topic} applications, what deserves the highest attention?`,
        `In professional ${topic} development, what practice yields the best results?`
      ],
      challenges: [
        `What common challenge do ${topic} developers face most frequently?`,
        `Which mistake should ${topic} beginners be most careful to avoid?`,
        `What pitfall often catches new ${topic} developers off-guard?`,
        `Which oversight can significantly impact ${topic} project success?`
      ],
      advanced: [
        `What advanced ${topic} concept separates junior from senior developers?`,
        `Which sophisticated ${topic} technique improves performance most significantly?`,
        `What expert-level ${topic} knowledge creates the biggest competitive advantage?`,
        `Which complex ${topic} pattern solves the most challenging problems?`
      ]
    };

    const optionPools = {
      positive: [
        "Deep understanding and continuous learning",
        "Following established conventions and best practices", 
        "Hands-on practice with real-world projects",
        "Code readability and comprehensive documentation",
        "Performance optimization and efficient algorithms",
        "Proper error handling and defensive programming",
        "Modular design and separation of concerns",
        "Testing and quality assurance practices"
      ],
      negative: [
        "Memorizing syntax without understanding concepts",
        "Ignoring documentation and established patterns",
        "Rushing through development without proper planning",
        "Writing complex code without clear purpose",
        "Avoiding challenging problems and staying comfortable",
        "Neglecting error handling and edge cases",
        "Creating tightly coupled and hard-to-maintain code",
        "Skipping testing and code review processes"
      ]
    };

    const categories = Object.keys(questionPools);
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      const categoryIndex = (timestamp + i) % categories.length;
      const category = categories[categoryIndex];
      const questionOptions = questionPools[category];
      const questionIndex = (timestamp + i + parseInt(randomSeed, 36)) % questionOptions.length;
      
      // Create randomized options
      const positiveOptions = [...optionPools.positive].sort(() => Math.random() - 0.5).slice(0, 2);
      const negativeOptions = [...optionPools.negative].sort(() => Math.random() - 0.5).slice(0, 2);
      const allOptions = [...positiveOptions, ...negativeOptions].sort(() => Math.random() - 0.5);
      
      questions.push({
        question: questionOptions[questionIndex],
        options: allOptions,
        correctAnswer: allOptions.indexOf(positiveOptions[0]),
        explanation: `${positiveOptions[0]} represents the most effective approach in ${topic} development, promoting code quality, maintainability, and professional growth.`,
        source: 'fallback',
        timestamp: timestamp + i
      });
    }
    
    return questions;
  }

  // Fallback interview questions for face-to-face interviews
  static getFallbackInterviewQuestions(topic, count = 5) {
    const timestamp = Date.now();
    
    const interviewQuestions = [
      {
        question: `Tell me about your experience with ${topic} development.`,
        options: [],
        correctAnswer: -1,
        explanation: `This is an open-ended question to assess practical experience with ${topic}.`,
        type: 'face-to-face',
        expectedDuration: '2-3 minutes'
      },
      {
        question: `What are the main challenges you've faced when working with ${topic}?`,
        options: [],
        correctAnswer: -1,
        explanation: `This question evaluates problem-solving experience in ${topic}.`,
        type: 'face-to-face',
        expectedDuration: '2-3 minutes'
      },
      {
        question: `How would you explain ${topic} concepts to a junior developer?`,
        options: [],
        correctAnswer: -1,
        explanation: `This assesses communication skills and depth of understanding.`,
        type: 'face-to-face',
        expectedDuration: '3-4 minutes'
      },
      {
        question: `What recent developments or trends in ${topic} are you most excited about?`,
        options: [],
        correctAnswer: -1,
        explanation: `This evaluates staying current with industry trends.`,
        type: 'face-to-face',
        expectedDuration: '2-3 minutes'
      },
      {
        question: `Can you walk me through your approach to solving a complex ${topic} problem?`,
        options: [],
        correctAnswer: -1,
        explanation: `This assesses problem-solving methodology and thought process.`,
        type: 'face-to-face',
        expectedDuration: '3-4 minutes'
      }
    ];

    return interviewQuestions.slice(0, Math.min(count, interviewQuestions.length));
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
