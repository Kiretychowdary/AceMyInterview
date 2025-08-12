// PROFESSIONAL MCQ INTERVIEW - MODERN UI DESIGN
// NMKRSPVLIDATAPERMANENT - Beautiful, Professional Interface
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../components/AuthContext';
import GeminiService from '../services/GeminiService';

const MCQInterview = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Quiz configuration
  const [quizConfig, setQuizConfig] = useState({
    topic: 'JavaScript',
    difficulty: 'medium',
    count: 5,
    type: 'multiple-choice'
  });

  // Available options
  const topics = [
    { value: 'JavaScript', label: 'JavaScript', icon: '⚡' },
    { value: 'Python', label: 'Python', icon: '🐍' },
    { value: 'React', label: 'React', icon: '⚛️' },
    { value: 'Node.js', label: 'Node.js', icon: '🟢' },
    { value: 'Algorithms', label: 'Algorithms', icon: '🧠' },
    { value: 'Data Structures', label: 'Data Structures', icon: '📊' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { value: 'medium', label: 'Medium', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { value: 'hard', label: 'Hard', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
  ];

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleQuizComplete();
    }
  }, [timeLeft, quizStarted]);

  // Fetch questions from Gemini AI
  const fetchQuestionsFromAI = async () => {
    setLoading(true);
    try {
      toast.info('🤖 AI is generating your questions...', { duration: 3000 });

      const response = await GeminiService.getMCQQuestions(
        quizConfig.topic,
        quizConfig.difficulty,
        quizConfig.count
      );

      if (response.success && response.questions?.length > 0) {
        setQuestions(response.questions);
        setQuizStarted(true);
        setTimeLeft(quizConfig.count * 120); // 2 minutes per question
        toast.success(`✅ ${response.questions.length} AI questions loaded!`);
      } else {
        setQuestions(response.questions);
        setQuizStarted(true);
        setTimeLeft(quizConfig.count * 120);
        toast.warn('⚠️ Using sample questions - AI service unavailable');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerIndex
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleQuizComplete();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuizComplete = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setScore(0);
    setShowResults(false);
    setQuizStarted(false);
    setTimeLeft(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Configuration Screen
  if (!quizStarted && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-xl"
            >
              <span className="text-3xl text-white">🧠</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            >
              AI-Powered MCQ Interview
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Test your knowledge with AI-generated questions tailored to your skill level
            </motion.p>
          </div>

          {/* Configuration Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Configure Your Interview</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Topic Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Topic</label>
                <div className="grid grid-cols-2 gap-3">
                  {topics.map((topic) => (
                    <motion.button
                      key={topic.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setQuizConfig({ ...quizConfig, topic: topic.value })}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        quizConfig.topic === topic.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">{topic.icon}</div>
                      <div className="font-medium text-sm">{topic.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Difficulty & Count */}
              <div className="space-y-6">
                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty Level</label>
                  <div className="space-y-2">
                    {difficulties.map((diff) => (
                      <motion.button
                        key={diff.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setQuizConfig({ ...quizConfig, difficulty: diff.value })}
                        className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                          quizConfig.difficulty === diff.value
                            ? `${diff.borderColor} ${diff.bgColor} ${diff.color} shadow-md`
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{diff.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Question Count */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Questions</label>
                  <select
                    value={quizConfig.count}
                    onChange={(e) => setQuizConfig({ ...quizConfig, count: parseInt(e.target.value) })}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchQuestionsFromAI}
              disabled={loading}
              className="w-full mt-8 py-4 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Generating Questions...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>🚀</span>
                  <span>Start AI Interview</span>
                </div>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const getResultColor = () => {
      if (percentage >= 80) return 'text-green-600';
      if (percentage >= 60) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getResultEmoji = () => {
      if (percentage >= 80) return '🎉';
      if (percentage >= 60) return '👍';
      return '💪';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          {/* Results Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-6">{getResultEmoji()}</div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Interview Complete!
            </h1>
            
            <div className={`text-6xl font-bold mb-6 ${getResultColor()}`}>
              {percentage}%
            </div>
            
            <p className="text-xl text-gray-600 mb-8">
              You scored {score} out of {questions.length} questions correctly
            </p>

            {/* Detailed Results */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/50 p-6 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-white/50 p-6 rounded-xl">
                <div className="text-2xl font-bold text-red-600">{questions.length - score}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="bg-white/50 p-6 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetQuiz}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Take Another Quiz
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-all duration-300"
              >
                Back to Dashboard
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz Interface
  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className="text-sm font-medium text-blue-600">
                {quizConfig.topic} • {quizConfig.difficulty}
              </div>
            </div>
            {timeLeft && (
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                ⏱️ {formatTime(timeLeft)}
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
              {currentQ.question}
            </h2>

            <div className="space-y-4">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswers[currentQuestion] === index
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      <span className="text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </motion.button>

          <div className="text-sm text-gray-600">
            {selectedAnswers[currentQuestion] !== undefined ? '✅ Answered' : '⭕ Not answered'}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'} →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default MCQInterview;
