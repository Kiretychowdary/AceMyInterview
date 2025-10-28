const axios = require('axios');

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT) || 30000;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
async function postWithRetries(url, body, options = {}, maxAttempts = 3) {
  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await axios.post(url, body, options);
      return { response: resp, attempts: attempt };
    } catch (err) {
      lastErr = err;
      const status = err.response?.status;
      const retryAfter = err.response?.headers?.['retry-after'];
      if (status === 429) {
        let waitMs = 1000 * Math.pow(2, attempt);
        if (retryAfter) {
          const parsed = parseInt(retryAfter, 10);
          if (!Number.isNaN(parsed)) waitMs = parsed * 1000;
        }
        if (attempt < maxAttempts) {
          await sleep(waitMs + Math.floor(Math.random() * 300));
          continue;
        }
        const e = new Error(`Upstream HTTP 429: ${err.message}`);
        e.retryAfter = retryAfter || null;
        e.status = 429;
        e.upstreamBody = err.response?.data || null;
        throw e;
      }
      if (attempt < maxAttempts) {
        const backoff = 1000 * Math.pow(2, attempt);
        await sleep(backoff + Math.floor(Math.random() * 200));
        continue;
      }
      const e = new Error(err.message || 'Upstream request failed');
      e.status = status || null;
      e.retryAfter = retryAfter || null;
      e.upstreamBody = err.response?.data || null;
      throw e;
    }
  }
  const e = new Error(lastErr?.message || 'Upstream request failed after retries');
  e.status = lastErr?.response?.status || null;
  e.upstreamBody = lastErr?.response?.data || null;
  throw e;
}

function getTopicSpecificPrompt(topic, difficulty, count, sessionId) {
  const difficultySpecs = {
    easy: {
      instruction: 'Focus on basic concepts, fundamental terminology, and simple applications',
      questionTypes: 'definition questions, basic syntax, simple true/false concepts',
      complexity: 'straightforward with clear answers',
    },
    medium: {
      instruction: 'Include practical applications, scenario-based questions, and moderate problem-solving',
      questionTypes: 'code analysis, best practices, debugging scenarios, design patterns',
      complexity: 'requiring some analysis and understanding of intermediate concepts',
    },
    hard: {
      instruction: 'Advanced concepts, complex scenarios, optimization problems, and expert-level knowledge',
      questionTypes: 'system design decisions, performance optimization, security considerations, advanced algorithms',
      complexity: 'requiring deep understanding and critical thinking',
    },
  };

  const topicInstructions = {
    JavaScript: 'JavaScript language features, ES6+, async programming, DOM manipulation, and modern frameworks',
    Python: 'Python syntax, data structures, libraries, object-oriented programming, and Pythonic idioms',
    React: 'React components, hooks, state management, lifecycle methods, and modern React patterns',
    'Node.js': 'Node.js runtime, npm, Express.js, asynchronous programming, and backend development',
  };

  const spec = difficultySpecs[difficulty] || difficultySpecs.medium;
  const topicInfo = topicInstructions[topic] || `${topic} concepts and applications`;

  return `Generate exactly ${count} COMPLETELY UNIQUE and FRESH multiple choice questions about ${topicInfo} at ${difficulty} difficulty level.

Return ONLY a JSON array with exactly ${count} questions in this exact format:
[
  {
    "question": "Your unique question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation"
  }
]
`;
}

async function mcqQuestions(req, res) {
  const { topic = 'JavaScript', difficulty = 'medium', count = 5 } = req.body;
  const sessionId = Date.now() + Math.random().toString(36).substr(2, 9);
  if (!GEMINI_API_KEY) return res.status(500).json({ success: false, error: 'Gemini API key not configured' });
  try {
    const prompt = getTopicSpecificPrompt(topic, difficulty, count, sessionId);
    const { response } = await postWithRetries(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, { contents: [{ parts: [{ text: prompt }] }] }, { headers: { 'Content-Type': 'application/json' }, timeout: REQUEST_TIMEOUT });
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) throw new Error('No response from Gemini API');
    let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const questions = JSON.parse(cleanResponse);
    res.json({ success: true, questions, metadata: { topic, difficulty, count: questions.length, source: 'gemini-direct' } });
  } catch (error) {
    const retryAfterHeader = error.retryAfter || error.upstreamBody?.retry_after || null;
    if (retryAfterHeader) res.set('Retry-After', String(retryAfterHeader));
    const statusCode = (error.status === 429 || String(error.message || '').includes('429')) ? 429 : 500;
    res.status(statusCode).json({ success: false, error: 'Failed to generate MCQ questions', details: error.message, retryAfter: retryAfterHeader || null, upstreamBody: error.upstreamBody || null });
  }
}

