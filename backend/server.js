//nmkrspvlidata
//radhakrishna
// SIMPLE GEMINI-ONLY BACKEND - NO N8N COMPLEXITY
// NMKRSPVLIDATAPERMANENT - Direct Gemini AI Integration
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ENHANCED CORS Configuration - EMERGENCY FIX FOR LOCALHOST:5176
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', 
      'http://localhost:5174', 
      'http://localhost:5175', 
      'http://localhost:5176',  // CRITICAL FIX FOR YOUR APP
      'http://localhost:5177',
      'https://aiksvid.netlify.app',
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log(`CORS: Allowing origin: ${origin}`);
      return callback(null, true); // Allow all origins for development
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-rapidapi-key', 
    'x-rapidapi-host',
    'Access-Control-Allow-Origin',
    'Origin',
    'X-Requested-With',
    'Accept'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
};

app.use(cors(corsOptions));

// EMERGENCY CORS BYPASS - CRITICAL FIX FOR LOCALHOST:5176
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Always allow localhost:5176 - CRITICAL FIX
  if (origin && origin.includes('localhost:5176')) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS: Explicitly allowing localhost:5176`);
  } else {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-rapidapi-key, x-rapidapi-host, Origin, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`🔧 CORS Preflight: ${req.headers.origin} -> ${req.url}`);
    return res.sendStatus(200);
  }
  
  console.log(`📡 CORS Request: ${req.method} ${req.url} from ${origin}`);
  next();
});

app.use(express.json());

// CORS Test Endpoint - TO VERIFY FIX WORKS
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working correctly for localhost:5176!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    allowedOrigins: [
      'http://localhost:5176', // YOUR APP
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'https://aiksvid.netlify.app'
    ]
  });
});

// Environment Configuration
const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT) || 30000;

// 💾 Q&A STORAGE SYSTEM
let questionAnswerStorage = {
  sessions: new Map(),
  userResponses: new Map(),
  questionBank: new Map(),
  analytics: {
    totalQuestions: 0,
    totalSessions: 0,
    topicDistribution: new Map(),
    difficultyDistribution: new Map()
  }
};

// Store Q&A for analysis and learning
function storeQuestionAnswer(sessionId, userId, questionData, userAnswer, isCorrect) {
  const timestamp = new Date().toISOString();
  
  // Store in session
  if (!questionAnswerStorage.sessions.has(sessionId)) {
    questionAnswerStorage.sessions.set(sessionId, {
      userId,
      questions: [],
      startTime: timestamp,
      topic: questionData.topic,
      difficulty: questionData.difficulty
    });
    questionAnswerStorage.analytics.totalSessions++;
  }
  
  const sessionData = questionAnswerStorage.sessions.get(sessionId);
  sessionData.questions.push({
    question: questionData.question,
    options: questionData.options,
    correctAnswer: questionData.correctAnswer,
    userAnswer,
    isCorrect,
    explanation: questionData.explanation,
    answeredAt: timestamp
  });
  
  // Store user responses
  if (!questionAnswerStorage.userResponses.has(userId)) {
    questionAnswerStorage.userResponses.set(userId, []);
  }
  questionAnswerStorage.userResponses.get(userId).push({
    sessionId,
    questionData,
    userAnswer,
    isCorrect,
    timestamp
  });
  
  // Store in question bank for analysis
  const questionKey = `${questionData.topic}_${questionData.difficulty}_${questionData.question.substring(0, 50)}`;
  questionAnswerStorage.questionBank.set(questionKey, {
    ...questionData,
    timesAsked: (questionAnswerStorage.questionBank.get(questionKey)?.timesAsked || 0) + 1,
    correctRate: calculateCorrectRate(questionKey, isCorrect),
    lastUsed: timestamp
  });
  
  // Update analytics
  questionAnswerStorage.analytics.totalQuestions++;
  const topicCount = questionAnswerStorage.analytics.topicDistribution.get(questionData.topic) || 0;
  questionAnswerStorage.analytics.topicDistribution.set(questionData.topic, topicCount + 1);
  const diffCount = questionAnswerStorage.analytics.difficultyDistribution.get(questionData.difficulty) || 0;
  questionAnswerStorage.analytics.difficultyDistribution.set(questionData.difficulty, diffCount + 1);
}

function calculateCorrectRate(questionKey, isCorrect) {
  // Simple implementation - can be enhanced
  const existing = questionAnswerStorage.questionBank.get(questionKey);
  if (!existing) return isCorrect ? 1.0 : 0.0;
  
  const totalAnswers = existing.timesAsked || 1;
  const currentCorrectRate = existing.correctRate || 0;
  const correctAnswers = Math.round(currentCorrectRate * (totalAnswers - 1)) + (isCorrect ? 1 : 0);
  
  return correctAnswers / totalAnswers;
}

console.log('🔍 Environment Debug:');
console.log('   GEMINI_API_URL:', GEMINI_API_URL ? 'SET' : 'NOT SET');
console.log('   GEMINI_API_KEY:', GEMINI_API_KEY ? 'SET (length: ' + GEMINI_API_KEY.length + ')' : 'NOT SET');
console.log('🤖 Gemini API URL:', GEMINI_API_URL);
console.log('🔑 API Key configured:', !!GEMINI_API_KEY);
app.get("/", (req, res) => {
  res.send("✅ Server is running on Render!");
});
// 🤖 DIRECT GEMINI MCQ QUESTIONS
app.post('/api/mcq-questions', async (req, res) => {
  const { topic = 'JavaScript', difficulty = 'medium', count = 5 } = req.body;
  const sessionId = Date.now() + Math.random().toString(36).substr(2, 9); // Unique session ID
  const timestamp = new Date().toISOString();

  console.log('🎯 =================== MCQ REQUEST ===================');
  console.log(`📚 Topic: ${topic}, Difficulty: ${difficulty}, Count: ${count}`);
  console.log(`🆔 Session: ${sessionId}`);
  console.log(`⏰ Timestamp: ${timestamp}`);

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Gemini API key not configured'
    });
  }

  try {
    // Create detailed prompts based on topic and difficulty
    const getTopicSpecificPrompt = (topic, difficulty, count, sessionId) => {
      const difficultySpecs = {
        easy: {
          instruction: "Focus on basic concepts, fundamental terminology, and simple applications",
          questionTypes: "definition questions, basic syntax, simple true/false concepts",
          complexity: "straightforward with clear answers"
        },
        medium: {
          instruction: "Include practical applications, scenario-based questions, and moderate problem-solving",
          questionTypes: "code analysis, best practices, debugging scenarios, design patterns",
          complexity: "requiring some analysis and understanding of intermediate concepts"
        },
        hard: {
          instruction: "Advanced concepts, complex scenarios, optimization problems, and expert-level knowledge",
          questionTypes: "system design decisions, performance optimization, security considerations, advanced algorithms",
          complexity: "requiring deep understanding and critical thinking"
        }
      };

      const topicInstructions = {
        'Software Developer': 'software development principles, coding standards, development methodologies, and programming best practices',
        'JavaScript': 'JavaScript language features, ES6+, async programming, DOM manipulation, and modern frameworks',
        'Python': 'Python syntax, data structures, libraries, object-oriented programming, and Pythonic idioms',
        'React': 'React components, hooks, state management, lifecycle methods, and modern React patterns',
        'Node.js': 'Node.js runtime, npm, Express.js, asynchronous programming, and backend development',
        'Java': 'Java syntax, OOP concepts, collections framework, multithreading, and JVM internals',
        'Algorithms': 'algorithm design, complexity analysis, sorting, searching, and optimization techniques',
        'System Design': 'scalability, distributed systems, databases, caching, and architectural patterns',
        'Cybersecurity Specialist': 'security principles, threat analysis, encryption, network security, and vulnerability assessment',
        'Data Scientist': 'statistical analysis, machine learning algorithms, data preprocessing, and model evaluation',
        'DevOps Engineer': 'CI/CD pipelines, containerization, infrastructure as code, monitoring, and deployment strategies'
      };

      const spec = difficultySpecs[difficulty] || difficultySpecs.medium;
      const topicInfo = topicInstructions[topic] || `${topic} concepts and applications`;

      return `Generate exactly ${count} COMPLETELY UNIQUE and FRESH multiple choice questions about ${topicInfo} at ${difficulty} difficulty level.

