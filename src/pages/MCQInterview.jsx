//nmkrspvlidata
//radhakrishna
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
      'OOP': 'Object Oriented Programming',
      'System Design': 'System Design',
      'Cybersecurity': 'Cybersecurity',
      'Network Security': 'Network Security',
      'Ethical Hacking': 'Ethical Hacking',
      'Cryptography': 'Cryptography',
      'Incident Response': 'Incident Response',
      'Authentication': 'Authentication',
      'Web App Security': 'Web Application Security',
      'Testing': 'Software Testing',
      'Databases': 'Database Design & SQL',
      'Database Design': 'Database Design & SQL',
      'DevOps Basics': 'DevOps',
      'APIs & REST': 'API Design',
      'Concurrency': 'Concurrency',
      'Statistics': 'Statistics',
      'Feature Engineering': 'Feature Engineering',
      'Visualization': 'Data Visualization',
      'Python/R': 'Python',
      'Python': 'Python',
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

  // Loading message cycling state
  const [messageIndex, setMessageIndex] = useState(0);
  const loadingMessages = [
    "🔍 Analyzing your skill level...",
    "🎯 Crafting personalized questions...", 
    "🧠 Selecting the perfect challenges...",
    "⚡ Optimizing difficulty balance...",
    "📝 Preparing your interview...",
    "🚀 Almost ready to begin!"
  ];

  // Cycle through loading messages every 2 seconds during loading
  useEffect(() => {
    let interval;
    if (loading) {
      // Reset message index when loading starts
      setMessageIndex(0);
      interval = setInterval(() => {
        setMessageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % loadingMessages.length;
          return nextIndex;
        });
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

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
      const topicToMainCategoryMap = {
        'Software Developer': 'tech-computer-science',
        'DSA': 'tech-computer-science',
        'OOPS': 'tech-computer-science',
        'OOP': 'tech-computer-science',
        'System Design': 'tech-computer-science',
        'Cybersecurity': 'tech-computer-science',
        'Network Security': 'tech-computer-science',
        'Ethical Hacking': 'tech-computer-science',
        'Cryptography': 'tech-computer-science',
        'Incident Response': 'tech-computer-science',
        'Authentication': 'tech-computer-science',
        'Web App Security': 'tech-computer-science',
        'Testing': 'tech-computer-science',
        'Databases': 'tech-computer-science',
        'Database Design': 'tech-computer-science',
        'DevOps Basics': 'tech-computer-science',
        'APIs & REST': 'tech-computer-science',
        'Concurrency': 'tech-computer-science',
        'Statistics': 'tech-computer-science',
        'Feature Engineering': 'tech-computer-science',
        'Visualization': 'tech-computer-science',
        'Python/R': 'tech-computer-science',
        'Python': 'tech-computer-science',
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
        const defaultSubtopic = getDefaultSubtopic(selectedTopic);
        if (defaultSubtopic) {
          setQuizConfig((cfg) => ({ ...cfg, topic: defaultSubtopic }));
        }
      } else {
        // Fallback: assume tech if unknown new topic comes in
        setSelectedMainTopic('tech-computer-science');
      }
    }
  }, [selectedTopic]);

  // Get default subtopic based on selected main topic
  const getDefaultSubtopic = (topic) => {
    const defaultMap = {
      'Software Developer': 'Software Developer',
      'DSA': 'Algorithms',
      'OOPS': 'Java',
      'OOP': 'Java',
      'System Design': 'System Design',
      'Cybersecurity': 'Cybersecurity Specialist',
      'Network Security': 'Network Security',
      'Ethical Hacking': 'Cybersecurity Specialist',
      'Cryptography': 'Cybersecurity Specialist',
      'Incident Response': 'Cybersecurity Specialist',
      'Authentication': 'Cybersecurity Specialist',
      'Web App Security': 'Cybersecurity Specialist',
      'Testing': 'QA Engineer',
      'Databases': 'Database Administrator',
      'Database Design': 'Database Administrator',
      'DevOps Basics': 'DevOps Engineer',
      'APIs & REST': 'Software Developer',
      'Concurrency': 'Software Developer',
      'Statistics': 'Data Scientist',
      'Feature Engineering': 'Data Scientist',
      'Visualization': 'Data Scientist',
      'Python/R': 'Python',
      'Python': 'Python',
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
      // Generate questions without motivational toast
      const response = await GeminiService.getMCQQuestions(
        quizConfig.topic,
        quizConfig.difficulty,
        quizConfig.count
      );

      if (response.success && response.questions?.length > 0) {
        setQuestions(response.questions);
        setQuizStarted(true);
        setTimeLeft(quizConfig.count * 120); // 2 minutes per question  
      } else {
        
        setQuestions(response.questions);
        setQuizStarted(true);
        setTimeLeft(quizConfig.count * 120);
        toast.warn('⚠️ Using sample questions - AI service unavailable', {
          autoClose: 6000,
          position: "top-center",
          style: {
            backgroundColor: '#fef3c7',
            color: '#92400e',
            fontSize: '16px',
            fontWeight: '600',
            padding: '18px',
            borderRadius: '12px',
            border: '2px solid #f59e0b',
            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.15)'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to generate questions', {
        autoClose: 5000,
        position: "top-center",
        style: {
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          fontSize: '16px',
          fontWeight: '600',
          padding: '18px',
          borderRadius: '12px',
          border: '2px solid #ef4444',
          boxShadow: '0 8px 25px rgba(239, 68, 68, 0.15)'
        }
      });
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
        
        toast.success('Progress saved successfully!', {
          autoClose: 4000,
          position: "bottom-right",
          style: {
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            fontSize: '15px',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '10px',
            border: '2px solid #10b981',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.12)'
          }
        });
      } catch (error) {
        console.error('Error saving progress:', error);
        toast.warn('Quiz completed but progress not saved', {
          autoClose: 5000,
          position: "bottom-right",
          style: {
            backgroundColor: '#fef3c7',
            color: '#92400e',
            fontSize: '15px',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '10px',
            border: '2px solid #f59e0b',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.12)'
          }
        });
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

  // 🌟 BEAUTIFUL LOADING SCREEN - Show while questions are being generated
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 -right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Main Loading Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-lg mx-auto px-6"
        >
          {/* Large Spinning Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-8"
          >
            <div className="w-24 h-24 border-4 border-white border-t-transparent rounded-full"></div>
          </motion.div>

          {/* AI Brain Animation */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-6"
          >
            🧠
          </motion.div>

          {/* Loading Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            AI is Thinking...
          </motion.h2>

          {/* Dynamic Loading Messages */}
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-xl text-blue-200 mb-8"
            >
              {loadingMessages[messageIndex]}
            </motion.div>
          </AnimatePresence>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: dot * 0.2
                }}
                className="w-3 h-3 bg-white rounded-full"
              />
            ))}
          </div>

          {/* Encouraging Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-lg text-blue-100 leading-relaxed"
          >
            🌟 <strong>Great choice on {apiTopic}!</strong><br />
            Our AI is creating questions tailored just for you.<br />
            Get ready for an amazing learning experience!
          </motion.p>

          {/* Subtle Loading Bar */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 8, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-8 mx-auto max-w-xs"
          />
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
          <div className="text-center mb-8">{/* reduced margin */}
            {/* Removed decorative circle image per request */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-blue-700 mb-4"
            >
              AI-Powered MCQ Interview
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-lg font-semibold"
            >
              📚 Selected Topic: {selectedTopic}
            </motion.div>
          </div>

          {/* Configuration Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-8 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Configure Your Interview</h2>

            {/* Topic selection stays scrollable, but full width above controls */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  {showSubTopics ? 'Select Specific Topic' : 'Select Main Category'}
                </label>
                {showSubTopics && (
                  <button
                    onClick={() => { setShowSubTopics(false); setSelectedMainTopic(null); }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    ← Back to Categories
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-52 overflow-y-auto">
                {getCurrentTopics().map((topic) => (
                  <motion.button
                    key={topic.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (!showSubTopics) { setSelectedMainTopic(topic.value); setShowSubTopics(true); }
                      else { setQuizConfig({ ...quizConfig, topic: topic.value }); }
                    }}
                    className={`p-3 rounded-xl border-2 text-sm transition-all duration-200 ${
                      (!showSubTopics && selectedMainTopic === topic.value) || (showSubTopics && quizConfig.topic === topic.value)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-xl mb-1">{topic.icon}</div>
                    <div className="font-medium leading-tight">{topic.label}</div>
                  </motion.button>
                ))}
              </div>
              {showSubTopics && quizConfig.topic && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center text-green-800 text-sm font-medium">
                  ✅ Selected: {quizConfig.topic}
                </div>
              )}
            </div>

            {/* Centered Difficulty & Question Count */}
            <div className="flex flex-col items-center gap-8">
              <div className="w-full max-w-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Difficulty Level</label>
                <div className="space-y-2">
                  {difficulties.map(diff => (
                    <motion.button
                      key={diff.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setQuizConfig({ ...quizConfig, difficulty: diff.value })}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${quizConfig.difficulty === diff.value ? `${diff.borderColor} ${diff.bgColor} ${diff.color} shadow` : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}`}
                    >
                      <span className="font-medium">{diff.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="w-full max-w-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Number of Questions</label>
                <select
                  value={quizConfig.count}
                  onChange={(e) => setQuizConfig({ ...quizConfig, count: parseInt(e.target.value) })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white text-center"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: showSubTopics && quizConfig.topic ? 1.02 : 1 }}
              whileTap={{ scale: showSubTopics && quizConfig.topic ? 0.98 : 1 }}
              onClick={fetchQuestionsFromAI}
              disabled={loading || !showSubTopics || !quizConfig.topic}
              className={`w-full mt-10 py-4 px-8 font-semibold rounded-xl shadow-lg transition-all duration-300 ${showSubTopics && quizConfig.topic && !loading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {loading ? 'Generating Questions...' : !showSubTopics ? 'Select a Category First' : !quizConfig.topic ? 'Select a Topic First' : 'Start AI Interview'}
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
