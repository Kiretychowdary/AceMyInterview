// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION
// AI Interview Controller - FLOW LOGIC (Calls HuggingFace Space)

const axios = require('axios');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

// Ollama AI Service Configuration - External GPU Server
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://172.21.1.17:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

console.log('═══════════════════════════════════════════════════════');
console.log('🤖 Ollama External GPU Configuration');
console.log('═══════════════════════════════════════════════════════');
console.log(`   🌐 External GPU Endpoint: ${OLLAMA_BASE_URL}`);
console.log(`   🧠 AI Model: ${OLLAMA_MODEL}`);
console.log(`   ⚡ All AI operations will use this endpoint`);
console.log('═══════════════════════════════════════════════════════');
console.log('');

// Multer configuration for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Extract text from PDF
async function extractPDFText(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const pdfParse = pdf.default || pdf;
    const data = await pdfParse(dataBuffer);
    // Clean up file after extraction
    await fs.unlink(filePath);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    // Clean up file on error too
    try { await fs.unlink(filePath); } catch (e) {}
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Start new interview - Get first question
 */
exports.startInterview = async (req, res) => {
  try {
    let { subject, resume } = req.body;

    // Handle PDF upload if present
    if (req.file) {
      try {
        resume = await extractPDFText(req.file.path);
      } catch (pdfError) {
        console.error('PDF processing failed, continuing without resume:', pdfError.message);
        resume = 'No resume provided. Generate general questions.';
      }
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        error: 'Subject is required'
      });
    }

    // Resume is now optional
    if (!resume) {
      resume = 'No resume provided. Generate general questions.';
    }

    // Call Ollama AI for interview question
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 START INTERVIEW REQUEST');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📚 Subject: ${subject}`);
    console.log(`🌐 External GPU Endpoint: ${OLLAMA_BASE_URL}`);
    console.log(`🤖 AI Model: ${OLLAMA_MODEL}`);
    console.log(`📡 Sending request to: ${OLLAMA_BASE_URL}/api/generate`);
    console.log('───────────────────────────────────────────────────────');
    
    const prompt = `You are a professional technical interviewer conducting a ${subject} interview.

Generate the FIRST QUESTION for a beginner-friendly ${subject} interview.

CRITICAL RULES:
1. Ask ONE specific, clear, technical question about ${subject}
2. Focus on fundamental concepts
3. Make it a basic/easy level question to start
4. Be direct and professional
5. Include specific technical terms related to ${subject}
6. MUST be a real technical question with a question mark
7. DO NOT use generic phrases like "let's begin", "let's start", "shall we"

Examples of GOOD first questions for ${subject}:
- "What is the time complexity of binary search?"
- "Can you explain the difference between a stack and a queue?"
- "How does a hash table handle collisions?"
- "What is the purpose of a linked list in data structures?"

Examples of BAD questions (DO NOT USE):
- "Let's begin with a DSA question"
- "Shall we start the interview?"
- "Tell me about yourself"

Your specific ${subject} question:`;


    console.log('📤 REQUEST SENT TO EXTERNAL GPU...');
    const startTime = Date.now();

    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.8,
          num_predict: 150,
          stop: ['\n\n', 'Question 2', 'Next:']
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    const aiResult = response.data;
    let questionText = aiResult.response?.trim() || '';
    const responseTime = Date.now() - startTime;
    
    console.log('📥 RESPONSE RECEIVED FROM EXTERNAL GPU');
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`📊 Response length: ${questionText.length} characters`);
    console.log(`🤖 AI Generated: "${questionText.substring(0, 100)}..."`);
    console.log('───────────────────────────────────────────────────────');
    
    // Clean up the question - remove any prefixes
    questionText = questionText.replace(/^(Question:|Q\d+:|Your question:|Generate your question now:|Your specific.*question:)/i, '').trim();
    
    // Strict validation - NO FALLBACK as per user request
    if (!questionText || questionText.length < 15) {
      console.error('❌ EXTERNAL GPU FAILED - Response too short');
      console.error(`❌ Endpoint: ${OLLAMA_BASE_URL}/api/generate`);
      throw new Error('External GPU failed to generate question. Check connection.');
    }
    
    // Reject generic/vague first questions - must be specific
    const genericPhrases = [
      'let\'s begin',
      'let\'s start',
      'let\'s try',
      'shall we',
      'moving on',
      'tell me about yourself',
      'introduce yourself'
    ];
    
    const questionLower = questionText.toLowerCase();
    const isGeneric = genericPhrases.some(phrase => questionLower.includes(phrase));
    
    if (isGeneric) {
      console.error('❌ AI generated generic first question');
      console.error(`❌ Question: "${questionText}"`);
      throw new Error('AI generated generic question. External GPU must provide specific technical question.');
    }
    
    // Must be a proper question (contain ? or be descriptive)
    if (!questionText.includes('?') && questionText.length < 30) {
      console.error('❌ First question too vague');
      console.error(`❌ Question: "${questionText}"`);
      throw new Error('AI question is too vague. Must be a clear, specific technical question.');
    }

    console.log('✅ SUCCESS: First question generated by external GPU');
    console.log(`📝 Question: "${questionText}"`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    return res.json({
      success: true,
      question: questionText,
      questionNumber: 1,
      difficulty: 'basic',
      subject: subject
    });

  } catch (error) {
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ START INTERVIEW FAILED');
    console.error('═══════════════════════════════════════════════════════');
    console.error('🚨 Error:', error.message);
    console.error('🌐 External GPU Endpoint:', OLLAMA_BASE_URL);
    console.error('📡 Full URL:', `${OLLAMA_BASE_URL}/api/generate`);
    console.error('💡 Possible causes:');
    console.error('   1. External GPU server is offline');
    console.error('   2. Ollama not running on 172.21.1.17:11434');
    console.error('   3. Network connectivity issues');
    console.error('   4. Firewall blocking connection');
    console.error('═══════════════════════════════════════════════════════');
    console.error('');
    return res.status(500).json({
      success: false,
      error: 'Failed to connect to external GPU server. Check Ollama service.',
      serviceUrl: OLLAMA_BASE_URL,
      fullUrl: `${OLLAMA_BASE_URL}/api/generate`,
      details: error.response?.data || error.message
    });
  }
};

