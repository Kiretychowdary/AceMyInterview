//nmkrspvlidata
//radhakrishna
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
      // Show motivational quote while loading
      const motivationalQuote = GeminiService.getMotivationalQuote();
      toast.info(motivationalQuote, { 
        autoClose: 8000,  // Longer duration to read the quote
        position: "top-center",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "motivational-toast-professional",
        style: {
          backgroundColor: '#fef7ff',
          color: '#581c87',
          fontSize: '16px',
          fontWeight: '600',
          textAlign: 'center',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #a855f7',
          maxWidth: '600px',
          minHeight: '80px',
          boxShadow: '0 8px 25px rgba(168, 85, 247, 0.15)',
          lineHeight: '1.5'
        }
      });

      // Secondary loading message
      setTimeout(() => {
        toast.info('🤖 AI is crafting professional-level questions for you...', { 
          autoClose: 5000,
          position: "bottom-right",
          hideProgressBar: false,
          style: {
            backgroundColor: '#f3f4f6',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #6b7280'
          }
        });
      }, 2000);

      const response = await GeminiService.getMCQQuestions(
        quizConfig.topic,
        quizConfig.difficulty,
        quizConfig.count
      );

      if (response.success && response.questions?.length > 0) {
        setQuestions(response.questions);
        setQuizStarted(true);
        setTimeLeft(quizConfig.count * 120); // 2 minutes per question
        toast.success(`✅ ${response.questions.length} Professional AI questions loaded!`, {
          autoClose: 4000,
          position: "top-center",
          style: {
            backgroundColor: '#f0fdf4',
            color: '#14532d',
            fontSize: '16px',
            fontWeight: '600',
            padding: '18px',
            borderRadius: '12px',
            border: '2px solid #22c55e',
            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.15)'
          }
        });
      } else {
        setQuestions(response.questions);
        setQuizStarted(true);
        setTimeLeft(quizConfig.count * 120);
        toast.warn('⚠️ Using sample questions - AI service unavailable', {
          autoClose: 6000,
          position: "top-center",
          style: {
            backgroundColor: '#fefce8',
            color: '#a16207',
            fontSize: '16px',
            fontWeight: '600',
            padding: '18px',
            borderRadius: '12px',
            border: '2px solid #eab308',
            boxShadow: '0 8px 25px rgba(234, 179, 8, 0.15)'
          }
        });
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

  // 🌟 BEAUTIFUL LOADING SCREEN - Professional Version
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center z-50">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/4 -right-10 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-10 left-1/4 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Main Loading Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-lg mx-auto px-6"
        >
          {/* Premium Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-28 h-28 mx-auto mb-8"
          >
            <div className="w-28 h-28 border-4 border-purple-300 border-t-white rounded-full"></div>
          </motion.div>

          {/* Professional AI Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-7xl mb-6"
          >
            🎓
          </motion.div>

          {/* Professional Loading Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl font-bold text-white mb-4"
          >
            Professional AI
          </motion.h2>

          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-2xl font-semibold text-purple-200 mb-8"
          >
            Crafting Expert Questions
          </motion.h3>

          {/* Advanced Loading Messages */}
          <motion.div
            key={Math.floor(Date.now() / 2500)} // Changes every 2.5 seconds
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xl text-purple-100 mb-8"
          >
            {[
              "🔬 Analyzing industry standards...",
              "🎯 Building professional scenarios...",
              "⚡ Calibrating expert difficulty...",
              "🚀 Preparing advanced challenges...",
              "💼 Generating real-world problems...",
              "🏆 Finalizing premium content..."
            ][Math.floor(Date.now() / 2500) % 6]}
          </motion.div>

          {/* Premium Progress Indicator */}
          <div className="flex justify-center space-x-3 mb-8">
            {[0, 1, 2, 3].map((dot) => (
              <motion.div
                key={dot}
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: dot * 0.3
                }}
                className="w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
              />
            ))}
          </div>

          {/* Professional Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-lg text-purple-100 leading-relaxed"
          >
            🌟 <strong>Professional {quizConfig.topic} Assessment</strong><br />
            Our advanced AI is creating industry-level questions<br />
            designed to test your expertise and skills.
          </motion.p>

          {/* Elite Progress Bar */}
          <motion.div
            className="mt-8 mx-auto max-w-sm"
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 10, ease: "easeInOut" }}
              className="h-2 bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 rounded-full"
            />
            <p className="text-sm text-purple-200 mt-2">Professional content loading...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

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
