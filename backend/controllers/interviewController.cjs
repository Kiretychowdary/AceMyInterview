// Complete AI Interview Controller with Ollama
// Handles full interview lifecycle: question generation, answer evaluation, transcript saving
const InterviewTranscript = require('../models/InterviewTranscript.cjs');
const ollamaService = require('../services/ollamaService.cjs');

const USE_OLLAMA = process.env.USE_OLLAMA === 'true';

/**
 * Generate AI response using Ollama
 */
async function generateWithOllama(prompt, options = {}) {
  if (!USE_OLLAMA) {
    throw new Error('Ollama is not enabled. Set USE_OLLAMA=true in .env');
  }
  
  console.log('🚀 Generating with Ollama (GPU)...');
  const response = await ollamaService.generateCompletion(prompt, options);
  return response;
}

/**
 * START INTERVIEW - Create new interview session
 * POST /api/interview/start
 */
exports.startInterview = async (req, res) => {
  try {
    const { userId, role, difficulty, topic, totalQuestions = 5 } = req.body;

    // Validation
    if (!userId || !role || !difficulty) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: userId, role, difficulty'
      });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty must be: easy, medium, or hard'
      });
    }

    // Create new interview transcript
    const sessionId = `interview_${Date.now()}_${userId}`;
    const transcript = new InterviewTranscript({
      sessionId,
      userId,
      role,
      difficulty,
      topic: topic || role,
      totalQuestions,
      startTime: new Date(),
      aiModel: ollamaService.OLLAMA_MODEL,
      aiSource: 'ollama-gpu'
    });

    await transcript.save();

    console.log(`✅ Interview started: ${sessionId}`);
    console.log(`   Role: ${role}, Difficulty: ${difficulty}, Questions: ${totalQuestions}`);

    return res.json({
      success: true,
      sessionId,
      message: 'Interview session created',
      config: {
        role,
        difficulty,
        topic,
        totalQuestions
      }
    });

  } catch (error) {
    console.error('Error starting interview:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to start interview',
      message: error.message
    });
  }
};

/**
 * GET NEXT QUESTION - Generate next interview question dynamically
 * POST /api/interview/next-question
 */
