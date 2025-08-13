// PROFESSIONAL MCQ INTERVIEW - MODERN UI DESIGN
// NMKRSPVLIDATAPERMANENT - Beautiful, Professional Interface
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../components/AuthContext';
import { useLocation } from 'react-router-dom';
import GeminiService from '../services/GeminiService';
import { progressService } from '../services/ProgressService';

const MCQInterview = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Get selected topic from navigation state
  const selectedTopic = location.state?.subject || 'JavaScript';
  
  // Map topics to API format
  const mapTopicToAPI = (topic) => {
    const topicMap = {
      'Software Developer': 'JavaScript',
      'DSA': 'Algorithms',
      'OOPS': 'Object Oriented Programming',
      'System Design': 'System Design',
      'Cybersecurity': 'Cybersecurity',
      'Network Security': 'Network Security',
      'Ethical Hacking': 'Ethical Hacking',
      'Cryptography': 'Cryptography',
      'Data Analyst': 'Data Analysis',
      'Product Manager': 'Product Management',
      'HR Interview': 'HR',
      'Project Coordinator': 'Project Management',
      'System Admin': 'System Administration'
    };
    return topicMap[topic] || topic;
  };
  
  const apiTopic = mapTopicToAPI(selectedTopic);
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Quiz configuration - use selected topic as default
  const [quizConfig, setQuizConfig] = useState({
    topic: apiTopic,
    difficulty: 'medium',
    count: 5,
    type: 'multiple-choice'
  });

  // Topic hierarchy system
  const [selectedMainTopic, setSelectedMainTopic] = useState(null);
  const [showSubTopics, setShowSubTopics] = useState(false);

  // Auto-configure based on selected topic from navigation
  useEffect(() => {
    if (selectedTopic && selectedTopic !== 'JavaScript') {
      // Map selected topic to main categories
      const topicToMainCategoryMap = {
        'Software Developer': 'tech-computer-science',
        'DSA': 'tech-computer-science', 
        'OOPS': 'tech-computer-science',
        'System Design': 'tech-computer-science',
        'Cybersecurity': 'tech-computer-science',
        'Network Security': 'tech-computer-science',
        'Ethical Hacking': 'tech-computer-science', 
        'Cryptography': 'tech-computer-science',
        'Data Analyst': 'tech-computer-science',
        'Product Manager': 'business-management',
        'HR Interview': 'business-management',
        'Project Coordinator': 'business-management',
        'System Admin': 'tech-computer-science'
      };
      
      const mainCategory = topicToMainCategoryMap[selectedTopic];
      if (mainCategory) {
        setSelectedMainTopic(mainCategory);
        setShowSubTopics(true);
        // Auto-select a default subtopic based on the main topic
        const defaultSubtopic = getDefaultSubtopic(selectedTopic);
        if (defaultSubtopic) {
          setQuizConfig({ ...quizConfig, topic: defaultSubtopic });
        }
      }
    }
  }, [selectedTopic]);

  // Get default subtopic based on selected main topic
  const getDefaultSubtopic = (topic) => {
    const defaultMap = {
      'Software Developer': 'Software Developer',
      'DSA': 'Algorithms', 
      'OOPS': 'Java',
      'System Design': 'System Design',
      'Cybersecurity': 'Cybersecurity Specialist',
      'Network Security': 'Network Security',
      'Ethical Hacking': 'Cybersecurity Specialist',
      'Cryptography': 'Cybersecurity Specialist',
      'Data Analyst': 'Data Scientist',
      'Product Manager': 'Product Manager',
      'HR Interview': 'HR Manager',
      'Project Coordinator': 'Project Manager',
      'System Admin': 'System Administrator'
    };
    return defaultMap[topic] || null;
  };

  // Main topic categories - Enhanced with Tech Computer Science focus
  const mainTopics = [
    { value: 'tech-computer-science', label: 'Tech Computer Science', icon: '💻', color: 'blue' },
    { value: 'business-management', label: 'Business & Management', icon: '📊', color: 'green' },
    { value: 'engineering', label: 'Engineering & Sciences', icon: '⚙️', color: 'red' },
    { value: 'creative-design', label: 'Creative & Design', icon: '🎨', color: 'purple' },
    { value: 'healthcare-medical', label: 'Healthcare & Medical', icon: '🏥', color: 'orange' },
    { value: 'finance-economics', label: 'Finance & Economics', icon: '�', color: 'yellow' }
  ];

  // Subtopics for each main category - Enhanced structure
  const subTopics = {
    'tech-computer-science': [
      // Core Tech Roles
      { value: 'Software Developer', label: 'Software Developer', icon: '👨‍💻' },
      { value: 'Data Scientist', label: 'Data Scientist', icon: '📈' },
      { value: 'Cybersecurity Specialist', label: 'Cybersecurity Specialist', icon: '🔒' },
      { value: 'DevOps Engineer', label: 'DevOps Engineer', icon: '�' },
      { value: 'AI/ML Engineer', label: 'AI/ML Engineer', icon: '🤖' },
      { value: 'Full Stack Developer', label: 'Full Stack Developer', icon: '🌐' },
      { value: 'Mobile App Developer', label: 'Mobile App Developer', icon: '📱' },
      { value: 'Cloud Architect', label: 'Cloud Architect', icon: '☁️' },
      { value: 'Database Administrator', label: 'Database Administrator', icon: '🗄️' },
      { value: 'System Administrator', label: 'System Administrator', icon: '�️' },
      { value: 'Quality Assurance Engineer', label: 'QA Engineer', icon: '🧪' },
      { value: 'UI/UX Developer', label: 'UI/UX Developer', icon: '🎨' },
      // Programming Languages
      { value: 'JavaScript', label: 'JavaScript Programming', icon: '⚡' },
      { value: 'Python', label: 'Python Programming', icon: '�' },
      { value: 'Java', label: 'Java Programming', icon: '☕' },
      { value: 'C++', label: 'C++ Programming', icon: '⚡' },
      { value: 'React', label: 'React.js Framework', icon: '⚛️' },
      { value: 'Node.js', label: 'Node.js Backend', icon: '�' },
      // Core CS Concepts
      { value: 'Algorithms', label: 'Data Structures & Algorithms', icon: '🧠' },
      { value: 'System Design', label: 'System Design', icon: '🏗️' },
      { value: 'Database Design', label: 'Database Design & SQL', icon: '�' },
      { value: 'Network Security', label: 'Network Security', icon: '🌐' },
      { value: 'Machine Learning', label: 'Machine Learning', icon: '🤖' }
    ],
    'business-management': [
      { value: 'Product Manager', label: 'Product Manager', icon: '📋' },
      { value: 'Project Manager', label: 'Project Manager', icon: '📅' },
      { value: 'Business Analyst', label: 'Business Analyst', icon: '📈' },
      { value: 'Marketing Manager', label: 'Marketing Manager', icon: '�' },
      { value: 'Sales Manager', label: 'Sales Manager', icon: '�' },
      { value: 'HR Manager', label: 'HR Manager', icon: '�' },
      { value: 'Operations Manager', label: 'Operations Manager', icon: '⚙️' },
      { value: 'Strategy Consultant', label: 'Strategy Consultant', icon: '🎯' },
      { value: 'Digital Marketing', label: 'Digital Marketing', icon: '💻' },
      { value: 'Customer Success', label: 'Customer Success', icon: '🤝' }
    ],
    'cybersecurity': [
      { value: 'Network Security', label: 'Network Security', icon: '🌐' },
      { value: 'Ethical Hacking', label: 'Ethical Hacking', icon: '🎭' },
      { value: 'Cryptography', label: 'Cryptography', icon: '🔐' },
      { value: 'Web Security', label: 'Web Application Security', icon: '🔒' },
      { value: 'Penetration Testing', label: 'Penetration Testing', icon: '🔍' },
      { value: 'Incident Response', label: 'Incident Response', icon: '🚨' },
      { value: 'Risk Management', label: 'Risk Management', icon: '⚖️' },
      { value: 'Compliance', label: 'Security Compliance', icon: '📋' },
      { value: 'Malware Analysis', label: 'Malware Analysis', icon: '�' },
      { value: 'Digital Forensics', label: 'Digital Forensics', icon: '🔬' }
    ],
    'cloud-computing': [
      { value: 'AWS', label: 'Amazon Web Services', icon: '☁️' },
      { value: 'Azure', label: 'Microsoft Azure', icon: '🔷' },
      { value: 'Google Cloud', label: 'Google Cloud Platform', icon: '🌤️' },
      { value: 'Docker', label: 'Docker', icon: '🐳' },
      { value: 'Kubernetes', label: 'Kubernetes', icon: '⚙️' },
      { value: 'Serverless', label: 'Serverless Computing', icon: '⚡' },
      { value: 'Microservices', label: 'Microservices', icon: '🔧' },
      { value: 'CI/CD', label: 'CI/CD Pipelines', icon: '🔄' }
    ],
    'mobile-development': [
      { value: 'React Native', label: 'React Native', icon: '📱' },
      { value: 'Flutter', label: 'Flutter', icon: '🎯' },
      { value: 'iOS Development', label: 'iOS (Swift)', icon: '🍎' },
      { value: 'Android Development', label: 'Android (Kotlin)', icon: '🤖' },
      { value: 'Xamarin', label: 'Xamarin', icon: '🔷' },
      { value: 'Ionic', label: 'Ionic', icon: '⚡' }
    ],
    'engineering': [
      { value: 'Mechanical Engineering', label: 'Mechanical Engineering', icon: '⚙️' },
      { value: 'Electrical Engineering', label: 'Electrical Engineering', icon: '⚡' },
      { value: 'Civil Engineering', label: 'Civil Engineering', icon: '🏗️' },
      { value: 'Chemical Engineering', label: 'Chemical Engineering', icon: '🧪' },
      { value: 'Aerospace Engineering', label: 'Aerospace Engineering', icon: '✈️' },
      { value: 'Environmental Engineering', label: 'Environmental Engineering', icon: '🌍' },
      { value: 'Biomedical Engineering', label: 'Biomedical Engineering', icon: '🏥' },
      { value: 'Materials Science', label: 'Materials Science', icon: '🔬' }
    ],
    'creative-design': [
      { value: 'Graphic Designer', label: 'Graphic Designer', icon: '🎨' },
      { value: 'UI/UX Designer', label: 'UI/UX Designer', icon: '📱' },
      { value: 'Web Designer', label: 'Web Designer', icon: '🌐' },
      { value: 'Motion Graphics', label: 'Motion Graphics', icon: '🎬' },
      { value: 'Brand Designer', label: 'Brand Designer', icon: '🏷️' },
      { value: 'Product Designer', label: 'Product Designer', icon: '📦' }
    ],
    'healthcare-medical': [
      { value: 'General Medicine', label: 'General Medicine', icon: '🩺' },
      { value: 'Nursing', label: 'Nursing', icon: '👩‍⚕️' },
      { value: 'Pharmacy', label: 'Pharmacy', icon: '💊' },
      { value: 'Dentistry', label: 'Dentistry', icon: '🦷' },
      { value: 'Psychology', label: 'Psychology', icon: '🧠' },
      { value: 'Medical Technology', label: 'Medical Technology', icon: '🔬' }
    ],
    'finance-economics': [
      { value: 'Financial Analyst', label: 'Financial Analyst', icon: '📊' },
      { value: 'Investment Banking', label: 'Investment Banking', icon: '🏦' },
      { value: 'Accounting', label: 'Accounting', icon: '📚' },
      { value: 'Risk Management', label: 'Risk Management', icon: '⚖️' },
      { value: 'Corporate Finance', label: 'Corporate Finance', icon: '💼' },
      { value: 'Economics', label: 'Economics', icon: '📈' }
    ]
  };

  // Current available topics (either main topics or subtopics)
  const getCurrentTopics = () => {
    if (selectedMainTopic && showSubTopics) {
      return subTopics[selectedMainTopic] || [];
    }
    return mainTopics;
  };

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

  const handleQuizComplete = async () => {
    let correctAnswers = 0;
    const userAnswers = [];
    
    questions.forEach((question, index) => {
      const isCorrect = selectedAnswers[index] === question.correctAnswer;
      if (isCorrect) {
        correctAnswers++;
      }
      userAnswers.push({
        question: question.question,
        selectedAnswer: question.options[selectedAnswers[index]] || 'Not answered',
        correctAnswer: question.options[question.correctAnswer],
        isCorrect
      });
    });
    
    setScore(correctAnswers);
    setShowResults(true);

    // Save session to progress tracking
    if (user) {
      try {
        await progressService.saveMCQSession(user.uid, {
          topic: selectedTopic,
          difficulty: quizConfig.difficulty,
          totalQuestions: questions.length,
          correctAnswers,
          timeSpent: (quizConfig.timeLimit * 60) - (timeLeft || 0),
          questions,
          answers: userAnswers
        });
        
        toast.success('Progress saved successfully!');
      } catch (error) {
        console.error('Error saving progress:', error);
        toast.warn('Quiz completed but progress not saved');
      }
    }
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
              className="text-lg text-gray-600 max-w-2xl mx-auto mb-4"
            >
              Test your knowledge with AI-generated questions tailored to your skill level
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-lg font-semibold"
            >
              📚 Selected Topic: {selectedTopic}
            </motion.div>
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
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    {showSubTopics ? 'Select Specific Topic' : 'Select Main Category'}
                  </label>
                  {showSubTopics && (
                    <button
                      onClick={() => {
                        setShowSubTopics(false);
                        setSelectedMainTopic(null);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      ← Back to Categories
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {getCurrentTopics().map((topic) => (
                    <motion.button
                      key={topic.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (!showSubTopics) {
                          // Main topic selected - show subtopics
                          setSelectedMainTopic(topic.value);
                          setShowSubTopics(true);
                        } else {
                          // Subtopic selected - set as quiz topic
                          setQuizConfig({ ...quizConfig, topic: topic.value });
                        }
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        (!showSubTopics && selectedMainTopic === topic.value) ||
                        (showSubTopics && quizConfig.topic === topic.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">{topic.icon}</div>
                      <div className="font-medium text-sm">{topic.label}</div>
                    </motion.button>
                  ))}
                </div>

                {/* Selected Topic Display */}
                {showSubTopics && quizConfig.topic && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <span className="text-lg">✅</span>
                      <span className="font-medium">Selected: {quizConfig.topic}</span>
                    </div>
                  </div>
                )}
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
              whileHover={{ scale: showSubTopics && quizConfig.topic ? 1.02 : 1 }}
              whileTap={{ scale: showSubTopics && quizConfig.topic ? 0.98 : 1 }}
              onClick={fetchQuestionsFromAI}
              disabled={loading || !showSubTopics || !quizConfig.topic}
              className={`w-full mt-8 py-4 px-8 font-semibold rounded-xl shadow-xl transition-all duration-300 ${
                showSubTopics && quizConfig.topic && !loading
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Generating Questions...</span>
                </div>
              ) : !showSubTopics ? (
                <div className="flex items-center justify-center space-x-2">
                  <span>📁</span>
                  <span>Select a Category First</span>
                </div>
              ) : !quizConfig.topic ? (
                <div className="flex items-center justify-center space-x-2">
                  <span>🎯</span>
                  <span>Select a Topic First</span>
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