async function codingProblems(req, res) {
  const { topic = 'algorithms', difficulty = 'medium', language = 'javascript' } = req.body;
  if (!GEMINI_API_KEY) return res.status(500).json({ success: false, error: 'Gemini API key not configured' });
  try {
    const prompt = `Generate one coding problem for topic ${topic} at ${difficulty} difficulty for ${language}. Return pure JSON object.`;
    const { response } = await postWithRetries(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, { contents: [{ parts: [{ text: prompt }] }] }, { headers: { 'Content-Type': 'application/json' }, timeout: REQUEST_TIMEOUT });
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) throw new Error('No response from Gemini API');
    let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const problem = JSON.parse(cleanResponse);
    res.json({ success: true, problem, metadata: { topic, difficulty, language, source: 'gemini-direct' } });
  } catch (error) {
    const retryAfterHeader = error.retryAfter || error.upstreamBody?.retry_after || null;
    if (retryAfterHeader) res.set('Retry-After', String(retryAfterHeader));
    const statusCode = (error.status === 429 || String(error.message || '').includes('429')) ? 429 : 500;
    res.status(statusCode).json({ success: false, error: 'Failed to generate coding problem', details: error.message, retryAfter: retryAfterHeader || null, upstreamBody: error.upstreamBody || null });
  }
}

async function analyzeCode(req, res) {
  const { code = '', language = 'javascript', problem = '' , errors = '' } = req.body;
  if (!GEMINI_API_KEY) return res.status(500).json({ success: false, error: 'Gemini API key not configured' });
  try {
    const analysisPrompt = `Analyze code: ${language}\n${code}`;
    const { response } = await postWithRetries(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, { contents: [{ parts: [{ text: analysisPrompt }] }] }, { headers: { 'Content-Type': 'application/json' }, timeout: REQUEST_TIMEOUT });
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) throw new Error('No response from Gemini API');
    let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleanResponse);
    res.json({ success: true, analysis, metadata: { language } });
  } catch (error) {
    const retryAfterHeader = error.retryAfter || error.upstreamBody?.retry_after || null;
    if (retryAfterHeader) res.set('Retry-After', String(retryAfterHeader));
    const statusCode = (error.status === 429 || String(error.message || '').includes('429')) ? 429 : 500;
    res.status(statusCode).json({ success: false, error: 'Failed to analyze code', details: error.message, retryAfter: retryAfterHeader || null, upstreamBody: error.upstreamBody || null });
  }
}

async function assessInterview(req, res) {
  const { userId, interviewType, topic, difficulty, duration, interviewData, userResponses, interviewQuestions } = req.body;
  if (!GEMINI_API_KEY) return res.status(500).json({ success: false, error: 'Gemini API key not configured' });
  try {
    const assessmentPrompt = `Assess interview for ${topic} at ${difficulty}`;
    const { response } = await postWithRetries(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, { contents: [{ parts: [{ text: assessmentPrompt }] }] }, { headers: { 'Content-Type': 'application/json' }, timeout: REQUEST_TIMEOUT });
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) throw new Error('No response from Gemini API');
    let cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const assessment = JSON.parse(cleanResponse);
    res.json({ success: true, assessment, sessionData: { userId, interviewType, topic, difficulty, duration, timestamp: new Date() } });
  } catch (error) {
    const retryAfterHeader = error.retryAfter || error.upstreamBody?.retry_after || null;
    if (retryAfterHeader) res.set('Retry-After', String(retryAfterHeader));
    const statusCode = (error.status === 429 || String(error.message || '').includes('429')) ? 429 : 500;
    res.status(statusCode).json({ success: false, error: 'Failed to assess interview', details: error.message, retryAfter: retryAfterHeader || null, upstreamBody: error.upstreamBody || null });
  }
}

module.exports = { mcqQuestions, codingProblems, analyzeCode, assessInterview };
