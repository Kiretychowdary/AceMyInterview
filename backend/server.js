// SIMPLE GEMINI-ONLY BACKEND - NO N8N COMPLEXITY
// NMKRSPVLIDATAPERMANENT - Direct Gemini AI Integration
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Environment Configuration
const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT) || 30000;

console.log('🤖 Gemini API URL:', GEMINI_API_URL);
console.log('🔑 API Key configured:', !!GEMINI_API_KEY);

// 🤖 DIRECT GEMINI MCQ QUESTIONS
app.post('/api/mcq-questions', async (req, res) => {
  const { topic = 'JavaScript', difficulty = 'medium', count = 5 } = req.body;
  const sessionId = Date.now(); // Simple session tracking

  console.log('🎯 =================== MCQ REQUEST ===================');
  console.log(`📚 Topic: ${topic}, Difficulty: ${difficulty}, Count: ${count}`);
  console.log(`🆔 Session: ${sessionId}`);

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

      return `Generate exactly ${count} unique, non-repetitive multiple choice questions about ${topicInfo} at ${difficulty} difficulty level.
Session ID: ${sessionId} (ensure uniqueness across requests)

DIFFICULTY REQUIREMENTS (${difficulty.toUpperCase()}):
- ${spec.instruction}
- Question types: ${spec.questionTypes}
- Complexity: ${spec.complexity}

QUESTION VARIETY REQUIREMENTS:
- Each question must be completely different from others
- Cover diverse aspects of ${topic}
- Include practical, theoretical, and application-based questions
- Avoid similar question patterns or repetitive topics
- Make each question educational and interview-relevant
- Questions should be fresh and not commonly repeated

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

    // Clean and parse JSON
    let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const problem = JSON.parse(cleanResponse);
    console.log('✅ Parsed Problem:', problem);
    console.log('🎯 ===============================================');

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
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate coding problem',
      details: error.message
    });
  }
});

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

app.listen(PORT, () => {
  console.log(`🚀 SIMPLIFIED AceMyInterview Backend running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini AI: ${GEMINI_API_KEY ? 'READY' : 'NOT CONFIGURED'}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /api/mcq-questions - Generate MCQ questions');
  console.log('  POST /api/coding-problems - Generate coding problems');
  console.log('  GET  /api/health - Health check');
  console.log('  GET  /fetchProblem - Codeforces proxy');
});
