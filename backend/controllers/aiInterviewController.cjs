// NMKRSPVLIDATA - AI Interview Controller with Ollama Support
const axios = require('axios');
const ollamaService = require('../services/ollamaService.cjs');

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const USE_OLLAMA = process.env.USE_OLLAMA === 'true';

/**
 * Generate text using the configured AI service (Ollama or Gemini)
 */
async function generateAIResponse(prompt, options = {}) {
  if (USE_OLLAMA) {
    // Use local Ollama model with GPU
    console.log('🚀 Using Ollama (Local GPU) for generation...');
    const response = await ollamaService.generateCompletion(prompt, options);
    return response;
  } else {
    // Use Gemini API (Cloud)
    console.log('☁️ Using Gemini API for generation...');
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

// Generate interview questions based on role and difficulty
exports.generateInterviewQuestions = async (req, res) => {
  try {
    const { role, difficulty, count = 10 } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, error: 'Role is required' });
    }

    const prompt = `Generate ${count} interview questions for a ${role} position at ${difficulty} difficulty level.

For each question, provide:
1. The question text
2. Category (e.g., Technical, Behavioral, Problem-Solving, etc.)
3. Expected key points in the answer (3-5 points)

Format as JSON array:
[
  {
    "question": "Question text here",
    "category": "Category name",
    "expectedPoints": ["point1", "point2", "point3"]
  }
]

Make questions:
- Relevant to ${role} role
- Appropriate for ${difficulty} level (easy = basic concepts, medium = practical experience, hard = advanced scenarios)
- Mix of technical and behavioral questions
- Progressive difficulty
- Professional and clear

Return ONLY the JSON array, no markdown formatting.`;

    const responseText = await generateAIResponse(prompt, {
      temperature: 0.8,
      maxTokens: 3000
    });

    // Parse the response
    const questions = ollamaService.parseJsonResponse(responseText);

    return res.json({
      success: true,
      questions: questions,
      count: questions.length,
      source: USE_OLLAMA ? 'ollama-gpu' : 'gemini'
    });

  } catch (error) {
    console.error('Error generating interview questions:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate questions',
      message: error.message
    });
  }
};

// Evaluate user's answer to a question
exports.evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, expectedPoints = [] } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ success: false, error: 'Question and answer are required' });
    }

    const prompt = `You are an experienced HR interviewer. Evaluate this interview answer:

Question: ${question}

Candidate's Answer: ${answer}

Expected Key Points: ${expectedPoints.join(', ')}

Provide:
1. Score (0-10)
2. Strengths (what was good)
3. Areas for improvement
4. Brief feedback (2-3 sentences)

Format as JSON:
{
  "score": 7,
  "strengths": ["point1", "point2"],
  "improvements": ["point1", "point2"],
  "feedback": "Brief feedback text"
}

Return ONLY the JSON object, no markdown formatting.`;

    const responseText = await generateAIResponse(prompt, {
      temperature: 0.5,
      maxTokens: 1500
    });

    const evaluation = ollamaService.parseJsonResponse(responseText);

    return res.json({
      success: true,
      feedback: evaluation,
      source: USE_OLLAMA ? 'ollama-gpu' : 'gemini'
    });

  } catch (error) {
    console.error('Error evaluating answer:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to evaluate answer',
      message: error.message
    });
  }
};

// Generate final interview report
exports.generateInterviewReport = async (req, res) => {
  try {
    const { userId, role, answers, duration } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'Answers array is required' });
    }

    const prompt = `Generate a comprehensive interview performance report for a ${role} interview.

Interview Duration: ${duration} minutes
Number of Questions: ${answers.length}

Answers:
${answers.map((a, i) => `
Q${i + 1} (${a.category}): ${a.question}
Answer: ${a.answer}
`).join('\n')}

Provide:
1. Overall Score (0-10)
2. Category-wise breakdown with scores
3. Strengths (3-5 points)
4. Areas for improvement (3-5 points)
5. Recommendations for growth
6. Overall feedback summary

Format as JSON:
{
  "overallScore": 7.5,
  "breakdown": [
    {"category": "Technical", "score": 8},
    {"category": "Behavioral", "score": 7}
  ],
  "strengths": ["point1", "point2"],
  "improvements": ["point1", "point2"],
  "recommendations": ["rec1", "rec2"],
  "summary": "Overall feedback summary"
}

Return ONLY the JSON object, no markdown formatting.`;

    const responseText = await generateAIResponse(prompt, {
      temperature: 0.6,
      maxTokens: 3000
    });

    const report = ollamaService.parseJsonResponse(responseText);

    // TODO: Save report to database
    // const Interview = require('../models/Interview.cjs');
    // await Interview.create({ userId, role, answers, report, duration });

    return res.json({
      success: true,
      report: report,
      source: USE_OLLAMA ? 'ollama-gpu' : 'gemini'
    });

  } catch (error) {
    console.error('Error generating report:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      message: error.message
    });
  }
};

// Health check endpoint for Ollama integration
exports.checkOllamaHealth = async (req, res) => {
  try {
    const isHealthy = await ollamaService.checkHealth();
    const models = await ollamaService.listModels();
    
    return res.json({
      success: true,
      ollama: {
        running: isHealthy,
        url: ollamaService.OLLAMA_API_URL,
        model: ollamaService.OLLAMA_MODEL,
        availableModels: models.map(m => m.name),
        usingGPU: true
      },
      config: {
        useOllama: USE_OLLAMA,
        activeService: USE_OLLAMA ? 'Ollama (Local GPU)' : 'Gemini (Cloud API)'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = exports;
