const qaStorage = require('../services/qaStorage.cjs');

function storeMcqSession(req, res) {
  try {
    const { userId, topic, difficulty, totalQuestions, correctAnswers, timeSpent, questions, answers } = req.body;
    const sessionData = {
      userId,
      type: 'mcq',
      topic,
      difficulty,
      totalQuestions,
      correctAnswers,
      timeSpent,
      questions,
      answers,
      timestamp: new Date(),
      accuracy: Math.round((correctAnswers / totalQuestions) * 100),
    };
    // store each question answer if present
    if (Array.isArray(questions)) {
      const sessionId = Date.now().toString();
      questions.forEach((q, idx) => {
        const userAnswer = Array.isArray(answers) ? answers[idx] : null;
        qaStorage.storeQuestionAnswer(sessionId, userId, q, userAnswer, userAnswer === q.correctAnswer);
      });
    }

    res.json({ success: true, message: 'MCQ session stored successfully', sessionId: Date.now(), data: sessionData });
  } catch (err) {
    console.error('storeMcqSession error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

function storeCodingSession(req, res) {
  try {
    const { userId, topic, difficulty, language, totalProblems, solvedProblems, timeSpent, problems, solutions } = req.body;
    const sessionData = {
      userId,
      type: 'coding',
      topic,
      difficulty,
      language,
      totalProblems,
      solvedProblems,
      timeSpent,
      problems,
      solutions,
      timestamp: new Date(),
      successRate: Math.round((solvedProblems / totalProblems) * 100),
    };
    res.json({ success: true, message: 'Coding session stored successfully', sessionId: Date.now(), data: sessionData });
  } catch (err) {
    console.error('storeCodingSession error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

function storeQa(req, res) {
  try {
    const { sessionId, userId, questionData, userAnswer, isCorrect } = req.body;
    qaStorage.storeQuestionAnswer(sessionId, userId, questionData, userAnswer, isCorrect);
    res.json({ success: true, message: 'Q&A stored successfully', analytics: { totalQuestions: qaStorage.questionAnswerStorage.analytics.totalQuestions, totalSessions: qaStorage.questionAnswerStorage.analytics.totalSessions } });
  } catch (err) {
    console.error('storeQa error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

function getQaHistory(req, res) {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    const userHistory = qaStorage.questionAnswerStorage.userResponses.get(userId) || [];
    const limitedHistory = userHistory.slice(-parseInt(limit));
    res.json({ success: true, history: limitedHistory, totalQuestions: userHistory.length, accuracy: qaStorage.calculateUserAccuracy(userId) });
  } catch (err) {
    console.error('getQaHistory error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

function getSession(req, res) {
  try {
    const { sessionId } = req.params;
    const sessionData = qaStorage.questionAnswerStorage.sessions.get(sessionId);
    if (!sessionData) return res.status(404).json({ success: false, error: 'Session not found' });
    res.json({ success: true, session: sessionData, analytics: qaStorage.calculateSessionAnalytics(sessionData) });
  } catch (err) {
    console.error('getSession error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

function getAnalytics(req, res) {
  try {
    const analytics = {
      ...qaStorage.questionAnswerStorage.analytics,
      topicDistribution: Object.fromEntries(qaStorage.questionAnswerStorage.analytics.topicDistribution),
      difficultyDistribution: Object.fromEntries(qaStorage.questionAnswerStorage.analytics.difficultyDistribution),
      questionBank: {
        totalUniqueQuestions: qaStorage.questionAnswerStorage.questionBank.size,
        averageCorrectRate: qaStorage.calculateAverageCorrectRate(),
      },
    };
    res.json({ success: true, analytics });
  } catch (err) {
    console.error('getAnalytics error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { storeMcqSession, storeCodingSession, storeQa, getQaHistory, getSession, getAnalytics };