/**
 * Submit answer and get next question + feedback
 * 
 * CRITICAL: NO DEFAULT SCORING
 * - All scores come from External GPU (http://172.21.1.17:11434)
 * - AI evaluates answer specifically in relation to the question asked
 * - If external GPU fails to provide score, function throws error (no fallbacks)
 * - Score is based on: correctness, completeness, depth, and relevance to question
 * 
 * Process:
 * 1. Receive: question + answer + context
 * 2. Send to External GPU: question-answer pair for evaluation
 * 3. AI analyzes: Does answer address the specific question?
 * 4. Returns: Real score (1-10) + feedback + next question
 * 5. If no score: FAIL (no default values used)
 */
exports.submitAnswer = async (req, res) => {
  try {
    const { subject, answer, questionNumber, previousQuestion, currentDifficulty } = req.body;

    if (questionNumber === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Question number is required'
      });
    }

    // Handle no answer case - give actual low score
    if (!answer || answer.trim() === '' || answer === 'No answer provided' || answer.trim().length < 3) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('⚠️  EMPTY ANSWER DETECTED');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('   Generating new question via External GPU...');
      console.log(`   🌐 Endpoint: ${OLLAMA_BASE_URL}/api/generate`);
      console.log('───────────────────────────────────────────────────────────');
      
      // Even for empty answers, generate a proper next question via AI
      const emptyAnswerPrompt = `Generate a ${currentDifficulty || 'basic'} level question about ${subject}. 
      
Ask ONE specific, clear question. Be direct and professional.

Your question:`;

      try {
        console.log('📤 Sending empty answer question request...');
        const emptyStartTime = Date.now();
        
        const aiResponse = await axios.post(
          `${OLLAMA_BASE_URL}/api/generate`,
          {
            model: OLLAMA_MODEL,
            prompt: emptyAnswerPrompt,
            stream: false,
            options: { temperature: 0.8, num_predict: 150 }
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
        );

        const emptyResponseTime = Date.now() - emptyStartTime;
        let generatedQuestion = aiResponse.data.response?.trim() || '';
        
        console.log('📥 Response received from External GPU');
        console.log(`⏱️  Response time: ${emptyResponseTime}ms`);
        console.log(`📊 Response: "${generatedQuestion}"`);
        
        generatedQuestion = generatedQuestion.replace(/^(Question:|Q\d+:|Your question:)/i, '').trim();
        
        console.log('✅ Question generated for empty answer');
        console.log(`📝 Final question: "${generatedQuestion}"`);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');

        return res.json({
          success: true,
          score: 0,
          feedback: 'Please provide a detailed response to help me assess your knowledge.',
          nextQuestion: generatedQuestion,
          difficulty: currentDifficulty || 'basic',
          questionNumber: questionNumber + 1,
          requiresCode: false
        });
      } catch (err) {
        console.error('═══════════════════════════════════════════════════════════');
        console.error('❌ FAILED to generate question for empty answer');
        console.error(`🌐 Endpoint: ${OLLAMA_BASE_URL}`);
        console.error('🚨 Error:', err.message);
        console.error('═══════════════════════════════════════════════════════════');
        console.error('');
        // NO FALLBACK - throw error if external GPU fails
        throw new Error('External GPU failed to generate question for empty answer. Cannot continue.');
      }
    }

    // Determine next difficulty based on answer quality
    let nextDifficulty = 'intermediate';
    if (questionNumber === 1) {
      nextDifficulty = 'basic'; // Start easy
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧠 ANSWER ANALYSIS REQUEST');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 Question Number: ${questionNumber}`);
    console.log(`🎯 Previous Question: "${previousQuestion?.substring(0, 60)}..."`);
    console.log(`📝 User Answer: "${answer.substring(0, 80)}..."`);
    console.log(`📈 Current Difficulty: ${currentDifficulty || 'basic'}`);
    console.log('───────────────────────────────────────────────────────');
    console.log('🔍 AI WILL EVALUATE:');
    console.log('   ✓ Does answer correctly address the SPECIFIC question?');
    console.log('   ✓ Is answer relevant to what was asked?');
    console.log('   ✓ Score based on question-answer match');
    console.log('───────────────────────────────────────────────────────');
    console.log(`🌐 External GPU Endpoint: ${OLLAMA_BASE_URL}`);
    console.log(`🤖 AI Model: ${OLLAMA_MODEL}`);
    console.log(`📡 Sending analysis request to: ${OLLAMA_BASE_URL}/api/generate`);
    console.log('───────────────────────────────────────────────────────');
    
    // Call Ollama AI for evaluation and next question
    const prompt = `You are evaluating a ${subject} interview answer.

═══════════════════════════════════════════════════════════
QUESTION ASKED TO CANDIDATE:
${previousQuestion}

CANDIDATE'S ANSWER:
${answer}
═══════════════════════════════════════════════════════════

Your Tasks:
1. EVALUATE THE ANSWER SPECIFICALLY IN RELATION TO THE QUESTION ASKED
   - Does the answer correctly address what was asked?
   - Is the answer accurate for this specific question?
   - Does it demonstrate understanding of the concept in the question?

2. SCORE the answer from 1-10 based on:
   - Correctness: Is the answer factually correct for THIS question?
   - Completeness: Does it cover the key points asked in THIS question?
   - Depth: Does it show deep understanding of what was asked?
   - Relevance: Does it directly answer THIS specific question?

3. Generate a SPECIFIC, DETAILED next question about ${subject}

4. Determine if next question needs code (Yes/No)

5. Set difficulty for next question:
   - Score 8-10: Ask ADVANCED question
   - Score 5-7: Ask INTERMEDIATE question  
   - Score 1-4: Ask BASIC question

CRITICAL EVALUATION RULES:
- Base your score ONLY on how well the answer addresses THE SPECIFIC QUESTION ASKED
- Even if the answer contains correct information, if it doesn't answer the question, score it low
- Even if the answer is brief, if it correctly answers the question, score it appropriately
- Consider context: the answer must be relevant to what was specifically asked

CRITICAL QUESTION GENERATION RULES:
- Generate a REAL, SPECIFIC question (not "let's try another question")
- Ask about SPECIFIC concepts/topics in ${subject}
- Include technical details in your question
- Make it clear and actionable
- DO NOT use phrases like: "Let's try", "Another question", "Moving on"
- MUST ask about a specific technical concept

Examples of GOOD questions:
- "What is the time complexity of quicksort in the worst case?"
- "Can you explain how a binary search tree maintains order?"
- "How does dynamic programming differ from greedy algorithms?"

Examples of BAD questions (DO NOT USE):
- "Let's try another DSA question"
- "Can you answer another question?"
- "Moving on to the next topic"

Format your response EXACTLY as:
Score: [number 1-10]
NextDifficulty: [basic/intermediate/advanced]
RequiresCode: [Yes/No]
Feedback: [brief 1-2 sentence comment]
Next Question: [Your specific, detailed question about ${subject}]`;

    console.log('📤 REQUEST SENT TO EXTERNAL GPU...');
    const analysisStartTime = Date.now();
    
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.8,
          num_predict: 400,
          stop: ['\n\nQuestion']
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    const aiResult = response.data;
    const aiResponse = aiResult.response || '';
    const analysisTime = Date.now() - analysisStartTime;
    
    console.log('📥 RESPONSE RECEIVED FROM EXTERNAL GPU');
    console.log(`⏱️  Analysis time: ${analysisTime}ms`);
    console.log(`📊 Response length: ${aiResponse.length} characters`);
    console.log('🤖 Full AI Response:');
    console.log('───────────────────────────────────────────────────────');
    console.log(aiResponse);
    console.log('───────────────────────────────────────────────────────');

    // Check if AI response is empty or invalid
    if (!aiResponse || aiResponse.trim().length < 20) {
      console.error('❌ AI response too short or empty');
      // Throw error instead of using fallback
      throw new Error('AI generated insufficient response. Please try again.');
    }

    // Parse AI response - NO DEFAULT SCORES
    let score = null;
    let feedback = null;
    let nextQuestion = null;
    let requiresCode = false;
    let aiDeterminedDifficulty = nextDifficulty;

    // Extract score
    const scoreMatch = aiResponse.match(/Score:\s*(\d+)/i);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1]);
      score = Math.min(10, Math.max(1, score)); // Clamp between 1-10
    }

    // Extract AI-determined difficulty
    const difficultyMatch = aiResponse.match(/NextDifficulty:\s*(basic|intermediate|advanced)/i);
    if (difficultyMatch) {
      aiDeterminedDifficulty = difficultyMatch[1].toLowerCase();
    }

    // Extract if code is required
    const codeMatch = aiResponse.match(/RequiresCode:\s*(Yes|No)/i);
    if (codeMatch) {
      requiresCode = codeMatch[1].toLowerCase() === 'yes';
    }

    // Extract feedback
    const feedbackMatch = aiResponse.match(/Feedback:\s*([^\n]+)/i);
    if (feedbackMatch) {
      feedback = feedbackMatch[1].trim();
    }

    // Extract next question
    const questionMatch = aiResponse.match(/Next Question:\s*([\s\S]+?)$/i);
    if (questionMatch) {
      nextQuestion = questionMatch[1].trim();
      // Clean up any trailing markers
      nextQuestion = nextQuestion.split('\n\n')[0].trim();
      // Remove common prefixes
      nextQuestion = nextQuestion.replace(/^(Question:|Q\d+:|Next Question:|Your question:)/i, '').trim();
    }
    
    console.log('✅ EXTERNAL GPU ANALYSIS COMPLETE');
    console.log('───────────────────────────────────────────────────────');
    console.log('📊 AI Evaluation Results (Question-Answer Analysis):');
    console.log(`   ✓ Score: ${score}/10 (based on how answer addresses the specific question)`);
    console.log(`   ✓ Question Relevance: Evaluated`);
    console.log(`   ✓ Answer Accuracy: Evaluated`);
    console.log(`   • AI Feedback: "${feedback}"`);
    console.log(`   • Next Difficulty: ${aiDeterminedDifficulty}`);
    console.log(`   • Requires Code: ${requiresCode}`);
    console.log(`   • Next Question: "${nextQuestion?.substring(0, 80)}..."`);
    console.log('───────────────────────────────────────────────────────');
    console.log('🧠 AI Analysis Summary:');
    console.log(`   Question Asked: "${previousQuestion?.substring(0, 50)}..."`);
    console.log(`   Answer Quality: ${score}/10 (evaluated against THIS specific question)`);
    console.log(`   Next Difficulty: ${aiDeterminedDifficulty}`);
    console.log(`   Next Question: Generated based on ${score >= 8 ? 'EXCELLENT' : score >= 5 ? 'GOOD' : 'BASIC'} performance`);
    console.log('───────────────────────────────────────────────────────');
    console.log(`✅ All analysis performed by External GPU: ${OLLAMA_BASE_URL}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    // ═══════════════════════════════════════════════════════════════════
    // STRICT VALIDATION - NO DEFAULT FALLBACKS
    // ═══════════════════════════════════════════════════════════════════
    // Score MUST come from External GPU analysis of question-answer pair
    // If External GPU fails to provide valid data, we THROW ERROR
    // NO default scores (like 5, 7, etc.) are used - all scores are real
    // ═══════════════════════════════════════════════════════════════════
    
    if (score === null || score === undefined) {
      console.error('❌ VALIDATION FAILED: No score from External GPU');
      console.error('❌ Expected: Real score (1-10) based on question-answer evaluation');
      console.error('❌ Received: null/undefined');
      throw new Error('External GPU did not provide score. Cannot use default values.');
    }
    
    if (!feedback || feedback.trim().length < 5) {
      console.error('❌ VALIDATION FAILED: No feedback from External GPU');
      throw new Error('External GPU did not provide valid feedback.');
    }
    
    if (!nextQuestion || nextQuestion.trim().length < 10) {
      console.error('❌ VALIDATION FAILED: No next question from External GPU');
      throw new Error('External GPU did not provide valid next question.');
    }
    
    // Reject generic/vague questions - must be specific
    const genericPhrases = [
      'let\'s try another',
      'let\'s try',
      'another question',
      'next question',
      'moving on',
      'let us try',
      'try another'
    ];
    
    const questionLower = nextQuestion.toLowerCase();
    const isGeneric = genericPhrases.some(phrase => questionLower.includes(phrase));
    
    if (isGeneric) {
      console.error('❌ AI generated generic question instead of specific question');
      console.error(`❌ Question: "${nextQuestion}"`);
      throw new Error('AI generated generic question. External GPU must provide specific technical questions.');
    }
    
    // Question must contain a question mark or be descriptive enough
    if (!nextQuestion.includes('?') && nextQuestion.length < 30) {
      console.error('❌ Question too vague - must be specific');
      console.error(`❌ Question: "${nextQuestion}"`);
      throw new Error('AI question is too vague. Must be a clear, specific technical question.');
    }

    console.log('✅ All validations passed. Sending response to frontend.');
    console.log('');
    console.log('📤 RESPONSE SUMMARY:');
    console.log(`   ✓ Score: ${score}/10 (REAL score from External GPU, NO defaults)`);
    console.log(`   ✓ Feedback: "${feedback}"`);
    console.log(`   ✓ Next Question: Specific technical question generated`);
    console.log(`   ✓ All data from: ${OLLAMA_BASE_URL}`);
    console.log('');

    return res.json({
      success: true,
      score: score,
      feedback: feedback,
      nextQuestion: nextQuestion,
      questionNumber: questionNumber + 1,
      difficulty: aiDeterminedDifficulty,
      requiresCode: requiresCode
    });

  } catch (error) {
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ ANSWER ANALYSIS FAILED');
    console.error('═══════════════════════════════════════════════════════');
    console.error('🚨 Error:', error.message);
    console.error('🌐 External GPU Endpoint:', OLLAMA_BASE_URL);
    console.error('📡 Full URL:', `${OLLAMA_BASE_URL}/api/generate`);
    console.error('💡 Possible causes:');
    console.error('   1. External GPU server stopped responding');
    console.error('   2. Ollama service crashed on 172.21.1.17');
    console.error('   3. Network timeout or connection lost');
    console.error('   4. Model llama3.2:1b not loaded');
    console.error('═══════════════════════════════════════════════════════');
    console.error('');
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze answer on external GPU',
      serviceUrl: OLLAMA_BASE_URL,
      fullUrl: `${OLLAMA_BASE_URL}/api/generate`,
      message: error.message
    });
  }
};

/**
 * End interview - Get final report
 */
exports.endInterview = async (req, res) => {
  try {
    const { answers, totalQuestions } = req.body;

    // Calculate overall score
    const totalScore = answers.reduce((sum, a) => sum + (a.score || 0), 0);
    const averageScore = totalScore / totalQuestions;

    return res.json({
      success: true,
      report: {
        totalQuestions,
        answeredQuestions: answers.length,
        averageScore: averageScore.toFixed(1),
        totalScore,
        answers: answers,
        feedback: averageScore >= 7 ? "Excellent performance!" : 
                  averageScore >= 5 ? "Good job, room for improvement" : 
                  "Keep practicing!",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('End Interview Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
};

/**
 * Check if Ollama is available
 */
exports.checkHealth = async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
      timeout: 5000
    });

    return res.json({
      success: true,
      status: 'healthy',
      ollamaUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      availableModels: response.data.models?.map(m => m.name) || [],
      message: 'Ollama AI is running on external GPU server'
    });

  } catch (error) {
    return res.json({
      success: false,
      status: 'unavailable',
      ollamaUrl: OLLAMA_BASE_URL,
      message: 'Ollama not responding. Check external GPU server connection.',
      error: error.message
    });
  }
};

// Export multer upload middleware
exports.uploadPDF = upload.single('resume');
