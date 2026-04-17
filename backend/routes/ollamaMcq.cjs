// NMKRSPVLIDATA - Ollama MCQ Generation Routes
// Simple endpoint to generate MCQ questions using Ollama backend

const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get Ollama configuration from environment
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'https://pricing-correction-agenda-criterion.trycloudflare.com';
const OLLAMA_API_ENDPOINT = `${OLLAMA_BASE_URL}/api/generate`;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

console.log('🔧 Ollama MCQ Routes Configuration:');
console.log(`   🌐 Endpoint: ${OLLAMA_API_ENDPOINT}`);
console.log(`   🧠 Model: ${OLLAMA_MODEL}`);

/**
 * Generate MCQ questions using Ollama
 * POST /api/ollama-mcq/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    console.log(`📝 Generating MCQ for: ${topic} (${difficulty}, count: ${count})`);

    // Construct MCQ generation prompt
    const prompt = `Generate ${count} multiple-choice interview questions for "${topic}" at ${difficulty} difficulty level.

CRITICAL: You MUST return ONLY valid JSON array, no markdown, no code blocks, no explanations.

Format EXACTLY like this:
[
  {
    "question": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "This is correct because..."
  }
]

Requirements:
- Each question must have exactly 4 options
- correctAnswer is 0-3 (index of correct option)
- All text must be strings
- NO markdown code blocks
- NO explanations outside JSON
- Return ONLY the JSON array`;

    // Call Ollama API
    const response = await axios.post(
      OLLAMA_API_ENDPOINT,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.7,
          num_predict: 4000,
          top_p: 0.9
        }
      },
      {
        timeout: 120000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    let responseText = response.data.response || '';
    console.log('📥 Ollama response length:', responseText.length);

    // Clean JSON - remove markdown code blocks if present
    responseText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Fix incomplete JSON if needed
    if (responseText.startsWith('{') || responseText.startsWith('[')) {
      const openBraces = (responseText.match(/{/g) || []).length;
      const closeBraces = (responseText.match(/}/g) || []).length;
      const openBrackets = (responseText.match(/\[/g) || []).length;
      const closeBrackets = (responseText.match(/]/g) || []).length;

      if (openBraces > closeBraces) {
        responseText += '}'.repeat(openBraces - closeBraces);
      }
      if (openBrackets > closeBrackets) {
        responseText += ']'.repeat(openBrackets - closeBrackets);
      }
    }

    // Parse JSON
    let questions = [];
    try {
      questions = JSON.parse(responseText);
      if (!Array.isArray(questions)) {
        questions = [];
      }
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.error('📄 Response text:', responseText.substring(0, 500));
      throw new Error('Failed to parse Ollama response as JSON');
    }

    // Validate questions format
    const validQuestions = questions.filter(q => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length >= 4 && 
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 && 
      q.correctAnswer < q.options.length
    );

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated from Ollama');
    }

    console.log(`✅ Generated ${validQuestions.length} valid questions`);

    return res.json({
      success: true,
      questions: validQuestions,
      count: validQuestions.length,
      source: 'ollama',
      model: OLLAMA_MODEL
    });

  } catch (error) {
    console.error('❌ MCQ Generation Error:', error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
      source: 'ollama-error'
    });
  }
});

/**
 * Health check for Ollama service
 * GET /api/ollama-mcq/health
 */
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
      timeout: 5000
    });

    return res.json({
      healthy: response.status === 200,
      endpoint: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      status: '✅ Ollama service is running'
    });
  } catch (error) {
    return res.status(503).json({
      healthy: false,
      endpoint: OLLAMA_BASE_URL,
      error: error.message,
      status: '❌ Ollama service is unavailable'
    });
  }
});

module.exports = router;