exports.getNextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required'
      });
    }

    // Get interview transcript
    const transcript = await InterviewTranscript.findOne({ sessionId });
    if (!transcript) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }

    if (transcript.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        error: `Interview is ${transcript.status}`,
        completed: true
      });
    }

    const currentQuestionNumber = transcript.questionsAndAnswers.length + 1;

    // Check if interview is complete
    if (currentQuestionNumber > transcript.totalQuestions) {
      return res.json({
        success: true,
        completed: true,
        message: 'All questions answered. Ready for final report.'
      });
    }

    // Build context from previous questions
    const previousQA = transcript.questionsAndAnswers.map((qa, idx) => 
      `Q${idx + 1} (${qa.question.category}): ${qa.question.text}\nAnswer: ${qa.userAnswer.text}`
    ).join('\n\n');

    const contextNote = previousQA.length > 0 
      ? `\nPrevious questions asked:\n${previousQA}\n\nAvoid repeating similar questions.` 
      : '';

    // CRITICAL: Use user's selected topic as the category to prevent random categorization
    const selectedCategory = transcript.topic || 'General';
    
    // Generate next question using Ollama
    const prompt = `You are conducting a ${transcript.difficulty} level interview for a ${transcript.role} position focusing on ${selectedCategory}.

This is question ${currentQuestionNumber} of ${transcript.totalQuestions}.${contextNote}

Generate ONE interview question that:
- Is appropriate for ${transcript.difficulty} level (easy = fundamental concepts, medium = practical application, hard = advanced problem-solving)
- Is relevant to ${transcript.role} role
- Specifically covers ${selectedCategory} topics ONLY
- Tests different aspects than previous questions
- Is clear and professional
- Has 3-5 expected key points for a good answer
- Determine if this question requires CODE/PROGRAMMING (compilerRequired: true/false)

IMPORTANT: The category MUST be "${selectedCategory}" exactly - do not use any other category name.

Provide your response ONLY as JSON in this exact format:
{
  "question": "The interview question text",
  "category": "${selectedCategory}",
  "expectedPoints": ["key point 1", "key point 2", "key point 3"],
  "compilerRequired": true or false
}

Return ONLY the JSON object, no markdown formatting, no extra text.`;

    const responseText = await generateWithOllama(prompt, {
      temperature: 0.8,
      maxTokens: 1000,
      format: 'json' // Force JSON format
    });

    console.log('🔍 Raw Ollama Response:', responseText.substring(0, 500));

    // Parse response with error handling
    let questionData;
    try {
      questionData = ollamaService.parseJsonResponse(responseText);
      
      // OVERRIDE: Force category to match user's selected topic, regardless of what AI returns
      const selectedCategory = transcript.topic || 'General';
      questionData.category = selectedCategory;
      
      console.log('📝 Parsed Question Data:', JSON.stringify(questionData, null, 2));
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.error('Full response was:', responseText);
      
      // Try fallback: extract question manually if possible
      try {
        const questionMatch = responseText.match(/"question"\s*:\s*"([^"]+)"/);
        const categoryMatch = responseText.match(/"category"\s*:\s*"([^"]+)"/);
        const pointsMatch = responseText.match(/"expectedPoints"\s*:\s*\[(.*?)\]/s);
        
        if (questionMatch && categoryMatch) {
          console.log('⚠️ Using manual extraction fallback');
          const selectedCategory = transcript.topic || 'General';
          questionData = {
            question: questionMatch[1],
            category: selectedCategory, // Use selected topic, not AI's category
            expectedPoints: pointsMatch ? 
              JSON.parse(`[${pointsMatch[1]}]`) : 
              ["Key concepts", "Practical application", "Clear explanation"]
          };
          console.log('✅ Manually extracted question data');
        } else {
          throw new Error('Could not extract question from malformed response');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback extraction also failed:', fallbackError.message);
        throw new Error('Invalid question format from AI - could not parse or extract');
      }
    }
    
    if (!questionData || !questionData.question || !questionData.category || !questionData.expectedPoints) {
      console.error('❌ Invalid question format. Response was:', responseText);
      throw new Error('Invalid question format from AI');
    }

    // Add question to transcript (without user answer initially)
    transcript.questionsAndAnswers.push({
      questionNumber: currentQuestionNumber,
      question: {
        text: questionData.question,
        category: questionData.category,
        expectedPoints: questionData.expectedPoints,
        compilerRequired: questionData.compilerRequired || false
      },
      userAnswer: {
        text: '',
        code: null,
        compilerUsed: false,
        timestamp: null,
        timeSpent: null
      },
      evaluation: {}
    });
    
    await transcript.save();

    console.log(`✅ Generated question ${currentQuestionNumber}/${transcript.totalQuestions}`);
    console.log(`   Category: ${questionData.category}`);
    console.log(`   Compiler Required: ${questionData.compilerRequired || false}`);

    return res.json({
      success: true,
      question: {
        number: currentQuestionNumber,
        total: transcript.totalQuestions,
        text: questionData.question,
        category: questionData.category,
        compilerRequired: questionData.compilerRequired || false
      },
      progress: {
        current: currentQuestionNumber,
        total: transcript.totalQuestions,
        percentage: Math.floor((currentQuestionNumber / transcript.totalQuestions) * 100)
      }
    });

  } catch (error) {
    console.error('Error generating next question:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate question',
      message: error.message
    });
  }
};

/**
 * SUBMIT ANSWER - Submit and evaluate user's answer
 * POST /api/interview/submit-answer
 */
exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionNumber, answer, timeSpent, code, compilerUsed } = req.body;

    if (!sessionId || !questionNumber || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: sessionId, questionNumber, answer'
      });
    }

    console.log('═════════════════════════════════════════════════════════');
    console.log('📥 RECEIVED ANSWER SUBMISSION');
    console.log('═════════════════════════════════════════════════════════');
    console.log('📝 Session ID:', sessionId);
    console.log('🔢 Question Number:', questionNumber);
    console.log('💬 Answer Length:', answer.length, 'characters');
    console.log('💻 Code Included:', code ? '✅ YES (' + code.length + ' chars)' : '❌ NO');
    console.log('⚙️ Compiler Used:', compilerUsed ? '✅ YES' : '❌ NO');
    console.log('═════════════════════════════════════════════════════════');

    // Get interview transcript
    const transcript = await InterviewTranscript.findOne({ sessionId });
    if (!transcript) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }

    const qa = transcript.questionsAndAnswers[questionNumber - 1];
    if (!qa) {
      return res.status(404).json({
        success: false,
        error: `Question ${questionNumber} not found`
      });
    }

    // Update user answer
    qa.userAnswer.text = answer;
    qa.userAnswer.timestamp = new Date();
    qa.userAnswer.timeSpent = timeSpent || 0;
    
    // Store code if provided
    if (code) {
      qa.userAnswer.code = code;
      qa.userAnswer.compilerUsed = compilerUsed;
    }

    // Evaluate answer using Ollama - compare against expected points
    const expectedPointsText = qa.question.expectedPoints && qa.question.expectedPoints.length > 0
      ? `\n\nExpected Key Points for a Good Answer:\n${qa.question.expectedPoints.map((point, idx) => `${idx + 1}. ${point}`).join('\n')}`
      : '';

    // Add code section if provided
    const codeSection = code ? `

══════════════════════════════════════════════════════════
CANDIDATE'S CODE SOLUTION:
\`\`\`
${code}
\`\`\`
══════════════════════════════════════════════════════════` : '';

    const codeEvaluationSteps = code ? `

══════════════════════════════════════════════════════════
📋 CODE EVALUATION (STEP-BY-STEP ANALYSIS)
══════════════════════════════════════════════════════════

CODE STEP 1: Syntax & Basic Structure Check
→ Does the code have valid syntax?
→ Are there any obvious syntax errors?
→ Is it actual code or just comments/placeholder text?
→ If invalid/placeholder: score -3, add to improvements: "Code has syntax errors" or "No actual code implementation provided"

CODE STEP 2: Algorithm/Logic Correctness  
→ Does the code solve the problem asked in the question?
→ Is the algorithm/approach correct?
→ Does it produce the right output for the problem?
→ If wrong algorithm: score -4, isCorrect = "INCORRECT", feedback: "Code does not solve the problem correctly"
→ If partially correct: score -2, isCorrect = "PARTIALLY_CORRECT"
→ If correct: Continue to next step

CODE STEP 3: Edge Cases & Robustness
→ Does the code handle edge cases? (empty input, null, boundary values)
→ Will it crash or fail on unexpected input?
→ Missing edge case handling: score -1
→ Good handling: Add to strengths: "Handles edge cases well"

CODE STEP 4: Code Quality & Readability
→ Is the code readable and well-structured?
→ Are variable names meaningful?
→ Is it efficient (time/space complexity)?
→ Poor quality: score -1, add to improvements: "Improve code readability and structure"
→ Good quality: Add bonus +1 to score, add to strengths: "Clean, readable code"

CODE STEP 5: Does Code Match the Explanation?
→ Does the written answer explain what the code does?
→ Are they consistent?
→ If mismatch: score -1, add to improvements: "Code and explanation don't match"

CODE FINAL SCORE ADJUSTMENT:
- Start with text answer score (0-10)
- Apply code adjustments from steps above
- If code is completely wrong: Maximum score = 3 (even if text is good)
- If code is partially working: Maximum score = 6
- If code is correct but poor quality: score = 7-8
- If code is correct and high quality: score = 9-10
- Return codeQuality field: "EXCELLENT" | "GOOD" | "NEEDS_IMPROVEMENT" | "INCORRECT"

══════════════════════════════════════════════════════════` : '';

    const evaluationPrompt = `You are a STRICT technical interviewer evaluating a coding interview. Your job is to verify if the candidate's answer${code ? ' AND CODE' : ''} ACTUALLY ANSWERS THE QUESTION.

══════════════════════════════════════════════════════════
QUESTION ASKED:
"${qa.question.text}"

CATEGORY: ${qa.question.category}${expectedPointsText}
══════════════════════════════════════════════════════════

CANDIDATE'S ANSWER:
"${answer}"${codeSection}${codeEvaluationSteps}

══════════════════════════════════════════════════════════

STEP-BY-STEP VERIFICATION:

STEP 1: Is this the SAME TEXT as the question?
→ Compare the answer word-by-word with the question
→ If 80%+ similar: score = 0, isCorrect = "INCORRECT"
→ Feedback: "You just repeated the question instead of answering it"

STEP 2: Is this GIBBERISH or meaningless text?
→ Check if it's random characters, nonsense words, or extremely short
→ If YES: score = 0, isCorrect = "INCORRECT"  
→ Feedback: "This is not a meaningful answer"

STEP 3: Does this answer RELATE to the question topic?
→ Question is about: ${qa.question.category}
→ Does the answer discuss this topic? YES or NO
→ If NO: score = 0-2, isCorrect = "INCORRECT"
→ Feedback: "Your answer does not address the question asked"

STEP 4: Does this answer DIRECTLY ADDRESS what was asked?
→ Read the question carefully - what is being asked?
→ Does the answer provide that information?
→ If NO: score = 2-4, isCorrect = "INCORRECT"
→ If SOMEWHAT: score = 5-6, isCorrect = "PARTIALLY_CORRECT"  
→ If YES: Continue to Step 5

STEP 5: Is the information TECHNICALLY CORRECT?
→ Check for factual errors, wrong concepts, misconceptions
→ Major errors: Deduct 3-4 points, isCorrect = "INCORRECT"
→ Minor errors: Deduct 1-2 points, keep isCorrect = "PARTIALLY_CORRECT"
→ Mostly correct: isCorrect = "CORRECT"

STEP 6: How COMPLETE is the answer?
→ Does it cover the key points needed?
→ Missing most points: score = 5-6
→ Covers main points: score = 7-8
→ Comprehensive: score = 9-10

══════════════════════════════════════════════════════════

FINAL SCORING RULES (BE STRICT):
- 0-1: Same as question, gibberish, or totally wrong topic
- 2-3: Wrong or doesn't address the question
- 4-5: Barely addresses question with major gaps  
- 6: Addresses question but incomplete/errors
- 7: Correct but missing details
- 8: Good, correct, covers most points
- 9-10: Excellent, comprehensive answer${code ? ' with working code' : ''}

YOU MUST RETURN VALID JSON:
{
  "score": <0-10>,
  "isCorrect": "<CORRECT|PARTIALLY_CORRECT|INCORRECT>",
  "strengths": ["what was good in answer${code ? ' and code' : ''}"],
  "improvements": ["what needs fixing in answer${code ? ' and code' : ''}"],
  "feedback": "why you gave this score - mention both answer and code quality",
  ${code ? '"codeQuality": "<EXCELLENT|GOOD|NEEDS_IMPROVEMENT|INCORRECT>",' : ''}
  ${code ? '"codeAnalysis": "detailed analysis of the code: what works, what doesn\'t, algorithm correctness, edge cases, efficiency"' : ''}
}`;

    let evaluation;
    try {
      const startTime = Date.now();
      const evaluationText = await generateWithOllama(evaluationPrompt, {
        temperature: 0.1, // Very low for strict, consistent evaluation
        maxTokens: 1500, 
        format: 'json' // Force JSON format
      });
      const evaluationTime = Date.now() - startTime;
      
      evaluation = ollamaService.parseJsonResponse(evaluationText);
      
    } catch (jsonError) {
      
      // Fallback: try again without format enforcement
      try {
        const retryText = await generateWithOllama(evaluationPrompt, {
          temperature: 0.3,
          maxTokens: 800
        });
        
        evaluation = ollamaService.parsePlainTextToJson(retryText, 'evaluation');
        
      } catch (retryError) {
        evaluation = {
          score: 2,
          strengths: ['Response was provided'],
          improvements: ['Answer format was invalid - please provide clear, structured responses', 'Address the question directly with technical details'],
          feedback: 'Unable to properly evaluate your answer due to formatting issues. Please provide clearer, more structured responses.'
        };
      }
    }

    // Validate evaluation has required fields
    if (typeof evaluation.score === 'undefined' || !evaluation.feedback) {
      throw new Error('Invalid evaluation response - missing score or feedback');
    }

    // Trust Ollama AI's evaluation - it has verified the answer correctness

    // Add evaluation to transcript
    qa.evaluation = {
      score: evaluation.score,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      feedback: evaluation.feedback,
      codeQuality: evaluation.codeQuality || null, // Only if code was provided
      codeAnalysis: evaluation.codeAnalysis || null, // Detailed code analysis
      evaluatedAt: new Date()
    };

    await transcript.save();

    console.log('═════════════════════════════════════════════════════════');
    console.log('✅ EVALUATION COMPLETED BY OLLAMA AI');
    console.log('═════════════════════════════════════════════════════════');
    console.log('📊 Score:', evaluation.score, '/ 10');
    console.log('✓ Is Correct:', evaluation.isCorrect || 'N/A');
    if (evaluation.codeQuality) {
      console.log('💻 Code Quality:', evaluation.codeQuality);
    }
    console.log('💪 Strengths:', evaluation.strengths?.length || 0, 'points');
    console.log('📈 Improvements:', evaluation.improvements?.length || 0, 'points');
    console.log('═════════════════════════════════════════════════════════');

    return res.json({
      success: true,
      question: qa.question.text,
      userAnswer: answer,
      code: code || null,
      evaluation: {
        score: evaluation.score,
        maxScore: 10,
        isCorrect: evaluation.isCorrect || (evaluation.score >= 6 ? 'CORRECT' : evaluation.score >= 4 ? 'PARTIALLY_CORRECT' : 'INCORRECT'),
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        feedback: evaluation.feedback,
        codeQuality: evaluation.codeQuality || null,
        codeAnalysis: evaluation.codeAnalysis || null
      },
      progress: {
        answered: questionNumber,
        remaining: transcript.totalQuestions - questionNumber
      }
    });

  } catch (error) {
    console.error('❌ Error evaluating answer:', error.message);
    console.error('   Session ID:', req.body?.sessionId);
    console.error('   Question Number:', req.body?.questionNumber);
    return res.status(500).json({
      success: false,
      error: 'Failed to evaluate answer',
      message: error.message
    });
  }
};

