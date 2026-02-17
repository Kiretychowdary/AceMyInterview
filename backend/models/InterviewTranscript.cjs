// Interview Transcript Model
// Stores complete interview sessions with AI-generated questions, user answers, and scores
const mongoose = require('mongoose');

const questionAnswerSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  question: {
    text: { type: String, required: true },
    category: String,
    expectedPoints: [String]
  },
  userAnswer: {
    text: { type: String, default: '' },
    timestamp: Date,
    timeSpent: Number // seconds
  },
  evaluation: {
    score: { type: Number, min: 0, max: 10 },
    strengths: [String],
    improvements: [String],
    feedback: String,
    keyPointsCovered: [String],
    evaluatedAt: { type: Date, default: Date.now }
  }
});

const interviewTranscriptSchema = new mongoose.Schema({
  // Session Info
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  
  // Interview Configuration
  role: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  topic: String,
  totalQuestions: { type: Number, required: true },
  
  // Timing
  startTime: { type: Date, required: true },
  endTime: Date,
  totalDuration: Number, // seconds
  
  // Questions and Answers with Evaluations
  questionsAndAnswers: [questionAnswerSchema],
  
  // Overall Performance
  overallScore: { type: Number, min: 0, max: 10 },
  categoryBreakdown: [{
    category: String,
    score: Number,
    questionsCount: Number
  }],
  
  // AI Analysis
  strengths: [String],
  improvements: [String],
  recommendations: [String],
  summary: String,
  
  // Metadata
  aiModel: { type: String, default: 'llama2' },
  aiSource: { type: String, default: 'ollama-gpu' },
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' }
}, {
  timestamps: true
});

// Index for efficient queries
interviewTranscriptSchema.index({ userId: 1, createdAt: -1 });
interviewTranscriptSchema.index({ sessionId: 1 });
interviewTranscriptSchema.index({ status: 1 });

// Method to add question and answer
interviewTranscriptSchema.methods.addQuestionAnswer = function(questionData, answerData) {
  this.questionsAndAnswers.push({
    questionNumber: this.questionsAndAnswers.length + 1,
    question: questionData,
    userAnswer: answerData
  });
  return this.save();
};

// Method to add evaluation
interviewTranscriptSchema.methods.addEvaluation = function(questionNumber, evaluationData) {
  const qa = this.questionsAndAnswers.find(q => q.questionNumber === questionNumber);
  if (qa) {
    qa.evaluation = evaluationData;
    return this.save();
  }
  throw new Error(`Question ${questionNumber} not found`);
};

// Method to complete interview
interviewTranscriptSchema.methods.complete = function(finalData) {
  this.endTime = new Date();
  this.totalDuration = Math.floor((this.endTime - this.startTime) / 1000);
  this.overallScore = finalData.overallScore;
  this.categoryBreakdown = finalData.breakdown;
  this.strengths = finalData.strengths;
  this.improvements = finalData.improvements;
  this.recommendations = finalData.recommendations;
  this.summary = finalData.summary;
  this.status = 'completed';
  return this.save();
};

const InterviewTranscript = mongoose.model('InterviewTranscript', interviewTranscriptSchema);

module.exports = InterviewTranscript;
