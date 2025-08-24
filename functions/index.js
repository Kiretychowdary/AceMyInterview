// Firebase Functions for AceMyInterview
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Initialize Firebase Admin
admin.initializeApp();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: true, // Firebase Functions handles CORS automatically
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
};

app.use(cors(corsOptions));
app.use(express.json());

// Environment Configuration
const GEMINI_API_KEY = functions.config().gemini?.api_key;
const JUDGE0_API_KEY = functions.config().judge0?.api_key;
const JUDGE0_API_HOST = functions.config().judge0?.api_host || 'judge0-ce.p.rapidapi.com';
const REQUEST_TIMEOUT = 30000;

// Firestore reference
const db = admin.firestore();

// 💾 FIRESTORE Q&A STORAGE SYSTEM
async function storeQuestionAnswer(sessionId, userId, questionData, userAnswer, isCorrect) {
  try {
    const timestamp = new Date();
    
    const qaRecord = {
      sessionId,
      userId,
      question: questionData,
      userAnswer,
      isCorrect,
      timestamp,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Store in Firestore
    await db.collection('questionAnswers').add(qaRecord);
    
    // Update session analytics
    await db.collection('sessions').doc(sessionId).set({
      userId,
      lastActivity: timestamp,
      totalQuestions: admin.firestore.FieldValue.increment(1),
      correctAnswers: isCorrect ? admin.firestore.FieldValue.increment(1) : admin.firestore.FieldValue.increment(0)
    }, { merge: true });

    console.log('✅ Q&A stored successfully in Firestore');
    return true;
  } catch (error) {
    console.error('❌ Error storing Q&A:', error);
    return false;
  }
}

// Get user Q&A history
async function getUserQAHistory(userId, limit = 50) {
  try {
    const snapshot = await db.collection('questionAnswers')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const history = [];
    snapshot.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });

    return history;
  } catch (error) {
    console.error('❌ Error fetching Q&A history:', error);
    return [];
  }
}