🔄 SESSION: ${sessionId} - GENERATE BRAND NEW QUESTIONS (NOT SEEN BEFORE)
⏰ TIMESTAMP: ${new Date().toISOString()}

ANTI-REPETITION REQUIREMENTS:
- Each question must be 100% different from any previously generated questions
- Use creative, varied question patterns and structures
- Cover different subtopics within ${topic}
- Include diverse question types: conceptual, practical, scenario-based, code-analysis
- Randomize question complexity within ${difficulty} level
- Use different vocabulary and phrasing styles

DIFFICULTY REQUIREMENTS (${difficulty.toUpperCase()}):
- ${spec.instruction}
- Question types: ${spec.questionTypes}  
- Complexity: ${spec.complexity}

CONTENT VARIETY REQUIREMENTS:
- Mix theoretical knowledge with practical application
- Include current best practices and modern approaches
- Add real-world scenarios and problem-solving
- Test understanding from multiple angles
- Ensure questions are professionally relevant and educational

RANDOMIZATION SEEDS:
- Time: ${Date.now()}
- Random: ${Math.random()}
- Hash: ${sessionId}

Return ONLY a JSON array with exactly ${count} questions in this exact format:
[
  {
    "question": "Your unique question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer and why other options are incorrect"
  }
]

CRITICAL REQUIREMENTS:
- Array must contain exactly ${count} questions
- Questions must be unique and non-repetitive
- Appropriate ${difficulty} difficulty level
- Educational and interview-focused content
- No markdown formatting, just pure JSON array
- Each question should test different knowledge areas within ${topic}`;
    };

    const prompt = getTopicSpecificPrompt(topic, difficulty, count, sessionId);

    console.log('🚀 Sending request to Gemini...');
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: REQUEST_TIMEOUT
      }
    );

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('📥 Raw Gemini Response:', aiResponse);

    if (!aiResponse) {
      throw new Error('No response from Gemini API');
    }

    // Clean and parse JSON
    let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const questions = JSON.parse(cleanResponse);
    console.log('✅ Parsed Questions:', questions);
    console.log(`📊 Expected count: ${count}, Actual count: ${questions.length}`);

    // Validate question count
    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array');
    }

    if (questions.length !== parseInt(count)) {
      console.log(`⚠️ Question count mismatch! Expected: ${count}, Got: ${questions.length}`);
      // If we got fewer questions, pad with variations
      while (questions.length < count && questions.length > 0) {
        const baseQuestion = questions[questions.length % questions.length];
        questions.push({
          ...baseQuestion,
          question: `${baseQuestion.question} (Variant ${questions.length + 1})`
        });
      }
      // If we got too many questions, trim to exact count
      if (questions.length > count) {
        questions.splice(count);
      }
    }

    console.log(`✅ Final question count: ${questions.length}`);
    console.log('🎯 ===============================================');

    res.json({
      success: true,
      questions: questions,
      metadata: {
        topic,
        difficulty,
        count: questions.length,
        source: 'gemini-direct',
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('🎯 ===============================================');

    res.status(500).json({
      success: false,
      error: 'Failed to generate MCQ questions',
      details: error.message
    });
  }
});

// 🤖 DIRECT GEMINI CODING PROBLEMS
app.post('/api/coding-problems', async (req, res) => {
  const { topic = 'algorithms', difficulty = 'medium', language = 'javascript' } = req.body;
  const sessionId = Date.now(); // Simple session tracking

  console.log('🎯 ================ CODING REQUEST ================');
  console.log(`💻 Topic: ${topic}, Difficulty: ${difficulty}, Language: ${language}`);
  console.log(`🆔 Session: ${sessionId}`);

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Gemini API key not configured'
    });
  }

  try {
    // Create detailed coding prompts based on topic and difficulty
    const getCodingPrompt = (topic, difficulty, language, sessionId) => {
      const difficultySpecs = {
        easy: {
          instruction: "Simple logic, basic algorithms, straightforward implementation",
          complexity: "O(n) or O(n log n) solutions, simple data structures",
          testCases: "3-4 test cases with clear patterns"
        },
        medium: {
          instruction: "Moderate algorithmic thinking, multiple approaches possible, some optimization required",
          complexity: "may require dynamic programming, trees, or graphs, O(n²) acceptable",
          testCases: "4-5 test cases including edge cases"
        },
        hard: {
          instruction: "Complex algorithms, advanced data structures, optimal solutions required",
          complexity: "advanced algorithms, complex optimization, handling of large inputs",
          testCases: "5-6 test cases with challenging edge cases and performance considerations"
        }
      };

      const topicSpecs = {
        'sorting': 'sorting algorithms implementation, comparison-based sorting, stability analysis',
        'searching': 'binary search variations, search in rotated arrays, finding elements with constraints',
        'arrays': 'array manipulation, subarray problems, two pointers, sliding window techniques',
        'linked-lists': 'linked list operations, cycle detection, merging, reversing chains',
        'trees': 'binary tree traversals, BST operations, tree construction and validation',
        'graphs': 'graph traversal (BFS/DFS), shortest path, connectivity, cycle detection',
        'dynamic-programming': 'memoization, tabulation, optimization problems, overlapping subproblems',
        'strings': 'string manipulation, pattern matching, substring problems, character frequency',
        'stacks-queues': 'stack/queue operations, expression evaluation, monotonic structures',
        'heaps': 'heap operations, priority queues, k-largest/smallest problems',
        'algorithms': 'general algorithmic problem solving with various data structures',
        'javascript': 'JavaScript-specific programming challenges with modern ES6+ features',
        'python': 'Python programming problems utilizing Python-specific libraries and idioms',
        'system-design': 'design scalable systems, API design, database schema problems'
      };

      const spec = difficultySpecs[difficulty] || difficultySpecs.medium;
      const topicSpec = topicSpecs[topic] || `${topic} related programming challenges`;

      return `Generate a unique, non-repetitive coding problem about ${topicSpec} at ${difficulty} difficulty level for ${language}.