/**
 * Calculate category breakdown from transcript
 * @param {Object} transcript - Interview transcript
 * @returns {Object} Category breakdown as object with category names as keys
 */
function calculateCategoryBreakdown(transcript) {
  const categories = {};
  
  transcript.questionsAndAnswers.forEach(qa => {
    const category = qa.question?.category || 'General';
    const score = qa.evaluation?.score || 0;
    
    if (!categories[category]) {
      categories[category] = { scores: [], count: 0 };
    }
    
    // Only add valid scores
    if (!isNaN(score)) {
      categories[category].scores.push(score);
      categories[category].count++;
    }
  });
  
  // Return as object with category names as keys and average scores as values
  const breakdown = {};
  Object.entries(categories).forEach(([category, data]) => {
    if (data.count > 0) {
      const avg = data.scores.reduce((sum, score) => sum + score, 0) / data.count;
      breakdown[category] = parseFloat(avg.toFixed(1));
    } else {
      breakdown[category] = 0;
    }
  });
  
  return breakdown;
}

/**
 * GET FINAL REPORT - Generate complete interview report
 * POST /api/interview/final-report
 */
exports.getFinalReport = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required'
      });
    }

    // Get interview transcript
    const transcript = await InterviewTranscript.findOne({ sessionId });
    if (!transcript) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }

    // CRITICAL: Validate that interview has questions and answers
    if (!transcript.questionsAndAnswers || transcript.questionsAndAnswers.length === 0) {
      console.error('❌ ERROR: No questions/answers in transcript for session:', sessionId);
      return res.status(400).json({
        success: false,
        error: 'No questions answered in this interview session',
        progress: {
          answered: 0,
          total: transcript.totalQuestions
        }
      });
    }

    if (transcript.questionsAndAnswers.length < transcript.totalQuestions) {
      return res.status(400).json({
        success: false,
        error: 'Interview not complete. Answer all questions first.',
        progress: {
          answered: transcript.questionsAndAnswers.length,
          total: transcript.totalQuestions
        }
      });
    }

    // Build concise summary of interview for Ollama
    const qasSummary = transcript.questionsAndAnswers.map((qa, idx) => 
      `Q${idx + 1} (${qa.question.category}): Score ${qa.evaluation.score}/10 - ${qa.evaluation.feedback}`
    ).join('\n');

    // Pre-calculate scores with validation
    const totalScore = transcript.questionsAndAnswers.reduce((sum, qa) => {
      const score = qa.evaluation?.score || 0;
      return sum + (isNaN(score) ? 0 : score);
    }, 0);
    
    const count = transcript.questionsAndAnswers.length;
    const avgScore = count > 0 ? (totalScore / count).toFixed(1) : '0.0';
    const categoryBreakdown = calculateCategoryBreakdown(transcript);

    // Generate final report using Ollama - ask only for qualitative analysis
    const reportPrompt = `You are an expert interview evaluator. Based on this ${transcript.role} interview performance at ${transcript.difficulty} level, provide qualitative feedback.

PERFORMANCE SUMMARY:
${qasSummary}

Overall Average Score: ${avgScore}/10
Category Scores: ${Object.entries(categoryBreakdown).map(([cat, score]) => `${cat}: ${score}/10`).join(', ')}

Based on the scores and feedback above, generate a JSON response with qualitative insights:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasForImprovement": ["improvement area 1", "improvement area 2", "improvement area 3"], 
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "detailedAnalysis": "2-3 paragraph assessment of technical competency, communication, problem-solving, and interview readiness",
  "summary": "One sentence overall impression"
}

Return ONLY valid JSON, no markdown, no code blocks.`;

    console.log('📝 Sending prompt to Ollama for final report...');
    const reportText = await generateWithOllama(reportPrompt, {
      temperature: 0.6,
      maxTokens: 5000,
      format: 'json' // Force JSON format like answer evaluation
    });

    console.log('📥 Received response from Ollama (length:', reportText.length, 'chars)');
    console.log('🔍 First 500 chars:', reportText.substring(0, 500));
    console.log('🔍 Last 500 chars:', reportText.substring(Math.max(0, reportText.length - 500)));

    const report = ollamaService.parseJsonResponse(reportText);

    // Combine pre-calculated scores with Ollama's qualitative analysis
    const overallScoreNum = parseFloat(avgScore);
    
    // Validate overallScore
    if (isNaN(overallScoreNum)) {
      console.error('❌ Invalid overallScore calculated:', avgScore);
      throw new Error('Failed to calculate valid overall score');
    }
    
    // Convert categoryBreakdown object to array format for model
    const breakdownArray = Object.entries(categoryBreakdown).map(([category, score]) => ({
      category,
      score,
      questionsCount: transcript.questionsAndAnswers.filter(qa => qa.question.category === category).length
    }));
    
    const finalReport = {
      overallScore: overallScoreNum,
      breakdown: breakdownArray,
      categoryBreakdown: categoryBreakdown,
      strengths: report.strengths || [],
      areasForImprovement: report.areasForImprovement || [],
      recommendations: report.recommendations || [],
      detailedAnalysis: report.detailedAnalysis || '',
      summary: report.summary || ''
    };

    // Complete the interview transcript
    await transcript.complete(finalReport);

    console.log(`✅ Interview completed: ${sessionId}`);
    console.log(`   Overall Score: ${finalReport.overallScore}/10`);

    return res.json({
      success: true,
      sessionId,
      report: {
        overallScore: finalReport.overallScore,
        maxScore: 10,
        categoryBreakdown: finalReport.categoryBreakdown,
        strengths: finalReport.strengths,
        areasForImprovement: finalReport.areasForImprovement,
        recommendations: finalReport.recommendations,
        detailedAnalysis: finalReport.detailedAnalysis,
        summary: finalReport.summary
      },
      interviewDetails: {
        role: transcript.role,
        difficulty: transcript.difficulty,
        totalQuestions: transcript.totalQuestions,
        duration: transcript.totalDuration,
        completedAt: transcript.endTime
      },
      source: 'ollama-gpu'
    });

  } catch (error) {
    console.error('❌ Error generating final report:', error.message);
    console.error('   Error stack:', error.stack);
    
    // Try to find the interview session for debugging
    const { sessionId } = req.body;
    if (sessionId) {
      try {
        const transcript = await InterviewTranscript.findOne({ sessionId });
        if (transcript) {
          console.error('   Session found:', sessionId);
          console.error('   Questions answered:', transcript.questionsAndAnswers.length, '/', transcript.totalQuestions);
        }
      } catch (dbError) {
        console.error('   Could not retrieve session for debugging');
      }
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate report',
      message: error.message,
      details: {
        sessionId: req.body?.sessionId,
        errorType: error.name
      }
    });
  }
};