// 🎯 GEMINI AI INTEGRATION
async function callGeminiAPI(prompt, retries = 3) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        },
        {
          timeout: REQUEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error(`❌ Gemini API call attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// 💡 MOTIVATIONAL QUOTES
const motivationalQuotes = [
  "🚀 Code is poetry written in logic!",
  "💪 Every expert was once a beginner!",
  "🎯 Debug your way to success!",
  "⭐ Great code comes from great thinking!",
  "🔥 You're building the future, one line at a time!",
  "💎 Errors are just stepping stones to excellence!",
  "🌟 Keep coding, keep growing!",
  "🎪 Programming is problem-solving with style!",
  "🚀 Your next breakthrough is just one commit away!",
  "💡 Code with passion, debug with patience!"
];

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Firebase Functions Backend Running! 🚀',
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
});

// Motivational quotes
app.get('/api/motivational-quote', (req, res) => {
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  res.json({ quote: randomQuote });
});

// Generate MCQ Questions
app.post('/api/generate-mcq', async (req, res) => {
  try {
    const { category, count = 1, difficulty = 'medium' } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const prompt = `Generate ${count} multiple choice question(s) for ${category} programming interviews.
    Difficulty: ${difficulty}
    
    Format each question as JSON:
    {
      "question": "Question text here",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation here",
      "difficulty": "${difficulty}",
      "category": "${category}"
    }
    
    Return only valid JSON array of questions.`;

    const geminiResponse = await callGeminiAPI(prompt);
    
    // Parse the response
    let questions;
    try {
      // Try to extract JSON from response
      const jsonMatch = geminiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback parsing
        questions = JSON.parse(geminiResponse);
      }
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        details: parseError.message
      });
    }

    // Ensure questions is an array
    if (!Array.isArray(questions)) {
      questions = [questions];
    }

    res.json({ questions, source: 'gemini' });
  } catch (error) {
    console.error('❌ MCQ generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate MCQ questions',
      details: error.message
    });
  }
});

// Generate Coding Problems
app.post('/api/generate-coding-problem', async (req, res) => {
  try {
    const { difficulty = 'medium', category = 'general' } = req.body;

    const prompt = `Generate a coding problem for interview practice.
    Difficulty: ${difficulty}
    Category: ${category}
    
    Format as JSON:
    {
      "title": "Problem title",
      "description": "Detailed problem description with examples",
      "inputFormat": "Input format description",
      "outputFormat": "Output format description",
      "constraints": "Problem constraints",
      "examples": [
        {
          "input": "example input",
          "output": "expected output",
          "explanation": "why this output"
        }
      ],
      "difficulty": "${difficulty}",
      "category": "${category}",
      "hints": ["hint 1", "hint 2"],
      "solutionApproach": "Brief solution approach"
    }
    
    Return only valid JSON.`;

    const geminiResponse = await callGeminiAPI(prompt);
    
    let problem;
    try {
      // Try to extract JSON from response
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        problem = JSON.parse(jsonMatch[0]);
      } else {
        problem = JSON.parse(geminiResponse);
      }
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        details: parseError.message
      });
    }

    res.json({ problem, source: 'gemini' });
  } catch (error) {
    console.error('❌ Coding problem generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate coding problem',
      details: error.message
    });
  }
});

// Judge0 Code Execution
app.post('/api/execute-code', async (req, res) => {
  try {
    const { code, language, input = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    if (!JUDGE0_API_KEY) {
      return res.status(500).json({ error: 'Judge0 API not configured' });
    }

    // Language ID mapping
    const languageMap = {
      'javascript': 63,
      'python': 71,
      'java': 62,
      'cpp': 54,
      'c': 50
    };

    const languageId = languageMap[language.toLowerCase()];
    if (!languageId) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    // Submit code for execution
    const submitResponse = await axios.post(
      `https://${JUDGE0_API_HOST}/submissions`,
      {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: input ? Buffer.from(input).toString('base64') : undefined
      },
      {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': JUDGE0_API_HOST,
          'Content-Type': 'application/json'
        },
        timeout: REQUEST_TIMEOUT
      }
    );

    const submissionToken = submitResponse.data.token;

    // Poll for result
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const resultResponse = await axios.get(
        `https://${JUDGE0_API_HOST}/submissions/${submissionToken}`,
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': JUDGE0_API_HOST
          },
          timeout: REQUEST_TIMEOUT
        }
      );

      const result = resultResponse.data;
      
      if (result.status.id > 2) { // Execution completed
        return res.json({
          output: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '',
          error: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : '',
          status: result.status.description,
          time: result.time,
          memory: result.memory
        });
      }
      
      attempts++;
    }

    return res.status(408).json({ error: 'Code execution timeout' });
  } catch (error) {
    console.error('❌ Code execution error:', error);
    res.status(500).json({ 
      error: 'Failed to execute code',
      details: error.message
    });
  }
});

// Store Q&A endpoint
app.post('/api/store-qa', async (req, res) => {
  try {
    const { sessionId, userId, questionData, userAnswer, isCorrect } = req.body;

    if (!sessionId || !userId || !questionData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const success = await storeQuestionAnswer(sessionId, userId, questionData, userAnswer, isCorrect);
    
    if (success) {
      res.json({ message: 'Q&A stored successfully' });
    } else {
      res.status(500).json({ error: 'Failed to store Q&A' });
    }
  } catch (error) {
    console.error('❌ Store Q&A error:', error);
    res.status(500).json({ 
      error: 'Failed to store Q&A',
      details: error.message
    });
  }
});

// Get user Q&A history
app.get('/api/qa-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const history = await getUserQAHistory(userId, parseInt(limit));
    res.json({ history });
  } catch (error) {
    console.error('❌ Get Q&A history error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Q&A history',
      details: error.message
    });
  }
});

// Export the Express app as Firebase Function
exports.api = functions.https.onRequest(app);