Session ID: ${sessionId} (ensure uniqueness across requests)

DIFFICULTY REQUIREMENTS (${difficulty.toUpperCase()}):
- ${spec.instruction}
- Complexity: ${spec.complexity}
- Test cases: ${spec.testCases}

PROBLEM REQUIREMENTS:
- Must be interview-relevant and educational
- Include real-world application context
- Should test core ${topic} concepts
- Appropriate for ${language} programming language
- Include comprehensive examples and edge cases
- Problem should be fresh and not commonly repeated

Return ONLY a JSON object with this exact format:
{
  "title": "Descriptive Problem Title",
  "description": "Detailed problem description with context, examples, and what needs to be solved",
  "inputFormat": "Clear input format specification",
  "outputFormat": "Clear output format specification", 
  "constraints": "Input size limits, value ranges, and performance expectations",
  "examples": "2-3 detailed input/output examples with step-by-step explanations",
  "testCases": [
    {"input": "test input 1", "output": "expected output 1"},
    {"input": "test input 2", "output": "expected output 2"},
    {"input": "test input 3", "output": "expected output 3"}
  ],
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "hints": "2-3 helpful hints for solving the problem"
}

CRITICAL REQUIREMENTS:
- Problem must be unique and engaging
- Appropriate ${difficulty} difficulty level
- Test ${topic} specific knowledge and skills
- Include comprehensive test cases covering edge cases
- No markdown formatting, just pure JSON object
- Must be solvable in ${language}`;
    };

    const prompt = getCodingPrompt(topic, difficulty, language, sessionId);

    console.log('🚀 Sending request to Gemini...');
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: REQUEST_TIMEOUT
      }
    );

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('📥 Raw Gemini Response:', aiResponse);

    if (!aiResponse) {
      throw new Error('No response from Gemini API');
    }


    let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const problem = JSON.parse(cleanResponse);
    console.log('✅ Parsed Problem:', problem);
    console.log('🎯 ===============================================');

    // Add any additional logging or processing here if needed
    res.json({
      success: true,
      problem: problem,
      metadata: {
        topic,
        difficulty,
        language,
        source: 'gemini-direct',
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('🎯 ===============================================');
    
    // Return a well-structured fallback problem instead of error
    const fallbackProblem = generateFallbackProblem(topic, difficulty, language);
    
    res.json({
      success: true, // Mark as success so frontend can display the problem
      problem: fallbackProblem,
      metadata: {
        topic,
        difficulty,
        language,
        source: 'backend-fallback',
        generatedAt: new Date().toISOString(),
        note: 'Generated from fallback due to API issues'
      }
    });
  }
});

// Fallback problem generator
function generateFallbackProblem(topic, difficulty, language) {
  const problems = {
    'arrays': {
      title: "Array Sum Calculator",
      description: "Given an array of integers, calculate and return the sum of all elements. This fundamental problem tests your ability to iterate through arrays and perform arithmetic operations.",
      inputFormat: "First line contains n (number of elements)\nSecond line contains n space-separated integers",
      outputFormat: "Single integer representing the sum of all array elements",
      constraints: "1 ≤ n ≤ 1000\n-1000 ≤ each element ≤ 1000",
      examples: "Input:\n3\n1 2 3\n\nOutput:\n6\n\nExplanation: 1 + 2 + 3 = 6",
      testCases: [
        { 
          input: "3\n1 2 3", 
          output: "6",
          explanation: "Sum: 1 + 2 + 3 = 6"
        },
        { 
          input: "4\n-1 0 1 2", 
          output: "2",
          explanation: "Sum: (-1) + 0 + 1 + 2 = 2"
        },
        { 
          input: "1\n5", 
          output: "5",
          explanation: "Sum: 5 = 5"
        },
        { 
          input: "5\n10 -5 3 -2 4", 
          output: "10",
          explanation: "Sum: 10 + (-5) + 3 + (-2) + 4 = 10"
        }
      ],
      hints: "1. Use a loop to iterate through all elements\n2. Keep a running sum variable\n3. Handle negative numbers correctly"
    },
    'sorting': {
      title: "Array Sorting Challenge",
      description: "Given an array of integers, sort the array in ascending order and return the sorted result. You can use any sorting algorithm or built-in functions.",
      inputFormat: "First line contains n (number of elements)\nSecond line contains n space-separated integers",
      outputFormat: "Single line with n space-separated integers in ascending order",
      constraints: "1 ≤ n ≤ 1000\n-1000 ≤ each element ≤ 1000",
      examples: "Input:\n5\n3 1 4 1 5\n\nOutput:\n1 1 3 4 5\n\nExplanation: Elements arranged in ascending order",
      testCases: [
        { 
          input: "5\n3 1 4 1 5", 
          output: "1 1 3 4 5",
          explanation: "Elements sorted in ascending order"
        },
        { 
          input: "3\n-1 0 1", 
          output: "-1 0 1",
          explanation: "Already sorted array"
        },
        { 
          input: "1\n42", 
          output: "42",
          explanation: "Single element array"
        },
        { 
          input: "4\n10 5 2 8", 
          output: "2 5 8 10",
          explanation: "Sort: [10,5,2,8] → [2,5,8,10]"
        }
      ],
      hints: "1. Use built-in sort or implement your own\n2. Handle negative numbers properly\n3. Output space-separated values"
    },
    'strings': {
      title: "String Reversal",
      description: "Given a string, return the string with its characters in reverse order. This tests basic string manipulation skills.",
      inputFormat: "Single line containing a string (may include spaces)",
      outputFormat: "Single line containing the reversed string",
      constraints: "1 ≤ string length ≤ 1000\nString may contain letters, digits, spaces, and punctuation",
      examples: "Input:\nhello world\n\nOutput:\ndlrow olleh\n\nExplanation: Characters are reversed position by position",
      testCases: [
        { 
          input: "hello", 
          output: "olleh",
          explanation: "Reverse each character: h-e-l-l-o → o-l-l-e-h"
        },
        { 
          input: "abc 123", 
          output: "321 cba",
          explanation: "Reverse including spaces: 'abc 123' → '321 cba'"
        },
        { 
          input: "a", 
          output: "a",
          explanation: "Single character remains the same"
        },
        { 
          input: "Programming", 
          output: "gnimmargorP",
          explanation: "Reverse: Programming → gnimmargorP"
        }
      ],
      hints: "1. Iterate from end to beginning\n2. Build result character by character\n3. Preserve all characters including spaces"
    }
  };

  // Get topic-specific problem or create generic one
  const specificProblem = problems[topic];
  if (specificProblem) {
    return {
      ...specificProblem,
      difficulty: difficulty,
      topic: topic
    };
  }

  // Generic fallback
  return {
    title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Programming Challenge`,
    description: `A ${difficulty} level programming problem focusing on ${topic}. Read a number from input and output the same number to test basic input/output handling.`,
    inputFormat: "Single integer n",
    outputFormat: "Single integer n",
    constraints: "1 ≤ n ≤ 100",
    examples: "Input:\n5\n\nOutput:\n5\n\nExplanation: Echo the input number",
    testCases: [
      { 
        input: "5", 
        output: "5",
        explanation: "Echo the input number as output"
      },
      { 
        input: "10", 
        output: "10",
        explanation: "Output the same value as input"
      },
      { 
        input: "1", 
        output: "1",
        explanation: "Simple input-output test"
      },
      { 
        input: "42", 
        output: "42",
        explanation: "Test with a different number"
      }
    ],
    difficulty: difficulty,
    topic: topic,
    hints: "1. Read the input carefully\n2. Output the exact same value\n3. Check input/output format requirements"
  };
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    geminiConfigured: !!GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// 📊 USER PROGRESS TRACKING ENDPOINTS

