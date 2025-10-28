// Simple in-memory Q&A storage used by QA endpoints. Replace with DB-backed storage if needed.
const questionAnswerStorage = {
  sessions: new Map(),
  userResponses: new Map(),
  questionBank: new Map(),
  analytics: {
    totalQuestions: 0,
    totalSessions: 0,
    topicDistribution: new Map(),
    difficultyDistribution: new Map(),
  },
};

function storeQuestionAnswer(sessionId, userId, questionData, userAnswer, isCorrect) {
  const timestamp = new Date().toISOString();

  if (!questionAnswerStorage.sessions.has(sessionId)) {
    questionAnswerStorage.sessions.set(sessionId, {
      userId,
      questions: [],
      startTime: timestamp,
      topic: questionData.topic,
      difficulty: questionData.difficulty,
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
    answeredAt: timestamp,
  });

  if (!questionAnswerStorage.userResponses.has(userId)) {
    questionAnswerStorage.userResponses.set(userId, []);
  }
  questionAnswerStorage.userResponses.get(userId).push({
    sessionId,
    questionData,
    userAnswer,
    isCorrect,
    timestamp,
  });

  const questionKey = `${questionData.topic}_${questionData.difficulty}_${questionData.question.substring(0, 50)}`;
  const existing = questionAnswerStorage.questionBank.get(questionKey) || {};
  const timesAsked = (existing.timesAsked || 0) + 1;
  const correctRate = calculateCorrectRate(questionKey, isCorrect);
  questionAnswerStorage.questionBank.set(questionKey, {
    ...questionData,
    timesAsked,
    correctRate,
    lastUsed: timestamp,
  });

  questionAnswerStorage.analytics.totalQuestions++;
  const topicCount = questionAnswerStorage.analytics.topicDistribution.get(questionData.topic) || 0;
  questionAnswerStorage.analytics.topicDistribution.set(questionData.topic, topicCount + 1);
  const diffCount = questionAnswerStorage.analytics.difficultyDistribution.get(questionData.difficulty) || 0;
  questionAnswerStorage.analytics.difficultyDistribution.set(questionData.difficulty, diffCount + 1);
}

function calculateCorrectRate(questionKey, isCorrect) {
  const existing = questionAnswerStorage.questionBank.get(questionKey);
  if (!existing) return isCorrect ? 1.0 : 0.0;
  const totalAnswers = existing.timesAsked || 1;
  const currentCorrectRate = existing.correctRate || 0;
  const correctAnswers = Math.round(currentCorrectRate * (totalAnswers - 1)) + (isCorrect ? 1 : 0);
  return correctAnswers / totalAnswers;
}

function calculateUserAccuracy(userId) {
  const userHistory = questionAnswerStorage.userResponses.get(userId) || [];
  if (userHistory.length === 0) return 0;
  const correctAnswers = userHistory.filter((r) => r.isCorrect).length;
  return (correctAnswers / userHistory.length) * 100;
}

function calculateSessionAnalytics(sessionData) {
  const totalQuestions = sessionData.questions.length;
  const correctAnswers = sessionData.questions.filter((q) => q.isCorrect).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  return {
    totalQuestions,
    correctAnswers,
    accuracy,
    topic: sessionData.topic,
    difficulty: sessionData.difficulty,
    duration: calculateSessionDuration(sessionData),
  };
}

function calculateSessionDuration(sessionData) {
  if (sessionData.questions.length === 0) return 0;
  const startTime = new Date(sessionData.startTime);
  const lastAnswerTime = new Date(sessionData.questions[sessionData.questions.length - 1].answeredAt);
  return Math.round((lastAnswerTime - startTime) / 1000);
}

function calculateAverageCorrectRate() {
  const allQuestions = Array.from(questionAnswerStorage.questionBank.values());
  if (allQuestions.length === 0) return 0;
  const totalCorrectRate = allQuestions.reduce((sum, q) => sum + (q.correctRate || 0), 0);
  return (totalCorrectRate / allQuestions.length) * 100;
}

module.exports = {
  questionAnswerStorage,
  storeQuestionAnswer,
  calculateUserAccuracy,
  calculateSessionAnalytics,
  calculateAverageCorrectRate,
};
