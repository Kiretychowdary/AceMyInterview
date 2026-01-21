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

  // Interview Configuration - Extract topic from location.state
  const interviewConfig = {
    topic: location.state?.subject || location.state?.topic || location.state?.jobRole || 'Software Engineering',
    difficulty: location.state?.difficulty || 'intermediate',
    duration: 10, // Fixed 10 minutes as requested
    interviewType: 'face-to-face',
    jobRole: location.state?.jobRole || 'Software Engineer',
    subTopicDescription: location.state?.subTopicDescription || ''
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
      const prompt = `Generate 8-10 interview questions specifically for ${interviewConfig.topic} at ${interviewConfig.difficulty} level.

IMPORTANT: All questions MUST be strictly related to ${interviewConfig.topic}. Do not ask generic questions.

Topic Focus: ${interviewConfig.topic}
${interviewConfig.subTopicDescription ? `Context: ${interviewConfig.subTopicDescription}` : ''}

Make the questions:
- Highly specific to ${interviewConfig.topic} concepts, tools, and best practices
- Progressive in difficulty (start easier, get harder)
- Mix of technical knowledge, problem-solving, and practical experience
- Appropriate for a 10-minute face-to-face interview
- Include both theoretical understanding and hands-on application

Format as JSON array:
[
  {
    "question": "Specific question about ${interviewConfig.topic}",
    "category": "Technical/Behavioral/Problem-Solving/Practical",
    "expectedPoints": ["key technical point 1", "key technical point 2", "key technical point 3"],
    "followUp": "Optional follow-up question to probe deeper"
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
      
      // Check for specific API errors
      if (error.response?.status === 403) {
        toast.error('⚠️ Gemini API key is invalid. Using fallback questions.');
        console.error('❌ Gemini API Error: Please update VITE_GEMINI_API_KEY in .env file');
        console.log('Get a new key at: https://aistudio.google.com/app/apikey');
      } else if (error.response?.status === 429) {
        toast.warning('⏰ API rate limit reached. Using fallback questions. Please wait a moment before trying again.');
        console.warn('⚠️ Gemini API rate limit exceeded. Consider upgrading your API plan or wait before making more requests.');
      } else {
        toast.warning('Using fallback questions due to API error');
      }
      
      // Fallback questions based on topic
      const fallbackQuestions = getFallbackQuestions(interviewConfig.topic);
      setQuestions(fallbackQuestions);
      
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

  // Face Detection State
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetectionActive, setFaceDetectionActive] = useState(false);
  const faceDetectionIntervalRef = useRef(null);

  // Face Detection Logic
  const detectFace = useCallback(() => {
    if (!webcamRef.current || !faceDetectionActive) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simple skin tone detection (basic face detection)
    let skinPixels = 0;
    const totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Skin tone detection heuristic
      if (r > 95 && g > 40 && b > 20 &&
          r > g && r > b &&
          Math.abs(r - g) > 15) {
        skinPixels++;
      }
    }
    
    const skinPercentage = (skinPixels / totalPixels) * 100;
    
    // If more than 8% of pixels are skin tone, face is likely detected
    setFaceDetected(skinPercentage > 8);
  }, [faceDetectionActive]);

  // Start Face Detection
  useEffect(() => {
    if (faceDetectionActive && interviewPhase === 'interview') {
      faceDetectionIntervalRef.current = setInterval(detectFace, 1000); // Check every second
    } else {
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
      }
    }
    
    return () => {
      if (faceDetectionIntervalRef.current) {
        clearInterval(faceDetectionIntervalRef.current);
      }
    };
  }, [faceDetectionActive, interviewPhase, detectFace]);

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 ${
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
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full border border-blue-100">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🎤</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                  Face-to-Face AI Interview
                </h1>
                <p className="text-gray-600 text-lg mb-3">
                  Professional 10-minute interview with AI-powered assessment
                </p>
                {interviewConfig.subTopicDescription && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3 max-w-md mx-auto">
                    <p className="text-sm text-blue-800 font-medium">{interviewConfig.subTopicDescription}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <span className="mr-2">📋</span> Interview Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Topic:</span>
                      <span className="font-semibold text-blue-700">{interviewConfig.topic}</span>
                    </div>
                    {interviewConfig.jobRole && interviewConfig.jobRole !== interviewConfig.topic && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Role:</span>
                        <span className="font-semibold text-blue-700">{interviewConfig.jobRole}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Difficulty:</span>
                      <span className="font-semibold text-green-700 capitalize">{interviewConfig.difficulty}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Duration:</span>
                      <span className="font-semibold text-blue-700">10 minutes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                    <span className="mr-2">✨</span> Features
                  </h3>
                  <ul className="text-sm space-y-2 text-green-800">
                    <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> AI-Generated Questions</li>
                    <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Face Detection</li>
                    <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Voice Recognition</li>
                    <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Real-time Feedback</li>
                    <li className="flex items-center"><span className="text-green-600 mr-2">✓</span> Comprehensive Assessment</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="mr-2">💡</span> Instructions
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5">•</span>
                    <span>Ensure your <strong>camera and microphone</strong> are working properly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5">•</span>
                    <span>Find a <strong>quiet, well-lit environment</strong> for best results</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5">•</span>
                    <span>Face detection will monitor your presence during the interview</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5">•</span>
                    <span>Use <kbd className="px-2 py-0.5 bg-white rounded border border-blue-300">Ctrl+Space</kbd> to start/stop voice recording</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5">•</span>
                    <span>Press <kbd className="px-2 py-0.5 bg-white rounded border border-blue-300">F11</kbd> to toggle fullscreen mode</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5">•</span>
                    <span><strong>Speak clearly</strong> and maintain eye contact with the camera</span>
                  </li>
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startInterview}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="text-2xl">🚀</span>
                <span>Start Interview</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Interview Phase */}
        {interviewPhase === 'interview' && (
          <div className="grid lg:grid-cols-2 gap-4 h-screen">
            
            {/* AI Interviewer Side */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-blue-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">AI Interviewer</h2>
                  <p className="text-sm opacity-95 mt-1">{interviewConfig.topic} Interview</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold tabular-nums">{formatTime(timeRemaining)}</div>
                  <div className="text-xs opacity-95 uppercase tracking-wide">Time Remaining</div>
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-white">
                <Avatar3D 
                  textToSpeak={questions[currentQuestionIndex]?.question || ''}
                  expression={avatarExpression}
                  feedbackText={avatarFeedback}
                />
              </div>

              <div className="p-5 bg-gray-50 border-t border-blue-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {questions[currentQuestionIndex]?.category}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* User Side */}
            <div className="space-y-4">
              
              {/* User Camera with Face Detection */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">Your Camera</h3>
                    <div className="flex items-center gap-2">
                      {faceDetectionActive && (
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          faceDetected 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/50'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                          {faceDetected ? 'Face Detected' : 'No Face Detected'}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={toggleFullscreen}
                    className="text-xs bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors font-medium"
                  >
                    {isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Fullscreen (F11)'}
                  </button>
                </div>
                
                <div className="relative aspect-video bg-gray-900">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    className="w-full h-full object-cover"
                    mirrored={true}
                    onUserMedia={() => setFaceDetectionActive(true)}
                  />
                  <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                    Recording
                  </div>
                </div>
              </div>

              {/* Current Question & Answer */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-blue-600 mr-2">❓</span>
                  Current Question:
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl mb-5 border border-blue-200">
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {questions[currentQuestionIndex]?.question || 'Loading question...'}
                  </p>
                </div>

                <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                  <span className="text-green-600 mr-2">💬</span>
                  Your Answer:
                </h4>
                <div className="bg-gray-50 p-5 rounded-xl mb-5 min-h-[120px] max-h-[160px] overflow-y-auto border border-gray-200">
                  {isListening && (
                    <div className="flex items-center gap-2 text-red-600 font-semibold mb-3 pb-3 border-b border-red-200">
                      <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                      Recording your answer...
                    </div>
                  )}
                  <p className="text-gray-800 leading-relaxed">
                    {currentAnswer || 'Click "Start Recording" below to record your answer using voice...'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {!isListening ? (
                    <button
                      onClick={startListening}
                      disabled={isAISpeaking}
                      className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="text-xl">🎤</span>
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopListening}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="text-xl">⏸️</span>
                      <span>Stop Recording</span>
                    </button>
                  )}
                  
                  <button
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim() || isAISpeaking}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                    <span className="text-xl">✓</span>
                    <span>Submit Answer</span>
                  </button>
                </div>

                <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-center text-sm text-blue-800 font-medium">
                    💡 Pro tip: Use <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono text-xs">Ctrl+Space</kbd> to start/stop recording quickly
                  </p>
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
            <div className="bg-white rounded-2xl p-10 shadow-2xl max-w-2xl w-full text-center border border-blue-100">
              <div className="relative inline-block mb-6">
                <div className="animate-spin w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
                Generating Your Assessment...
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Our AI is analyzing your responses and preparing a comprehensive evaluation.
              </p>
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <p className="text-sm text-blue-800 font-medium">
                  Evaluating technical knowledge, communication skills, and problem-solving approach...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Phase */}
        {interviewPhase === 'completed' && finalAssessment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-5xl mx-auto border border-blue-100">
              
              {/* Header */}
              <div className="text-center mb-10">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <span className="text-5xl">🎉</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
                  Interview Completed!
                </h1>
                <p className="text-gray-600 text-lg">
                  Here's your comprehensive AI-powered assessment
                </p>
              </div>

              {/* Overall Score */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 mb-10 text-center border-2 border-blue-200 shadow-inner">
                <div className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
                  {finalAssessment.overallScore}/10
                </div>
                <p className="text-2xl text-gray-800 font-bold mb-2">Overall Score</p>
                <p className="text-gray-700 text-lg">{finalAssessment.summary}</p>
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
                {Object.entries(finalAssessment.categoryScores).map(([category, score]) => (
                  <div key={category} className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl text-center border border-blue-200 hover:shadow-lg transition-shadow">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {score}/10
                    </div>
                    <div className="text-sm text-gray-700 capitalize font-medium">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths and Improvements */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-gradient-to-br from-green-50 to-white p-7 rounded-2xl border border-green-200 shadow-sm">
                  <h3 className="text-xl font-bold text-green-900 mb-5 flex items-center">
                    <span className="mr-2">💪</span> Strengths
                  </h3>
                  <ul className="space-y-3">
                    {finalAssessment.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-3 text-lg font-bold">✓</span>
                        <span className="text-green-900 font-medium">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-white p-7 rounded-2xl border border-orange-200 shadow-sm">
                  <h3 className="text-xl font-bold text-orange-900 mb-5 flex items-center">
                    <span className="mr-2">🎯</span> Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {finalAssessment.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-600 mr-3 text-lg font-bold">→</span>
                        <span className="text-orange-900 font-medium">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-7 rounded-2xl mb-10 border border-blue-200 shadow-sm">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                  <span className="mr-2">📝</span> Detailed Feedback
                </h3>
                <p className="text-blue-900 leading-relaxed font-medium">
                  {finalAssessment.detailedFeedback}
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-7 rounded-2xl mb-10 border border-purple-200 shadow-sm">
                <h3 className="text-xl font-bold text-purple-900 mb-5 flex items-center">
                  <span className="mr-2">🚀</span> Next Steps
                </h3>
                <ul className="space-y-3">
                  {finalAssessment.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-600 mr-3 text-lg font-bold">•</span>
                      <span className="text-purple-900 font-medium">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interview Readiness */}
              <div className="text-center mb-10">
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl inline-block border-2 border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">📊 Interview Readiness</h4>
                  <p className="text-gray-700 font-semibold text-lg">{finalAssessment.interviewReadiness}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => navigate('/mock-interviews')}
                  className="px-8 py-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>←</span>
                  <span>Back to Dashboard</span>
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-md flex items-center gap-2"
                >
                  <span>🔄</span>
                  <span>Take Another Interview</span>
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