// Store MCQ session results
app.post('/api/store-mcq-session', async (req, res) => {
  const {
    userId,
    topic,
    difficulty,
    totalQuestions,
    correctAnswers,
    timeSpent,
    questions,
    answers
  } = req.body;

  console.log('📊 Storing MCQ session for user:', userId);

  try {
    const sessionData = {
      userId,
      type: 'mcq',
      topic,
      difficulty,
      totalQuestions,
      correctAnswers,
      timeSpent,
      questions,
      answers,
      timestamp: new Date(),
      accuracy: Math.round((correctAnswers / totalQuestions) * 100)
    };

    res.json({
      success: true,
      message: 'MCQ session stored successfully',
      sessionId: Date.now(),
      data: sessionData
    });

  } catch (error) {
    console.error('❌ Error storing MCQ session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store MCQ session',
      details: error.message
    });
  }
});

// Store coding session results
app.post('/api/store-coding-session', async (req, res) => {
  const {
    userId,
    topic,
    difficulty,
    language,
    totalProblems,
    solvedProblems,
    timeSpent,
    problems,
    solutions
  } = req.body;

  console.log('💻 Storing coding session for user:', userId);

  try {
    const sessionData = {
      userId,
      type: 'coding',
      topic,
      difficulty,
      language,
      totalProblems,
      solvedProblems,
      timeSpent,
      problems,
      solutions,
      timestamp: new Date(),
      successRate: Math.round((solvedProblems / totalProblems) * 100)
    };

    res.json({
      success: true,
      message: 'Coding session stored successfully',
      sessionId: Date.now(),
      data: sessionData
    });

  } catch (error) {
    console.error('❌ Error storing coding session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store coding session',
      details: error.message
    });
  }
});

