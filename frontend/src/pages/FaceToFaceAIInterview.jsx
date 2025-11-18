// NMKRSPVLIDATA - Real-time Face-to-Face AI HR Interview
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { useAuth } from '../components/AuthContext';
import AIHRAvatar from '../components/AIHRAvatar';
import axios from 'axios';

const FaceToFaceAIInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Interview state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [aiEmotion, setAiEmotion] = useState('neutral');
  const [interviewData, setInterviewData] = useState({
    role: location.state?.role || 'Software Engineer',
    duration: location.state?.duration || 30,
    difficulty: location.state?.difficulty || 'medium'
  });

  // Interview progress
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(interviewData.duration * 60);
  const [interviewScore, setInterviewScore] = useState(null);

  // Questions queue
  const [questions, setQuestions] = useState([]);
  const [currentSpeechText, setCurrentSpeechText] = useState('');

  // User profile display
  const [userProfile, setUserProfile] = useState({
    name: user?.displayName || user?.email || 'Candidate',
    email: user?.email || '',
    avatar: user?.photoURL || null
  });

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setUserAnswer(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          toast.info('No speech detected. Please speak clearly.');
        }
      };

      recognitionRef.current = recognition;
    } else {
      toast.error('Speech recognition not supported in this browser.');
    }

    // Initialize Speech Synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Generate interview questions using AI
  const generateQuestions = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_BASE}/api/ai/generate-interview-questions`, {
        role: interviewData.role,
        difficulty: interviewData.difficulty,
        count: 10
      });

      if (response.data.success && response.data.questions) {
        setQuestions(response.data.questions);
        setCurrentQuestion(response.data.questions[0]);
        
        // AI introduces itself
        speakAI("Hello! I'm your AI HR Interviewer. Welcome to this interview session. Let me introduce myself - I'll be conducting this interview today. Are you ready to begin?");
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback questions
      const fallbackQuestions = [
        {
          question: "Tell me about yourself and your background.",
          category: "Introduction",
          expectedPoints: ["experience", "education", "skills"]
        },
        {
          question: "What interests you about this role?",
          category: "Motivation",
          expectedPoints: ["passion", "alignment", "goals"]
        },
        {
          question: "Describe a challenging project you've worked on.",
          category: "Technical",
          expectedPoints: ["problem-solving", "technical skills", "outcome"]
        },
        {
          question: "How do you handle conflicts in a team?",
          category: "Behavioral",
          expectedPoints: ["communication", "conflict resolution", "teamwork"]
        },
        {
          question: "Where do you see yourself in 5 years?",
          category: "Career Goals",
          expectedPoints: ["ambition", "planning", "growth mindset"]
        }
      ];
      
      setQuestions(fallbackQuestions);
      setCurrentQuestion(fallbackQuestions[0]);
      speakAI("Hello! I'm your AI HR Interviewer. Let's begin the interview.");
    }
  };

  // AI Text-to-Speech with lip sync
  const speakAI = (text) => {
    if (!synthRef.current) return;

    setIsAISpeaking(true);
    setCurrentSpeechText(text);
    setAiEmotion('happy');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    // Get female voice if available
    const voices = synthRef.current.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Google UK English Female')
    );
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      setIsAISpeaking(false);
      setCurrentSpeechText('');
      setAiEmotion('neutral');
    };

    synthRef.current.speak(utterance);
  };

  // Start listening to user
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setUserAnswer('');
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('🎤 Listening... Speak your answer');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Submit answer and move to next question
  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please provide an answer before submitting.');
      return;
    }

    stopListening();

    // Save answer
    const answerData = {
      question: currentQuestion.question,
      answer: userAnswer,
      category: currentQuestion.category,
      timestamp: new Date()
    };

    setAnsweredQuestions([...answeredQuestions, answerData]);

    // AI evaluates answer
    setAiEmotion('thinking');
    await evaluateAnswer(answerData);

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setUserAnswer('');
      
      setTimeout(() => {
        speakAI(questions[nextIndex].question);
      }, 2000);
    } else {
      // Interview complete
      endInterview();
    }
  };

  // AI evaluates user's answer
  const evaluateAnswer = async (answerData) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_BASE}/api/ai/evaluate-answer`, {
        question: answerData.question,
        answer: answerData.answer,
        expectedPoints: currentQuestion.expectedPoints || []
      });

      if (response.data.success) {
        const feedback = response.data.feedback;
        
        if (feedback.score >= 7) {
          speakAI("Great answer! You covered the key points well. Let's move to the next question.");
          setAiEmotion('happy');
        } else if (feedback.score >= 5) {
          speakAI("Good answer. You might want to elaborate more on certain aspects. Moving to the next question.");
          setAiEmotion('neutral');
        } else {
          speakAI("Thank you for your answer. Let's continue with the next question.");
          setAiEmotion('neutral');
        }
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      speakAI("Thank you for your answer. Let's continue.");
    }
  };

  // End interview and show results
  const endInterview = async () => {
    setInterviewStarted(false);
    stopListening();

    // Calculate final score
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_BASE}/api/ai/generate-interview-report`, {
        userId: user?.uid,
        role: interviewData.role,
        answers: answeredQuestions,
        duration: interviewData.duration
      });

      if (response.data.success) {
        setInterviewScore(response.data.report);
        speakAI(`Congratulations! You've completed the interview. Your overall performance score is ${response.data.report.overallScore} out of 10. Well done!`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }

    toast.success('Interview completed! Generating your report...');
  };

  // Start interview
  const handleStartInterview = () => {
    setInterviewStarted(true);
    generateQuestions();
  };

  // Timer countdown
  useEffect(() => {
    if (!interviewStarted || interviewScore) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted, interviewScore]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Face-to-Face Interview
          </h1>
          <p className="text-blue-200">
            Real-time interview with AI HR - {interviewData.role}
          </p>
        </motion.div>

        {!interviewStarted && !interviewScore ? (
          /* Pre-Interview Setup */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Interview Setup</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={interviewData.role}
                  onChange={(e) => setInterviewData({...interviewData, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={interviewData.difficulty}
                  onChange={(e) => setInterviewData({...interviewData, difficulty: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy (Beginner)</option>
                  <option value="medium">Medium (Intermediate)</option>
                  <option value="hard">Hard (Advanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={interviewData.duration}
                  onChange={(e) => setInterviewData({...interviewData, duration: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="60"
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Interview Guidelines:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure your webcam and microphone are working</li>
                <li>• Find a quiet place with good lighting</li>
                <li>• Speak clearly and maintain eye contact</li>
                <li>• Click "Start Listening" before answering each question</li>
                <li>• Be honest and professional in your responses</li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartInterview}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Start Interview
            </motion.button>
          </motion.div>
        ) : interviewScore ? (
          /* Results Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Interview Completed!</h2>
              <p className="text-gray-600">Great job! Here's your performance summary</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{interviewScore?.overallScore || 'N/A'}/10</div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{answeredQuestions.length}</div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-800">Performance Breakdown:</h3>
              {interviewScore?.breakdown?.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-700">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(item.score / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{item.score}/10</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/mock-interviews')}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Start New Interview
              </button>
            </div>
          </motion.div>
        ) : (
          /* Active Interview Screen */
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Side - AI HR Avatar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="h-[600px]">
                <AIHRAvatar 
                  isSpeaking={isAISpeaking}
                  currentText={currentSpeechText}
                  emotion={aiEmotion}
                />
              </div>
            </motion.div>

            {/* Right Side - User Profile & Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* User Webcam */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        {userProfile.avatar ? (
                          <img src={userProfile.avatar} alt="User" className="w-12 h-12 rounded-full" />
                        ) : (
                          <span className="text-2xl">👤</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{userProfile.name}</div>
                        <div className="text-xs opacity-90">{userProfile.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatTime(timeRemaining)}</div>
                      <div className="text-xs opacity-90">Time Remaining</div>
                    </div>
                  </div>
                </div>
                
                <div className="relative aspect-video bg-gray-900">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    className="w-full h-full object-cover"
                    mirrored={true}
                  />
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>
              </div>

              {/* Current Question */}
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Current Question:</h3>
                <p className="text-lg font-medium text-gray-800 mb-4">
                  {currentQuestion?.question || 'Loading...'}
                </p>

                {/* User Answer Display */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[100px] max-h-[200px] overflow-y-auto">
                  <p className="text-sm text-gray-600">
                    {isListening && (
                      <span className="inline-flex items-center gap-2 text-red-600 font-semibold mb-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                        Recording...
                      </span>
                    )}
                  </p>
                  <p className="text-gray-800">{userAnswer || 'Click "Start Listening" to record your answer...'}</p>
                </div>

                {/* Control Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {!isListening ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startListening}
                      disabled={isAISpeaking}
                      className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>🎤</span> Start Listening
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={stopListening}
                      className="bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 flex items-center justify-center gap-2"
                    >
                      <span>⏸️</span> Stop Listening
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || isAISpeaking}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>✓</span> Submit Answer
                  </motion.button>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white rounded-2xl shadow-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {answeredQuestions.length} / {questions.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(answeredQuestions.length / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceToFaceAIInterview;
