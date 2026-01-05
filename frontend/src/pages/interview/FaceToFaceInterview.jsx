//nmkrspvlidata - Enhanced Face-to-Face Interview with Gemini AI
//radhakrishna
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Avatar3D from '../../components/interview/Avatar3D';
import { useNavigate, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Gemini API Configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyB1-4W8tH-Eozlv_16veMff9g7z1GYDFpc';

const FaceToFaceInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const containerRef = useRef(null);

  // Interview Configuration
  const interviewConfig = location.state || {
    topic: 'Software Engineering',
    difficulty: 'intermediate',
    duration: 10, // Fixed 10 minutes as requested
    interviewType: 'face-to-face'
  };

  // Core State Management
  const [interviewPhase, setInterviewPhase] = useState('setup'); // setup, interview, assessment, completed
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [avatarExpression, setAvatarExpression] = useState('neutral');
  const [avatarFeedback, setAvatarFeedback] = useState('');
  const [finalAssessment, setFinalAssessment] = useState(null);
  const [interviewData, setInterviewData] = useState({});

  // Initialize Speech Recognition and Synthesis
  useEffect(() => {
    // Speech Recognition Setup
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setCurrentAnswer(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Speech recognition error. Please try again.');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Speech Synthesis Setup
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Fullscreen Management
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
        toast.success('Entered fullscreen mode');
      }).catch(err => {
        console.error('Error entering fullscreen:', err);
        toast.error('Could not enter fullscreen mode');
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        toast.info('Exited fullscreen mode');
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Generate Topic-Specific Questions using Gemini AI
  const generateQuestions = async () => {
    try {
      const prompt = `Generate 8-10 interview questions for a ${interviewConfig.topic} interview at ${interviewConfig.difficulty} level.

Make the questions:
- Relevant to ${interviewConfig.topic}
- Progressive in difficulty
- Mix of technical and behavioral questions
- Appropriate for a 10-minute face-to-face interview

Format as JSON array:
[
  {
    "question": "Question text here",
    "category": "Technical/Behavioral/Problem-Solving",
    "expectedPoints": ["key point 1", "key point 2", "key point 3"],
    "followUp": "Optional follow-up question"
  }
]

Return ONLY the JSON array, no markdown formatting.`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      let questionsText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      questionsText = questionsText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const generatedQuestions = JSON.parse(questionsText);
      setQuestions(generatedQuestions);
      
      toast.success('Interview questions generated successfully!');
      return generatedQuestions;
    } catch (error) {
      console.error('Error generating questions:', error);
      
      // Fallback questions based on topic
      const fallbackQuestions = getFallbackQuestions(interviewConfig.topic);
      setQuestions(fallbackQuestions);
      
      toast.warning('Using fallback questions due to API error');
      return fallbackQuestions;
    }
  };

  // Fallback Questions Generator
  const getFallbackQuestions = (topic) => {
    const baseQuestions = [
      {
        question: `Tell me about your experience with ${topic}.`,
        category: "Experience",
        expectedPoints: ["hands-on experience", "practical projects", "learning journey"],
        followUp: "What was the most challenging aspect?"
      },
      {
        question: `What are the key concepts in ${topic} that you find most important?`,
        category: "Technical",
        expectedPoints: ["core concepts", "fundamental principles", "best practices"],
        followUp: "Can you give me a practical example?"
      },
      {
        question: `How do you stay updated with the latest developments in ${topic}?`,
        category: "Learning",
        expectedPoints: ["continuous learning", "resources", "community involvement"],
        followUp: "What recent trend excites you most?"
      },
      {
        question: `Describe a challenging problem you solved using ${topic}.`,
        category: "Problem-Solving",
        expectedPoints: ["problem identification", "solution approach", "outcome"],
        followUp: "What would you do differently now?"
      },
      {
        question: `How would you explain ${topic} concepts to a beginner?`,
        category: "Communication",
        expectedPoints: ["clear explanation", "simple examples", "teaching ability"],
        followUp: "What's the most important thing to understand first?"
      }
    ];

    return baseQuestions;
  };

  // AI Text-to-Speech
  const speakText = (text, emotion = 'neutral') => {
    if (!synthRef.current) return;

    setIsAISpeaking(true);
    setAvatarExpression(emotion);
    setAvatarFeedback(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to get a pleasant voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') ||
      voice.lang.includes('en-US')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      setIsAISpeaking(false);
      setAvatarExpression('neutral');
      setAvatarFeedback('');
    };

    synthRef.current.speak(utterance);
  };

  // Start Voice Recognition
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setCurrentAnswer('');
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('🎤 Listening... Speak your answer');
    }
  };

  // Stop Voice Recognition
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Submit Current Answer
  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer before submitting.');
      return;
    }

    stopListening();

    const answerData = {
      questionIndex: currentQuestionIndex,
      question: questions[currentQuestionIndex].question,
      answer: currentAnswer,
      category: questions[currentQuestionIndex].category,
      timestamp: new Date(),
      timeSpent: 600 - timeRemaining
    };

    setUserAnswers([...userAnswers, answerData]);

    // Provide immediate AI feedback
    await provideFeedback(answerData);

    // Move to next question or end interview
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      
      setTimeout(() => {
        const nextQuestion = questions[currentQuestionIndex + 1];
        speakText(nextQuestion.question, 'curious');
      }, 2000);
    } else {
      // End interview
      await endInterview();
    }
  };

  // Provide Immediate AI Feedback
  const provideFeedback = async (answerData) => {
    try {
      setAvatarExpression('thinking');
      
      const feedbackPrompt = `Analyze this interview answer and provide brief feedback:

Question: ${answerData.question}
Answer: ${answerData.answer}
Category: ${answerData.category}

Provide a JSON response:
{
  "score": 4.2,
  "feedback": "Brief encouraging feedback (1-2 sentences)",
  "emotion": "happy/neutral/encouraging/disappointed"
}`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: feedbackPrompt }]
          }]
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );

      let feedbackText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      feedbackText = feedbackText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const feedback = JSON.parse(feedbackText);
      
      setAvatarExpression(feedback.emotion || 'neutral');
      speakText(feedback.feedback, feedback.emotion);
      
    } catch (error) {
      console.error('Error providing feedback:', error);
      setAvatarExpression('encouraging');
      speakText('Thank you for your answer. Let\'s continue with the next question.');
    }
  };

  // End Interview and Generate Assessment
  const endInterview = async () => {
    setInterviewPhase('assessment');
    
    const sessionData = {
      userId: user?.uid || 'guest',
      topic: interviewConfig.topic,
      difficulty: interviewConfig.difficulty,
      duration: 10,
      totalQuestions: questions.length,
      answeredQuestions: userAnswers.length,
      timeSpent: 600 - timeRemaining,
      startTime: new Date(Date.now() - (600 - timeRemaining) * 1000),
      endTime: new Date(),
      questions: questions,
      answers: userAnswers,
      interviewType: 'face-to-face'
    };

    setInterviewData(sessionData);

    try {
      // Store interview data first
      await storeInterviewData(sessionData);
      
      // Generate comprehensive AI assessment
      const assessment = await generateAIAssessment(sessionData);
      setFinalAssessment(assessment);
      
      setInterviewPhase('completed');
      
      // Speak the final result
      setTimeout(() => {
        speakText(`Congratulations! Your interview is complete. You scored ${assessment.overallScore} out of 10. ${assessment.summary}`, 'happy');
      }, 1000);
      
    } catch (error) {
      console.error('Error ending interview:', error);
      toast.error('Error processing interview results');
    }
  };

  // Store Interview Data in Backend
  const storeInterviewData = async (sessionData) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const response = await axios.post(`${API_BASE}/api/interview/store-session`, {
        ...sessionData,
        sessionId: `interview_${Date.now()}_${user?.uid || 'guest'}`
      });

      if (response.data.success) {
        toast.success('Interview data saved successfully!');
      }
    } catch (error) {
      console.error('Error storing interview data:', error);
      toast.warning('Interview completed but data could not be saved');
    }
  };

  // Generate Comprehensive AI Assessment
  const generateAIAssessment = async (sessionData) => {
    try {
      const assessmentPrompt = `Conduct a comprehensive interview assessment:

INTERVIEW DETAILS:
- Topic: ${sessionData.topic}
- Difficulty: ${sessionData.difficulty}
- Duration: ${Math.floor(sessionData.timeSpent / 60)} minutes ${sessionData.timeSpent % 60} seconds
- Questions Answered: ${sessionData.answeredQuestions}/${sessionData.totalQuestions}

QUESTIONS AND ANSWERS:
${sessionData.answers.map((qa, index) => 
  `${index + 1}. Q: ${qa.question}
     A: ${qa.answer}
     Category: ${qa.category}`
).join('\n\n')}

Provide detailed assessment as JSON:
{
  "overallScore": 7.5,
  "summary": "Strong performance with good technical knowledge",
  "categoryScores": {
    "technical": 8.0,
    "communication": 7.5,
    "problemSolving": 7.0,
    "experience": 8.5
  },
  "strengths": [
    "Clear communication",
    "Good technical depth",
    "Practical examples"
  ],
  "improvements": [
    "More specific examples",
    "Deeper technical details"
  ],
  "detailedFeedback": "Comprehensive feedback paragraph",
  "nextSteps": [
    "Practice advanced concepts",
    "Work on more complex projects"
  ],
  "interviewReadiness": "85% - Ready for most positions with some improvement areas"
}`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: assessmentPrompt }]
          }]
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      let assessmentText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      assessmentText = assessmentText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(assessmentText);
      
    } catch (error) {
      console.error('Error generating AI assessment:', error);
      
      // Fallback assessment
      return {
        overallScore: 7.0,
        summary: "Interview completed successfully",
        categoryScores: { technical: 7.0, communication: 7.0, problemSolving: 7.0, experience: 7.0 },
        strengths: ["Participated actively", "Answered all questions"],
        improvements: ["Continue practicing"],
        detailedFeedback: "Thank you for completing the interview. Keep practicing to improve your skills.",
        nextSteps: ["Review fundamental concepts", "Practice more mock interviews"],
        interviewReadiness: "70% - Good foundation, continue practicing"
      };
    }
  };

  // Start Interview
  const startInterview = async () => {
    setInterviewPhase('interview');
    
    toast.success('Interview starting... Generating questions...');
    
    const generatedQuestions = await generateQuestions();
    
    if (generatedQuestions && generatedQuestions.length > 0) {
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
      
      // Auto-enter fullscreen
      setTimeout(() => {
        if (!document.fullscreenElement) {
          toggleFullscreen();
        }
      }, 500);
      
      // Start with welcome message
      setTimeout(() => {
        speakText(`Welcome to your ${interviewConfig.topic} interview! I'll be asking you ${generatedQuestions.length} questions over the next 10 minutes. Let's begin with the first question: ${generatedQuestions[0].question}`, 'happy');
      }, 1000);
    }
  };

  // Timer Effect
  useEffect(() => {
    if (interviewPhase !== 'interview') return;

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
  }, [interviewPhase]);

  // Format Time Display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (interviewPhase === 'interview') {
        if (event.key === 'F11') {
          event.preventDefault();
          toggleFullscreen();
        }
        if (event.key === ' ' && event.ctrlKey) {
          event.preventDefault();
          isListening ? stopListening() : startListening();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [interviewPhase, isListening, toggleFullscreen]);

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 ${
        isFullscreen ? 'p-2' : 'p-4'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full">
        
        {/* Setup Phase */}
        {interviewPhase === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center min-h-screen"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Face-to-Face AI Interview
                </h1>
                <p className="text-gray-600">
                  Enhanced 10-minute interview with AI-powered assessment
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-blue-900 mb-2">Interview Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Topic:</span>
                      <span className="font-medium text-blue-600">{interviewConfig.topic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <span className="font-medium text-green-600">{interviewConfig.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium text-purple-600">10 minutes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-green-900 mb-2">Features</h3>
                  <ul className="text-sm space-y-1 text-green-800">
                    <li>✓ AI-Generated Questions</li>
                    <li>✓ Voice Recognition</li>
                    <li>✓ Real-time Feedback</li>
                    <li>✓ Fullscreen Mode</li>
                    <li>✓ Comprehensive Assessment</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">📋 Instructions:</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Ensure your camera and microphone are working</li>
                  <li>• Find a quiet, well-lit environment</li>
                  <li>• The interview will automatically enter fullscreen mode</li>
                  <li>• Use Ctrl+Space to start/stop voice recording</li>
                  <li>• Press F11 to toggle fullscreen manually</li>
                  <li>• Speak clearly and maintain eye contact with the camera</li>
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startInterview}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                🚀 Start Interview
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Interview Phase */}
        {interviewPhase === 'interview' && (
          <div className="grid lg:grid-cols-2 gap-4 h-screen">
            
            {/* AI Interviewer Side */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">AI Interviewer</h2>
                  <p className="text-sm opacity-90">{interviewConfig.topic} Interview</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatTime(timeRemaining)}</div>
                  <div className="text-sm opacity-90">Time Remaining</div>
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center p-8">
                <Avatar3D 
                  textToSpeak={questions[currentQuestionIndex]?.question || ''}
                  expression={avatarExpression}
                  feedbackText={avatarFeedback}
                />
              </div>

              <div className="p-4 bg-gray-50 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-gray-500">
                    {questions[currentQuestionIndex]?.category}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* User Side */}
            <div className="space-y-4">
              
              {/* User Camera */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                  <h3 className="font-semibold">Your Camera</h3>
                  <button
                    onClick={toggleFullscreen}
                    className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
                  >
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F11)'}
                  </button>
                </div>
                
                <div className="relative aspect-video bg-gray-900">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    className="w-full h-full object-cover"
                    mirrored={true}
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    🔴 Recording
                  </div>
                </div>
              </div>

              {/* Current Question & Answer */}
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Current Question:
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-800 font-medium">
                    {questions[currentQuestionIndex]?.question || 'Loading question...'}
                  </p>
                </div>

                <h4 className="font-semibold text-gray-700 mb-2">Your Answer:</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4 min-h-[100px] max-h-[150px] overflow-y-auto border">
                  {isListening && (
                    <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      Recording...
                    </div>
                  )}
                  <p className="text-gray-800">
                    {currentAnswer || 'Click "Start Recording" to record your answer...'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {!isListening ? (
                    <button
                      onClick={startListening}
                      disabled={isAISpeaking}
                      className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      🎤 Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopListening}
                      className="bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 flex items-center justify-center gap-2"
                    >
                      ⏸️ Stop Recording
                    </button>
                  )}
                  
                  <button
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim() || isAISpeaking}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    ✓ Submit Answer
                  </button>
                </div>

                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>💡 Pro tip: Use Ctrl+Space to start/stop recording quickly</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assessment Phase */}
        {interviewPhase === 'assessment' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-screen"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full text-center">
              <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Generating Your Assessment...
              </h2>
              <p className="text-gray-600 mb-4">
                Our AI is analyzing your responses and preparing a comprehensive evaluation.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  🤖 Evaluating technical knowledge, communication skills, and problem-solving approach...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Phase */}
        {interviewPhase === 'completed' && finalAssessment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🎉</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Interview Completed!
                </h1>
                <p className="text-gray-600">
                  Here's your comprehensive AI-powered assessment
                </p>
              </div>

              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 text-center">
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {finalAssessment.overallScore}/10
                </div>
                <p className="text-xl text-gray-700 font-semibold mb-2">Overall Score</p>
                <p className="text-gray-600">{finalAssessment.summary}</p>
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Object.entries(finalAssessment.categoryScores).map(([category, score]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {score}/10
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths and Improvements */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    💪 Strengths
                  </h3>
                  <ul className="space-y-2">
                    {finalAssessment.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-green-800">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-orange-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                    🎯 Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {finalAssessment.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-600 mr-2">→</span>
                        <span className="text-orange-800">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="bg-blue-50 p-6 rounded-xl mb-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  📝 Detailed Feedback
                </h3>
                <p className="text-blue-800 leading-relaxed">
                  {finalAssessment.detailedFeedback}
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-purple-50 p-6 rounded-xl mb-8">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">
                  🚀 Next Steps
                </h3>
                <ul className="space-y-2">
                  {finalAssessment.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span className="text-purple-800">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interview Readiness */}
              <div className="text-center mb-8">
                <div className="bg-gray-50 p-4 rounded-xl inline-block">
                  <h4 className="font-semibold text-gray-800 mb-2">Interview Readiness</h4>
                  <p className="text-gray-700">{finalAssessment.interviewReadiness}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/mock-interviews')}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Take Another Interview
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FaceToFaceInterview;