// 🤖 AI-POWERED INTERVIEW ASSESSMENT
app.post('/api/assess-interview', async (req, res) => {
  const {
    userId,
    interviewType,
    topic,
    difficulty,
    duration,
    interviewData,
    userResponses,
    interviewQuestions
  } = req.body;

  console.log('🎯 ============= AI INTERVIEW ASSESSMENT =============');
  console.log(`👤 User: ${userId}, Type: ${interviewType}, Topic: ${topic}`);

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Gemini API key not configured'
    });
  }

  try {
    const assessmentPrompt = `Conduct a comprehensive interview assessment for a ${interviewType} interview on ${topic} at ${difficulty} level.

INTERVIEW DETAILS:
- Duration: ${duration} minutes
- Topic: ${topic}
- Difficulty: ${difficulty}
- Type: ${interviewType}

QUESTIONS ASKED:
${interviewQuestions?.map((q, i) => `${i + 1}. ${q}`).join('\n') || 'Questions not provided'}

USER RESPONSES:
${userResponses?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'Responses not provided'}

ADDITIONAL CONTEXT:
${JSON.stringify(interviewData, null, 2)}

Please provide a detailed assessment in the following JSON format:
{
  "overallRating": 4.2,
  "detailedScores": {
    "technicalKnowledge": 4.0,
    "problemSolving": 4.5,
    "communication": 3.8,
    "codeQuality": 4.1,
    "systemDesign": 3.9
  },
  "strengths": [
    "Strong understanding of core concepts",
    "Good problem-solving approach",
    "Clear communication style"
  ],
  "improvements": [
    "Could improve on edge case handling",
    "Need more practice with system design concepts",
    "Consider discussing time complexity more"
  ],
  "recommendations": [
    "Practice more system design problems",
    "Focus on optimizing algorithm solutions",
    "Work on explaining thought process step by step"
  ],
  "performanceInsights": {
    "responseTime": "Good - answered most questions promptly",
    "depthOfKnowledge": "Solid understanding with room for advanced concepts",
    "practicalApplication": "Can apply concepts well to real-world scenarios"
  },
  "nextSteps": [
    "Practice advanced data structures",
    "Study system design patterns",
    "Mock interview practice recommended"
  ],
  "interviewReadiness": "75% - Good foundation, needs refinement in advanced areas"
}

ASSESSMENT CRITERIA:
- Technical accuracy and depth of knowledge
- Problem-solving methodology and approach
- Communication clarity and structure
- Code quality and best practices (if applicable)
- Ability to handle follow-up questions
- Overall interview presence and confidence

Provide constructive, actionable feedback that helps the candidate improve their interview performance.`;

    console.log('🚀 Sending assessment request to Gemini...');
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: assessmentPrompt
          }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: REQUEST_TIMEOUT
      }
    );

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('📥 Raw Gemini Assessment:', aiResponse);

    if (!aiResponse) {
      throw new Error('No assessment response from Gemini API');
    }

    // Clean and parse JSON
    let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const assessment = JSON.parse(cleanResponse);

    // Store assessment data
    const assessmentData = {
      userId,
      type: 'interview',
      interviewType,
      topic,
      difficulty,
      duration,
      assessment,
      timestamp: new Date(),
      sessionId: Date.now()
    };

    console.log('✅ Assessment completed successfully');
    console.log('🎯 ===============================================');

    res.json({
      success: true,
      assessment: assessment,
      sessionData: assessmentData,
      message: 'Interview assessment completed successfully'
    });

  } catch (error) {
    console.error('❌ Assessment Error:', error.message);
    console.log('🎯 ===============================================');

    res.status(500).json({
      success: false,
      error: 'Failed to assess interview',
      details: error.message
    });
  }
});

