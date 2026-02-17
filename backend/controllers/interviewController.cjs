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

    // Generate next question using Ollama
    const prompt = `You are conducting a ${transcript.difficulty} level interview for a ${transcript.role} position${transcript.topic ? ` focusing on ${transcript.topic}` : ''}.

This is question ${currentQuestionNumber} of ${transcript.totalQuestions}.${contextNote}

Generate ONE interview question that:
- Is appropriate for ${transcript.difficulty} level (easy = fundamental concepts, medium = practical application, hard = advanced problem-solving)
- Is relevant to ${transcript.role} role
- Tests different aspects than previous questions
- Is clear and professional
- Has 3-5 expected key points for a good answer

Provide your response ONLY as JSON in this exact format:
{
  "question": "The interview question text",
  "category": "Category name (e.g., Technical, Behavioral, Problem-Solving, System Design, etc.)",
  "expectedPoints": ["key point 1", "key point 2", "key point 3"]
}

Return ONLY the JSON object, no markdown formatting, no extra text.`;

    const responseText = await generateWithOllama(prompt, {
      temperature: 0.8,
      maxTokens: 1000
    });

    console.log('🔍 Raw Ollama Response:', responseText.substring(0, 500));

    // Parse response
    const questionData = ollamaService.parseJsonResponse(responseText);

    console.log('📝 Parsed Question Data:', JSON.stringify(questionData, null, 2));

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
        expectedPoints: questionData.expectedPoints
      },
      userAnswer: {
        text: '',
        timestamp: null,
        timeSpent: null
      },
      evaluation: {}
    });
    
    await transcript.save();

    console.log(`✅ Generated question ${currentQuestionNumber}/${transcript.totalQuestions}`);
    console.log(`   Category: ${questionData.category}`);

    return res.json({
      success: true,
      question: {
        number: currentQuestionNumber,
        total: transcript.totalQuestions,
        text: questionData.question,
        category: questionData.category
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
    const { sessionId, questionNumber, answer, timeSpent } = req.body;

    if (!sessionId || !questionNumber || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: sessionId, questionNumber, answer'
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

    // Evaluate answer using Ollama - compare against expected points
    const expectedPointsText = qa.question.expectedPoints && qa.question.expectedPoints.length > 0
      ? `\n\nExpected Key Points for a Good Answer:\n${qa.question.expectedPoints.map((point, idx) => `${idx + 1}. ${point}`).join('\n')}`
      : '';

    const evaluationPrompt = `You are an expert interviewer. Evaluate this interview answer and determine if it is correct.

Question: ${qa.question.text}
Category: ${qa.question.category}${expectedPointsText}

Candidate's Answer: ${answer}

Evaluate the answer based on:
1. Correctness - Does it answer the question accurately?
2. Completeness - Does it cover the expected key points?
3. Technical Accuracy - Are the concepts and solutions correct?
4. Clarity - Is the explanation clear and well-structured?

Score 0-10:
- 0-2: Incorrect, off-topic, or no meaningful content
- 3-4: Partially correct but missing major points
- 5-6: Correct but incomplete, covers some key points
- 7-8: Mostly correct, covers most key points with good detail
- 9-10: Excellent, comprehensive, covers all points with depth

Return ONLY this JSON format:
{
  "score": 7,
  "strengths": ["what was good in the answer"],
  "improvements": ["what was missing or could be better"],
  "feedback": "One sentence summary of the evaluation"
}`;

    console.log('📝 Evaluating answer for Q' + questionNumber + '...');
    console.log('🔍 Expected points:', qa.question.expectedPoints);
    
    let evaluation;
    try {
      const evaluationText = await generateWithOllama(evaluationPrompt, {
        temperature: 0.3, // Lower temperature for objective evaluation
        maxTokens: 800, // Increased for detailed evaluation
        format: 'json' // Force JSON format
      });
      
      console.log('📥 Received evaluation (length:', evaluationText.length, 'chars)');
      console.log('🔍 Evaluation response:', evaluationText.substring(0, 300));

      evaluation = ollamaService.parseJsonResponse(evaluationText);
      
    } catch (jsonError) {
      console.warn('⚠️ JSON parsing failed, attempting plain text fallback...');
      console.warn('   Error:', jsonError.message);
      
      // Fallback: try again without format enforcement
      try {
        const retryText = await generateWithOllama(evaluationPrompt, {
          temperature: 0.3,
          maxTokens: 500
        });
        
        // Try to parse as plain text
        evaluation = ollamaService.parsePlainTextToJson(retryText, 'evaluation');
        console.log('✅ Plain text parsed successfully:', evaluation);
        
      } catch (retryError) {
        console.error('❌ Both JSON and plain text parsing failed');
        // Use default evaluation
        evaluation = {
          score: 5,
          strengths: ['Provided a response'],
          improvements: ['Could be more detailed'],
          feedback: 'Thank you for your answer.'
        };
      }
    }

    // Validate evaluation has required fields
    if (typeof evaluation.score === 'undefined' || !evaluation.feedback) {
      throw new Error('Invalid evaluation response - missing score or feedback');
    }

    // Add evaluation to transcript
    qa.evaluation = {
      score: evaluation.score,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      feedback: evaluation.feedback,
      evaluatedAt: new Date()
    };

    await transcript.save();

    console.log(`✅ Answer evaluated for Q${questionNumber}: Score ${evaluation.score}/10`);

    return res.json({
      success: true,
      evaluation: {
        score: evaluation.score,
        maxScore: 10,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        feedback: evaluation.feedback
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
    const category = qa.question.category;
    if (!categories[category]) {
      categories[category] = { scores: [], count: 0 };
    }
    categories[category].scores.push(qa.evaluation.score);
    categories[category].count++;
  });
  
  // Return as object with category names as keys and average scores as values
  const breakdown = {};
  Object.entries(categories).forEach(([category, data]) => {
    breakdown[category] = parseFloat((data.scores.reduce((sum, score) => sum + score, 0) / data.count).toFixed(1));
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

    // Pre-calculate scores
    const avgScore = (transcript.questionsAndAnswers.reduce((sum, qa) => sum + qa.evaluation.score, 0) / transcript.questionsAndAnswers.length).toFixed(1);
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
    const finalReport = {
      overallScore: parseFloat(avgScore),
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
