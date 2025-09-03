//nmkrspvlidata
//radhakrishna
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', 
      'http://localhost:5174', 
      'http://localhost:5175', 
      'http://localhost:5176',   
      'http://localhost:5177',
      'https://aiksvid.netlify.app',
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log(`CORS: Blocked origin: ${origin}`);
      return callback(null, true); 
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

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && origin.includes('localhost:5176')) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-rapidapi-key, x-rapidapi-host, Origin, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    console.log(`CORS Preflight: ${req.headers.origin} -> ${req.url}`);
    return res.sendStatus(200);
  }
  
  console.log(`CORS Request: ${req.method} ${req.url} from ${origin}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working correctly!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT) || 30000;

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

function storeQuestionAnswer(sessionId, userId, questionData, userAnswer, isCorrect) {
  const timestamp = new Date().toISOString();
  
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
  
  const questionKey = `${questionData.topic}_${questionData.difficulty}_${questionData.question.substring(0, 50)}`;
  questionAnswerStorage.questionBank.set(questionKey, {
    ...questionData,
    timesAsked: (questionAnswerStorage.questionBank.get(questionKey)?.timesAsked || 0) + 1,
    correctRate: calculateCorrectRate(questionKey, isCorrect),
    lastUsed: timestamp
  });
  
  questionAnswerStorage.analytics.totalQuestions++;
  
  const topicCount = questionAnswerStorage.analytics.topicDistribution.get(questionData.topic) || 0;
  questionAnswerStorage.analytics.topicDistribution.set(questionData.topic, topicCount + 1);
  
  const difficultyCount = questionAnswerStorage.analytics.difficultyDistribution.get(questionData.difficulty) || 0;
  questionAnswerStorage.analytics.difficultyDistribution.set(questionData.difficulty, difficultyCount + 1);
}

function calculateCorrectRate(questionKey, isCorrect) {
  const existing = questionAnswerStorage.questionBank.get(questionKey);
  if (!existing) return isCorrect ? 1.0 : 0.0;
  
  const timesAsked = existing.timesAsked || 1;
  const currentCorrect = (existing.correctRate || 0) * timesAsked;
  const newCorrect = currentCorrect + (isCorrect ? 1 : 0);
  return newCorrect / (timesAsked + 1);
}

console.log('🚀 AceMyInterview Backend Server Starting...');
console.log('🔧 CORS Configuration Applied for localhost:5176');
console.log('📊 Q&A Storage System Initialized');


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for localhost:5176`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