// 🤖 AI CODE ANALYSIS & CORRECTION
app.post('/api/analyze-code', async (req, res) => {
  const { code, language, problem, errors } = req.body;
  const sessionId = Date.now() + Math.random().toString(36).substr(2, 9);

  console.log('🔍 ============= CODE ANALYSIS REQUEST =============');
  console.log(`💻 Language: ${language}, Session: ${sessionId}`);

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Gemini API key not configured'
    });
  }

  try {
    const analysisPrompt = `You are an expert code reviewer and debugging assistant. Analyze the following code and provide comprehensive feedback.

CODE TO ANALYZE:
\`\`\`${language}
${code}
\`\`\`

PROBLEM CONTEXT:
${problem || 'General code analysis'}

CURRENT ERRORS (if any):
${errors || 'No specific errors reported'}

Please provide a detailed analysis in the following JSON format:
{
  "syntaxErrors": [
    {
      "line": 5,
      "error": "Missing semicolon",
      "severity": "high",
      "fix": "Add semicolon at end of line"
    }
  ],
  "logicIssues": [
    {
      "issue": "Infinite loop detected",
      "location": "lines 10-15", 
      "explanation": "Loop condition never becomes false",
      "suggestion": "Add proper exit condition"
    }
  ],
  "improvements": [
    {
      "type": "performance",
      "description": "Use more efficient algorithm",
      "current": "O(n²) complexity",
      "suggested": "O(n log n) with sorting"
    },
    {
      "type": "readability",
      "description": "Add meaningful variable names",
      "example": "Change 'x' to 'userCount'"
    }
  ],
  "correctedCode": "// Provide the corrected version of the code here",
  "testCases": [
    {
      "input": "example input",
      "expectedOutput": "example output",
      "explanation": "Why this test case is important"
    }
  ],
  "bestPractices": [
    "Add input validation",
    "Include error handling",
    "Use consistent formatting"
  ],
  "codeQuality": {
    "score": 7.5,
    "strengths": ["Good algorithm choice", "Clear structure"],
    "weaknesses": ["Poor variable naming", "Missing comments"]
  }
}

ANALYSIS GUIDELINES:
- Focus on ${language} specific best practices
- Provide actionable, specific suggestions
- Include corrected code if major issues found
- Explain the reasoning behind each suggestion
- Consider performance, readability, and maintainability`;

    console.log('🚀 Sending code analysis request to Gemini...');
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: REQUEST_TIMEOUT
      }
    );

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('📥 Raw Gemini Code Analysis:', aiResponse);

    if (!aiResponse) {
      throw new Error('No analysis response from Gemini API');
    }

    // Clean and parse JSON
    let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleanResponse);

    console.log('✅ Code analysis completed successfully');
    console.log('🎯 ===============================================');

    res.json({
      success: true,
      analysis: analysis,
      metadata: {
        language,
        sessionId,
        analyzedAt: new Date().toISOString(),
        source: 'gemini-ai'
      }
    });

  } catch (error) {
    console.error('❌ Code Analysis Error:', error.message);
    console.log('🎯 ===============================================');

    res.status(500).json({
      success: false,
      error: 'Failed to analyze code',
      details: error.message
    });
  }
});

