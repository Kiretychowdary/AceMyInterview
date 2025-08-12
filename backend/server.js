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

  console.log('🎯 =================== MCQ REQUEST ===================');
  console.log(`📚 Topic: ${topic}, Difficulty: ${difficulty}, Count: ${count}`);

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Gemini API key not configured'
    });
  }

  try {
    const prompt = `Generate exactly ${count} multiple choice questions about ${topic} at ${difficulty} difficulty level. 
    Return ONLY a JSON array with exactly ${count} questions in this exact format:
    [
      {
        "question": "Your question here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Brief explanation of the correct answer"
      }
    ]
    IMPORTANT: The array must contain exactly ${count} questions, no more, no less. Make sure the questions are educational, accurate, and appropriate for ${difficulty} level. Do not include any markdown formatting, code blocks, or extra text, just pure JSON array.`;

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

  console.log('🎯 ================ CODING REQUEST ================');
  console.log(`💻 Topic: ${topic}, Difficulty: ${difficulty}, Language: ${language}`);

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Gemini API key not configured'
    });
  }

  try {
    const prompt = `Generate a coding problem about ${topic} at ${difficulty} difficulty level for ${language}.
    Return ONLY a JSON object with this exact format:
    {
      "title": "Problem Title",
      "description": "Detailed problem description with examples",
      "inputFormat": "Input format description",
      "outputFormat": "Output format description", 
      "constraints": "Problem constraints",
      "examples": "Input/Output examples with explanations",
      "testCases": [
        {"input": "test input 1", "output": "expected output 1"},
        {"input": "test input 2", "output": "expected output 2"},
        {"input": "test input 3", "output": "expected output 3"}
      ],
      "difficulty": "${difficulty}",
      "topic": "${topic}"
    }
    Make it educational and appropriate for ${difficulty} level. Include 3-5 test cases with varying complexity. Do not include markdown formatting, just pure JSON.`;

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