/**
 * GET TRANSCRIPT - Retrieve full interview transcript
 * GET /api/interview/transcript/:sessionId
 */
exports.getTranscript = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const transcript = await InterviewTranscript.findOne({ sessionId });
    if (!transcript) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }

    return res.json({
      success: true,
      transcript: {
        sessionId: transcript.sessionId,
        userId: transcript.userId,
        role: transcript.role,
        difficulty: transcript.difficulty,
        topic: transcript.topic,
        status: transcript.status,
        startTime: transcript.startTime,
        endTime: transcript.endTime,
        totalDuration: transcript.totalDuration,
        questionsAndAnswers: transcript.questionsAndAnswers,
        overallScore: transcript.overallScore,
        categoryBreakdown: transcript.categoryBreakdown,
        strengths: transcript.strengths,
        improvements: transcript.improvements,
        recommendations: transcript.recommendations,
        summary: transcript.summary,
        aiModel: transcript.aiModel,
        aiSource: transcript.aiSource
      }
    });

  } catch (error) {
    console.error('Error retrieving transcript:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve transcript',
      message: error.message
    });
  }
};

/**
 * GET USER INTERVIEWS - Get all interviews for a user
 * GET /api/interview/user/:userId
 */
exports.getUserInterviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 20 } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const interviews = await InterviewTranscript.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-questionsAndAnswers'); // Exclude detailed Q&A for list view

    return res.json({
      success: true,
      count: interviews.length,
      interviews: interviews.map(i => ({
        sessionId: i.sessionId,
        role: i.role,
        difficulty: i.difficulty,
        topic: i.topic,
        status: i.status,
        totalQuestions: i.totalQuestions,
        overallScore: i.overallScore,
        startTime: i.startTime,
        endTime: i.endTime,
        duration: i.totalDuration,
        createdAt: i.createdAt
      }))
    });

  } catch (error) {
    console.error('Error retrieving user interviews:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve interviews',
      message: error.message
    });
  }
};

module.exports = exports;