// Get user progress summary
app.get('/api/user-progress/:userId', async (req, res) => {
  const { userId } = req.params;
  const { timeframe = 'all' } = req.query;

  console.log(`📊 Fetching progress for user: ${userId}, timeframe: ${timeframe}`);

  try {
    // In a real implementation, this would fetch from database
    // For now, return mock structure that frontend expects
    const mockProgress = {
      totalMCQAttempts: 0,
      totalCodingAttempts: 0,
      totalFaceToFaceInterviews: 0,
      mcqAccuracy: 0,
      codingSuccess: 0,
      recentActivity: [],
      topicProgress: [],
      difficultyProgress: [],
      monthlyProgress: [],
      overallRating: 0,
      strengths: [],
      improvements: [],
      recommendations: []
    };

    res.json({
      success: true,
      progress: mockProgress,
      message: 'User progress retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user progress',
      details: error.message
    });
  }
});

// Existing Codeforces proxy (keep this)
app.get('/fetchProblem', async (req, res) => {
  const { contestId, index } = req.query;
  const url = `https://codeforces.com/contest/${contestId}/problem/${index}`;

  try {
    const response = await axios.get(url);
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching problem details:', error);
    res.status(500).send('Failed to fetch problem details');
  }
});

// 💾 Q&A STORAGE ENDPOINTS

