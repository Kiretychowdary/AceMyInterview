//nmkrspvlidata - Enhanced Face-to-Face Interview with Ollama AI
//radhakrishna
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Avatar3D from '../../components/interview/Avatar3D';
import { useNavigate, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Backend API Configuration (Ollama-powered)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const FaceToFaceInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const containerRef = useRef(null);

  // Check if this is a scheduled interview
  const scheduledInterview = location.state?.scheduledInterview || null;
  const isScheduledInterview = scheduledInterview?.isScheduled || false;

  // Interview Configuration - Extract topic from location.state or use scheduled interview data
  const interviewConfig = scheduledInterview ? {
    topic: scheduledInterview.interviewType === 'company-based' 
      ? `${scheduledInterview.companyName} Interview`
      : scheduledInterview.topics.join(', '),
    difficulty: scheduledInterview.difficulty || 'medium',
    duration: scheduledInterview.duration || 3,
    interviewType: 'face-to-face',
    jobRole: scheduledInterview.companyName || scheduledInterview.topics[0] || 'General',
    subTopicDescription: scheduledInterview.interviewType === 'company-based'
      ? `Company-based interview for ${scheduledInterview.companyName}`
      : `Topic-based interview on: ${scheduledInterview.topics.join(', ')}`,
    numberOfQuestions: scheduledInterview.numberOfQuestions || 3,
    scheduledInterviewId: scheduledInterview.scheduledInterviewId,
    interviewId: scheduledInterview.interviewId,
    interviewName: scheduledInterview.interviewName
  } : {
    topic: location.state?.subject || location.state?.topic || location.state?.jobRole || 'Software Engineering',
    difficulty: location.state?.difficulty || 'medium',
    duration: 3, // 3-minute quick interview
    interviewType: 'face-to-face',
    jobRole: location.state?.jobRole || 'Software Engineer',
    subTopicDescription: location.state?.subTopicDescription || '',
    numberOfQuestions: 3
  };

  // Core State Management
  const [interviewPhase, setInterviewPhase] = useState('setup'); // setup, interview, assessment, completed
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(interviewConfig.duration * 60); // Convert minutes to seconds
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false); // NEW: Show evaluation status
  const [avatarExpression, setAvatarExpression] = useState('neutral');
  const [avatarFeedback, setAvatarFeedback] = useState('');
  const [finalAssessment, setFinalAssessment] = useState(null);
  const [interviewData, setInterviewData] = useState({ startTime: null });

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
        
        if (event.error === 'not-allowed') {
          toast.error('🎤 Microphone access denied. Please allow microphone permission and try again.', {
            duration: 5000
          });
        } else if (event.error === 'no-speech') {
          toast.warning('No speech detected. Please try speaking again.');
        } else if (event.error === 'audio-capture') {
          toast.error('No microphone detected. Please check your audio settings.');
        } else {
          toast.error('Speech recognition error. Please try again.');
        }
        
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

  // Generate Topic-Specific Questions using Ollama AI (via backend)
  const generateQuestions = async () => {
    try {
      toast.info('🤖 Generating interview questions with AI...');
      
      console.log('🚀 Starting interview session...');
      console.log('📋 Interview Config:', {
        userId: user?.uid || 'guest',
        role: interviewConfig.jobRole || interviewConfig.topic,
        difficulty: interviewConfig.difficulty,
        topic: interviewConfig.topic
      });
      
      // Start interview session
      const startResponse = await axios.post(`${API_BASE_URL}/api/interview/start`, {
        userId: user?.uid || 'guest',
        role: interviewConfig.jobRole || interviewConfig.topic,
        difficulty: interviewConfig.difficulty || 'medium',
        topic: interviewConfig.topic,
        totalQuestions: interviewConfig.numberOfQuestions || 3 // Use configured number of questions
      });

      if (!startResponse.data.success) {
        throw new Error('Failed to start interview session');
      }

      const sessionId = startResponse.data.sessionId;
      console.log('✅ Interview session created:', sessionId);
      
      const generatedQuestions = [];

      // Generate questions one by one
      const totalQuestionsToGenerate = interviewConfig.numberOfQuestions || 3;
      for (let i = 0; i < totalQuestionsToGenerate; i++) {
        toast.info(`Generating question ${i + 1} of ${totalQuestionsToGenerate}...`);
        console.log(`📝 Requesting question ${i + 1} for session:`, sessionId);
        
        const questionResponse = await axios.post(`${API_BASE_URL}/api/interview/next-question`, {
          sessionId: sessionId
        });

        if (questionResponse.data.success && questionResponse.data.question) {
          const questionData = questionResponse.data.question;
          
          // Backend returns {number, total, text, category} - extract the text
          const questionText = typeof questionData === 'string' ? questionData : questionData.text;
          const questionCategory = typeof questionData === 'object' ? questionData.category : (questionResponse.data.category || 'Technical');
          
          console.log(`✅ Received question ${i + 1}:`, questionText?.substring(0, 100) + '...');
          
          generatedQuestions.push({
            question: questionText,
            category: questionCategory,
            expectedPoints: [], // Will be evaluated dynamically
            followUp: ''
          });
        }
      }

      if (generatedQuestions.length === 0) {
        throw new Error('No questions generated');
      }

      setQuestions(generatedQuestions);
      setInterviewData(prev => ({ ...prev, sessionId }));
      console.log('💾 Stored sessionId in interviewData:', sessionId);
      
      toast.success(`✅ ${generatedQuestions.length} interview questions generated successfully!`);
      return generatedQuestions;
      
    } catch (error) {
      console.error('❌ Error generating questions:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Show specific error message if available
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate questions';
      toast.error(`❌ ${errorMessage}. Please try again.`);
      throw error; // Don't use fallback questions
    }
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

  // Request Microphone Permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately, we just needed to get permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast.error('🎤 Microphone access denied. Please allow microphone access in your browser settings.');
      return false;
    }
  };

  // Start Voice Recognition
  const startListening = async () => {
    if (recognitionRef.current && !isListening) {
      // Request permission first if not already granted
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return;
      }

      try {
        // Don't clear existing text - voice will append to it
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('🎤 Listening... Speak your answer');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast.error('Failed to start recording. Please try again.');
      }
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
    // Stop listening first and wait for final transcription
    if (isListening) {
      stopListening();
      // Wait a bit for final speech recognition results
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Validate answer
    const trimmedAnswer = currentAnswer.trim();
    if (!trimmedAnswer) {
      toast.error('Please provide an answer before submitting.');
      return;
    }

    if (trimmedAnswer.length < 5) {
      toast.warning('Your answer seems very short. Please provide a more detailed response.');
      return;
    }

    console.log('📤 Submitting answer (length:', trimmedAnswer.length, 'characters)');

    const answerData = {
      questionIndex: currentQuestionIndex,
      questionNumber: currentQuestionIndex + 1, // Backend uses 1-based indexing
      question: questions[currentQuestionIndex].question,
      answer: trimmedAnswer,
      category: questions[currentQuestionIndex].category,
      timestamp: new Date(),
      timeSpent: (interviewConfig.duration * 60) - timeRemaining
    };

    // Store answer first
    const updatedAnswers = [...userAnswers, answerData];
    setUserAnswers(updatedAnswers);

    // Provide AI feedback via Ollama (this takes 2-5 seconds)
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

  // Provide Immediate AI Feedback using Ollama (via backend)
  const provideFeedback = async (answerData) => {
    try {
      setIsEvaluating(true); // Show "Evaluating..." message
      setAvatarExpression('thinking');
      setAvatarFeedback('� Analyzing your answer with AI... This may take a few seconds.');
      
      // Show toast notification
      const toastId = toast.info('🤖 AI is evaluating your answer using Ollama model...', {
        autoClose: false,
        closeButton: false
      });
      
      if (!interviewData.sessionId) {
        console.error('❌ No session ID available for feedback');
        toast.dismiss(toastId);
        setIsEvaluating(false);
        setAvatarExpression('encouraging');
        setAvatarFeedback('');
        speakText('Thank you for your answer. Let\'s continue with the next question.');
        return;
      }

      setAvatarFeedback(`🤖 Checking: Is your answer CORRECT for "${answerData.question.substring(0, 60)}..."?`);

      // Call Ollama evaluation API - THIS TAKES TIME (2-8 seconds for thorough evaluation)
      const startTime = Date.now();
      const evaluationResponse = await axios.post(`${API_BASE_URL}/api/interview/submit-answer`, {
        sessionId: interviewData.sessionId,
        questionNumber: answerData.questionNumber,
        answer: answerData.answer,
        timeSpent: answerData.timeSpent || 0
      });
      const evaluationTime = ((Date.now() - startTime) / 1000).toFixed(1);

      // Dismiss loading toast
      toast.dismiss(toastId);

      if (evaluationResponse.data.success && evaluationResponse.data.evaluation) {
        const evaluation = evaluationResponse.data.evaluation;
        const score = evaluation.score || 0;
        const isCorrect = evaluation.isCorrect || 'INCORRECT';
        const question = evaluationResponse.data.question || answerData.question;
        const userAnswer = evaluationResponse.data.userAnswer || answerData.answer;
        
        // Update answer data with evaluation
        answerData.score = score;
        answerData.feedback = evaluation.feedback;
        answerData.strengths = evaluation.strengths;
        answerData.improvements = evaluation.improvements;
        
        // Determine emotion based on score
        let emotion = 'neutral';
        if (score >= 8) emotion = 'happy';
        else if (score >= 6) emotion = 'encouraging';
        else if (score >= 4) emotion = 'neutral';
        else emotion = 'disappointed';
        
        setAvatarExpression(emotion);
        const correctnessLabel = score >= 8 ? '✅ CORRECT!' : 
                                 score >= 6 ? '✅ Mostly Correct' :
                                 score >= 4 ? '⚠️ Partially Correct' :
                                 '❌ Incorrect/Incomplete';
        
        toast.success(
          <div>
            <p className="font-bold">{correctnessLabel}</p>
            <p className="text-sm">Score: {score}/10</p>
            <p className="text-xs mt-1">{evaluation.feedback}</p>
          </div>, 
          { autoClose: 6000 }
        );
        
        // Speak the feedback
        speakText(`You scored ${score} out of 10. ${evaluation.feedback}`, emotion);
        
        // Keep feedback visible for 6 seconds so user can read it
        await new Promise(resolve => setTimeout(resolve, 6000));
      } else {
        setAvatarExpression('encouraging');
        setAvatarFeedback('Thank you for your answer.');
        speakText('Thank you for your answer. Let\'s continue with the next question.');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      setIsEvaluating(false);
      setAvatarFeedback(''); // Clear feedback message
      
    } catch (error) {
      setIsEvaluating(false);
      setAvatarExpression('encouraging');
      setAvatarFeedback('');
      speakText('Thank you for your answer. Let\'s continue with the next question.');
    }
  };

  // End Interview and Generate Assessment
  const endInterview = async () => {
    setInterviewPhase('assessment');
    
    // Capture the current sessionId BEFORE any state updates
    const currentSessionId = interviewData.sessionId;
    
    const sessionData = {
      sessionId: currentSessionId, // Include sessionId in sessionData
      userId: user?.uid || 'guest',
      topic: interviewConfig.topic,
      difficulty: interviewConfig.difficulty,
      duration: interviewConfig.duration,
      totalQuestions: questions.length,
      answeredQuestions: userAnswers.length,
      timeSpent: (interviewConfig.duration * 60) - timeRemaining,
      startTime: interviewData.startTime || new Date(Date.now() - ((interviewConfig.duration * 60) - timeRemaining) * 1000),
      endTime: new Date(),
      questions: questions,
      answers: userAnswers,
      interviewType: 'face-to-face'
    };

    // Merge with existing interviewData
    setInterviewData(prev => ({ ...prev, ...sessionData }));
    
    console.log('📊 Ending interview with sessionId:', currentSessionId);

    try {
      // Store interview data first
      await storeInterviewData(sessionData);
      
      // Generate comprehensive AI assessment
      console.log('🔄 Requesting AI assessment...');
      const assessment = await generateAIAssessment(sessionData);
      
      if (!assessment || !assessment.overallScore) {
        throw new Error('Invalid assessment received');
      }
      
      console.log('✅ Assessment received:', assessment);
      setFinalAssessment(assessment);
      
      // If this is a scheduled interview, submit participation data
      if (isScheduledInterview && scheduledInterview) {
        console.log('📤 Submitting participation data for scheduled interview...');
        await submitScheduledInterviewParticipation(sessionData, assessment);
      }
      
      setInterviewPhase('completed');
      
      // Speak the final result
      setTimeout(() => {
        speakText(`Congratulations! Your interview is complete. You scored ${assessment.overallScore} out of 10. ${assessment.summary}`, 'happy');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error ending interview:', error);
      console.error('Error stack:', error.stack);
      toast.error('❌ Could not generate interview assessment. Please check console for details.');
      setInterviewPhase('interview'); // Go back to interview phase
    }
  };

  // Store Interview Data in Backend
  const storeInterviewData = async (sessionData) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      // Use sessionId from sessionData (now passed explicitly)
      const sessionIdToUse = sessionData.sessionId || `interview_${Date.now()}_${user?.uid || 'guest'}`;
      
      console.log('💾 Storing interview data with sessionId:', sessionIdToUse);
      
      const response = await axios.post(`${API_BASE}/api/interview/store-session`, {
        ...sessionData,
        sessionId: sessionIdToUse
      });

      if (response.data.success) {
        toast.success('Interview data saved successfully!');
      }
    } catch (error) {
      console.error('❌ Error storing interview data:', error);
      toast.warning('Interview completed but data could not be saved');
    }
  };

  // Submit Scheduled Interview Participation
  const submitScheduledInterviewParticipation = async (sessionData, assessment) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      // Build transcript from user answers
      const transcript = userAnswers.map((answerData, index) => ({
        questionNumber: index + 1,
        aiQuestion: answerData.question,
        userAnswer: answerData.answer,
        aiEvaluation: {
          score: answerData.score || 0,
          feedback: answerData.feedback || '',
          strengths: [],
          improvements: []
        },
        timestamp: answerData.timestamp
      }));

      const participationData = {
        userId: user?.uid || 'guest',
        userName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
        userEmail: user?.email || 'anonymous@example.com',
        totalQuestions: questions.length,
        questionsAnswered: userAnswers.length,
        score: assessment.overallScore * 10, // Convert 0-10 to 0-100
        maxScore: 100,
        transcript: transcript,
        overallFeedback: {
          summary: assessment.summary || '',
          strengths: assessment.strengths || [],
          areasForImprovement: assessment.improvements || [],
          recommendations: assessment.nextSteps || [],
          rating: assessment.overallScore >= 8 ? 'Excellent' : 
                  assessment.overallScore >= 6 ? 'Good' :
                  assessment.overallScore >= 4 ? 'Average' : 'Needs Improvement'
        },
        startedAt: interviewData.startTime || new Date(Date.now() - (interviewConfig.duration * 60 - timeRemaining) * 1000),
        completedAt: new Date()
      };

      console.log('📤 Submitting participation for interview:', scheduledInterview.interviewId);
      
      const response = await axios.post(
        `${API_BASE}/api/public/scheduled-interviews/${scheduledInterview.interviewId}/participate`,
        participationData,
        {
          headers: {
            'Authorization': `Bearer ${user?.accessToken || ''}`
          }
        }
      );

      if (response.data.success) {
        toast.success('✅ Your interview results have been recorded!');
        console.log('✅ Participation submitted successfully:', response.data.participation);
      }
    } catch (error) {
      console.error('❌ Error submitting participation:', error);
      toast.warning('Interview completed but participation could not be recorded');
    }
  };

  // Generate Comprehensive AI Assessment using Ollama (via backend)
  const generateAIAssessment = async (sessionData) => {
    try {
      // Use sessionId from sessionData (now passed explicitly)
      const sessionIdToUse = sessionData.sessionId;
      
      console.log('📝 Generating AI assessment for sessionId:', sessionIdToUse);
      
      if (!sessionIdToUse) {
        console.error('❌ No session ID available for final report');
        toast.error('Session ID missing - cannot generate assessment');
        throw new Error('Session ID missing - interview was not started properly');
      }

      console.log('🚀 Calling backend final-report API...');
      const reportResponse = await axios.post(`${API_BASE_URL}/api/interview/final-report`, {
        sessionId: sessionIdToUse
      });

      console.log('📥 Backend response:', reportResponse.data);

      if (reportResponse.data.success && reportResponse.data.report) {
        const report = reportResponse.data.report;
        
        console.log('✅ Received valid report from Ollama:', report);
        
        // Transform backend report format to match UI expectations
        // NO DEFAULT VALUES - use actual Ollama results
        return {
          overallScore: report.overallScore,
          summary: report.summary,
          categoryScores: report.categoryBreakdown || {},
          strengths: report.strengths || [],
          improvements: report.areasForImprovement || [],
          detailedFeedback: report.detailedAnalysis,
          nextSteps: report.recommendations || [],
          interviewReadiness: `${Math.round(report.overallScore * 10)}% - ${report.summary}`
        };
      } else {
        console.error('❌ Invalid report response from backend');
        throw new Error('Backend did not return a valid report');
      }
      
    } catch (error) {
      console.error('❌ Error generating AI assessment:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('❌ Failed to generate AI assessment. No default scores will be shown.');
      
      // NO FALLBACK - throw error to show user there's a problem
      throw error;
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
        speakText(`Welcome to your ${interviewConfig.topic} interview! I'll be asking you ${generatedQuestions.length} questions over the next 3 minutes. Let's begin with the first question: ${generatedQuestions[0].question}`, 'happy');
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
                  Quick 3-minute interview with AI-powered assessment
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
                      <span className="font-semibold text-blue-700">3 minutes</span>
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
                    <span><strong>Type your answers</strong> in the text box OR use voice recording</span>
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
                
                {/* Test Microphone Button */}
                <div className="mt-4 pt-4 border-t border-blue-300">
                  <button
                    onClick={async () => {
                      const hasPermission = await requestMicrophonePermission();
                      if (hasPermission) {
                        toast.success('✅ Microphone access granted! You\'re ready to start.');
                      }
                    }}
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🎤</span>
                    <span>Test Microphone Permission</span>
                  </button>
                </div>
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

                <h4 className="font-bold text-gray-700 mb-3 flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-green-600 mr-2">💬</span>
                    Your Answer:
                  </span>
                  {currentAnswer && !isListening && (
                    <button
                      onClick={() => setCurrentAnswer('')}
                      className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </h4>
                
                {/* AI Evaluation Progress Indicator */}
                {isEvaluating && (
                  <div className="mb-4 p-5 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-400 rounded-xl shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl">🤖</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-blue-900 text-lg mb-2 flex items-center gap-2">
                          <span>AI is Checking: Is Your Answer CORRECT?</span>
                          <span className="animate-pulse">...</span>
                        </p>
                        <div className="bg-white/70 rounded-lg p-3 mb-2 border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium mb-1">Question being evaluated:</p>
                          <p className="text-sm text-blue-900 font-medium italic">
                            "{questions[currentQuestionIndex]?.question.substring(0, 120)}..."
                          </p>
                        </div>
                        <p className="text-sm text-blue-700 font-medium">
                          ⚡ Ollama AI is verifying if your answer is factually correct and relevant
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          🎯 Strict evaluation in progress... (2-8 seconds)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Voice Answer Display */}
                {isListening && (
                  <div className="bg-red-50 p-4 rounded-xl mb-3 border-2 border-red-200">
                    <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
                      <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                      Recording your answer...
                    </div>
                    <p className="text-gray-700 text-sm italic">{currentAnswer || 'Speak now...'}</p>
                  </div>
                )}
                
                {/* Text Input Box */}
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here, or use voice recording below..."
                  disabled={isAISpeaking}
                  className="w-full bg-white p-4 rounded-xl mb-5 min-h-[120px] border-2 border-gray-300 focus:border-blue-500 focus:outline-none resize-none text-gray-800 leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />

                <div className="grid grid-cols-2 gap-3">
                  {!isListening ? (
                    <button
                      onClick={startListening}
                      disabled={isAISpeaking}
                      className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="text-xl">🎤</span>
                      <span>Voice Input</span>
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
                    disabled={!currentAnswer.trim() || isAISpeaking || isEvaluating}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all relative overflow-hidden"
                  >
                    {isEvaluating && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse"></div>
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {isEvaluating ? (
                        <>
                          <span className="animate-spin text-xl">🤖</span>
                          <span>AI Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">✓</span>
                          <span>Submit Answer</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>

                <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-center text-sm text-blue-800 font-medium">
                    💡 Pro tip: <strong>Type your answer</strong> in the text box above, or use <kbd className="px-2 py-1 bg-white rounded border border-blue-300 font-mono text-xs">Ctrl+Space</kbd> for voice recording
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

              {/* Interview Transcript - Q&A */}
              <div className="bg-gradient-to-br from-indigo-50 to-white p-7 rounded-2xl mb-10 border border-indigo-200 shadow-sm">
                <h3 className="text-xl font-bold text-indigo-900 mb-5 flex items-center">
                  <span className="mr-2">📋</span> Interview Transcript
                </h3>
                <div className="space-y-6">
                  {userAnswers.map((qa, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">Q{index + 1}</span>
                          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">{qa.category}</span>
                        </div>
                        <p className="text-gray-800 font-semibold leading-relaxed">{qa.question}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-400">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-indigo-600 font-bold text-sm">Your Answer:</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{qa.answer}</p>
                      </div>
                    </div>
                  ))}
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