// Store user's question response
app.post('/api/store-qa', async (req, res) => {
  const { sessionId, userId, questionData, userAnswer, isCorrect } = req.body;
  
  console.log(`💾 Storing Q&A: Session ${sessionId}, User ${userId}, Correct: ${isCorrect}`);
  
  try {
    storeQuestionAnswer(sessionId, userId, questionData, userAnswer, isCorrect);
    
    res.json({
      success: true,
      message: 'Q&A stored successfully',
      analytics: {
        totalQuestions: questionAnswerStorage.analytics.totalQuestions,
        totalSessions: questionAnswerStorage.analytics.totalSessions
      }
    });
  } catch (error) {
    console.error('❌ Error storing Q&A:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store Q&A data'
    });
  }
});

// Get user's Q&A history
app.get('/api/qa-history/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;
  
  console.log(`📚 Fetching Q&A history for user: ${userId}`);
  
  try {
    const userHistory = questionAnswerStorage.userResponses.get(userId) || [];
    const limitedHistory = userHistory.slice(-parseInt(limit));
    
    res.json({
      success: true,
      history: limitedHistory,
      totalQuestions: userHistory.length,
      accuracy: calculateUserAccuracy(userId)
    });
  } catch (error) {
    console.error('❌ Error fetching Q&A history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Q&A history'
    });
  }
});

// Get session details
app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  console.log(`🔍 Fetching session details: ${sessionId}`);
  
  try {
    const sessionData = questionAnswerStorage.sessions.get(sessionId);
    
    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session: sessionData,
      analytics: calculateSessionAnalytics(sessionData)
    });
  } catch (error) {
    console.error('❌ Error fetching session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session data'
    });
  }
});

// Get Q&A analytics
app.get('/api/qa-analytics', (req, res) => {
  console.log('📊 Fetching Q&A analytics');
  
  try {
    const analytics = {
      ...questionAnswerStorage.analytics,
      topicDistribution: Object.fromEntries(questionAnswerStorage.analytics.topicDistribution),
      difficultyDistribution: Object.fromEntries(questionAnswerStorage.analytics.difficultyDistribution),
      questionBank: {
        totalUniqueQuestions: questionAnswerStorage.questionBank.size,
        averageCorrectRate: calculateAverageCorrectRate()
      }
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

function calculateUserAccuracy(userId) {
  const userHistory = questionAnswerStorage.userResponses.get(userId) || [];
  if (userHistory.length === 0) return 0;
  
  const correctAnswers = userHistory.filter(response => response.isCorrect).length;
  return (correctAnswers / userHistory.length) * 100;
}

function calculateSessionAnalytics(sessionData) {
  const totalQuestions = sessionData.questions.length;
  const correctAnswers = sessionData.questions.filter(q => q.isCorrect).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  
  return {
    totalQuestions,
    correctAnswers,
    accuracy,
    topic: sessionData.topic,
    difficulty: sessionData.difficulty,
    duration: calculateSessionDuration(sessionData)
  };
}

function calculateSessionDuration(sessionData) {
  if (sessionData.questions.length === 0) return 0;
  
  const startTime = new Date(sessionData.startTime);
  const lastAnswerTime = new Date(sessionData.questions[sessionData.questions.length - 1].answeredAt);
  
  return Math.round((lastAnswerTime - startTime) / 1000); // Duration in seconds
}

function calculateAverageCorrectRate() {
  const allQuestions = Array.from(questionAnswerStorage.questionBank.values());
  if (allQuestions.length === 0) return 0;
  
  const totalCorrectRate = allQuestions.reduce((sum, q) => sum + (q.correctRate || 0), 0);
  return (totalCorrectRate / allQuestions.length) * 100;
}

app.listen(PORT, () => {
  console.log(`🚀 SIMPLIFIED AceMyInterview Backend running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini AI: ${GEMINI_API_KEY ? 'READY' : 'NOT CONFIGURED'}`);
  console.log(`💾 Q&A Storage: ENABLED`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /api/mcq-questions - Generate MCQ questions');
  console.log('  POST /api/coding-problems - Generate coding problems');
  console.log('  POST /api/store-qa - Store question-answer data');
  console.log('  GET  /api/qa-history/:userId - Get user Q&A history');
  console.log('  GET  /api/session/:sessionId - Get session details');
  console.log('  GET  /api/qa-analytics - Get Q&A analytics');
  console.log('  GET  /api/health - Health check');
  console.log('  GET  /fetchProblem - Codeforces proxy');
});
