// AI-POWERED FACE-TO-FACE INTERVIEW ROOM WITH CAMERA, MICROPHONE & VOICE
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { progressService } from '../services/ProgressService';
import { useNavigate, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';

const FaceToFaceInterview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [interviewState, setInterviewState] = useState('setup'); // setup, camera-check, active, completed, assessment
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [userResponses, setUserResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes default
  const [isRecording, setIsRecording] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Media & Audio States
  const [cameraPermission, setCameraPermission] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [isAIRecording, setIsAIRecording] = useState(false);
  const [inputMethod, setInputMethod] = useState('text'); // 'text', 'voice', 'both'
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  
  // Refs
  const timerRef = useRef(null);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Interview configuration from navigation state
  const interviewConfig = location.state || {
    topic: 'Software Developer',
    difficulty: 'medium',
    duration: 30,
    interviewType: 'technical'
  };

  useEffect(() => {
    if (interviewState === 'setup') {
      initializeSpeechServices();
    }
  }, []);

  useEffect(() => {
    if (interviewState === 'active' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [interviewState, timeRemaining]);

  const initializeSpeechServices = () => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      speechRecognitionRef.current = new window.webkitSpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = 'en-US';
      
      speechRecognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        setVoiceTranscript(prev => prev + transcript);
      };

      speechRecognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize Speech Synthesis
    speechSynthesisRef.current = window.speechSynthesis;
  };

  const requestMediaPermissions = async () => {
    try {
      setLoading(true);
      
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setCameraPermission(true);
      setMicrophonePermission(true);
      
      // Store stream for later use
      window.currentMediaStream = stream;
      
      setInterviewState('camera-check');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Camera and microphone access is required for the face-to-face interview. Please grant permissions and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateInterviewQuestions = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/mcq-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: interviewConfig.topic,
          difficulty: interviewConfig.difficulty,
          count: 6
        }),
      });

      const data = await response.json();
      
      if (data.success && data.questions) {
        // Convert to interview questions with detailed context
        const interviewQuestions = [
          {
            id: 1,
            question: `Hello! Welcome to your ${interviewConfig.topic} interview. Let's start with an introduction - tell me about yourself and your experience with ${interviewConfig.topic}.`,
            type: 'introduction',
            expectedDuration: 3,
            context: 'Introduction and background'
          },
          {
            id: 2,
            question: `What interests you most about ${interviewConfig.topic} and why did you choose this field?`,
            type: 'motivation',
            expectedDuration: 3,
            context: 'Understanding candidate motivation'
          }
        ];

        // Add technical questions from AI
        data.questions.slice(0, 4).forEach((q, index) => {
          interviewQuestions.push({
            id: index + 3,
            question: q.question.replace(/^[A-D]\.\s*/, '').replace(/\?$/, '') + '? Please explain your answer in detail.',
            type: 'technical',
            expectedDuration: 4,
            context: q.explanation
          });
        });

        // Add closing question
        interviewQuestions.push({
          id: interviewQuestions.length + 1,
          question: `Thank you for your responses. Do you have any questions about the role, team, or company? Is there anything else you'd like me to know about your qualifications?`,
          type: 'closing',
          expectedDuration: 3,
          context: 'Candidate questions and final thoughts'
        });

        setQuestions(interviewQuestions);
        setUserResponses(new Array(interviewQuestions.length).fill(''));
      } else {
        throw new Error('Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback questions
      const fallbackQuestions = [
        {
          id: 1,
          question: `Hello! Tell me about yourself and your experience with ${interviewConfig.topic}.`,
          type: 'introduction',
          expectedDuration: 3
        },
        {
          id: 2,
          question: `What are the key principles and best practices in ${interviewConfig.topic}?`,
          type: 'technical',
          expectedDuration: 4
        },
        {
          id: 3,
          question: `Describe a challenging project you worked on. How did you approach and solve the problems?`,
          type: 'experience',
          expectedDuration: 5
        },
        {
          id: 4,
          question: `Do you have any questions for me about the role or company?`,
          type: 'closing',
          expectedDuration: 3
        }
      ];
      
      setQuestions(fallbackQuestions);
      setUserResponses(new Array(fallbackQuestions.length).fill(''));
    } finally {
      setLoading(false);
    }
  };

  const speakQuestion = (questionText) => {
    if (speechSynthesisRef.current) {
      // Stop any current speech
      speechSynthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setAiSpeaking(true);
      utterance.onend = () => setAiSpeaking(false);
      
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const startInterview = async () => {
    await generateInterviewQuestions();
    setInterviewState('active');
    setTimeRemaining(interviewConfig.duration * 60);
    
    // Speak the first question
    setTimeout(() => {
      if (questions.length > 0) {
        speakQuestion(questions[0].question);
      }
    }, 1000);
  };

  const startVoiceRecording = () => {
    if (speechRecognitionRef.current && !isListening) {
      setIsListening(true);
      setVoiceTranscript('');
      speechRecognitionRef.current.start();
    }
  };

  const stopVoiceRecording = () => {
    if (speechRecognitionRef.current && isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
      
      // Combine voice transcript with current text response
      if (voiceTranscript.trim()) {
        const combinedResponse = currentResponse 
          ? `${currentResponse}\n\n[Voice Input]: ${voiceTranscript}`
          : voiceTranscript;
        handleResponseChange(combinedResponse);
        setVoiceTranscript('');
      }
    }
  };

  const handleResponseChange = (value) => {
    setCurrentResponse(value);
    const updatedResponses = [...userResponses];
    updatedResponses[currentQuestionIndex] = value;
    setUserResponses(updatedResponses);
  };

  const nextQuestion = () => {
    // Stop any current speech
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentResponse(userResponses[currentQuestionIndex + 1]);
      
      // Speak the next question after a short delay
      setTimeout(() => {
        speakQuestion(questions[currentQuestionIndex + 1].question);
      }, 500);
    } else {
      endInterview();
    }
  };

  const previousQuestion = () => {
    // Stop any current speech
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentResponse(userResponses[currentQuestionIndex - 1]);
    }
  };

  const endInterview = async () => {
    // Stop all media services
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    if (speechRecognitionRef.current && isListening) {
      speechRecognitionRef.current.stop();
    }
    
    setInterviewState('assessment');
    setLoading(true);
    
    try {
      // Get AI assessment
      const assessmentData = {
        userId: user.uid,
        interviewType: interviewConfig.interviewType,
        topic: interviewConfig.topic,
        difficulty: interviewConfig.difficulty,
        duration: interviewConfig.duration,
        interviewQuestions: questions.map(q => q.question),
        userResponses: userResponses.filter(r => r.trim() !== ''),
        interviewData: {
          totalQuestions: questions.length,
          answeredQuestions: userResponses.filter(r => r.trim() !== '').length,
          timeSpent: (interviewConfig.duration * 60) - timeRemaining,
          inputMethods: inputMethod,
          cameraUsed: cameraPermission,
          microphoneUsed: microphonePermission
        }
      };

      const aiAssessment = await progressService.getAIAssessment(assessmentData);
      
      // Save the interview session and assessment
      await progressService.saveInterviewAssessment(user.uid, {
        ...assessmentData,
        aiAssessment
      });

      setAssessment(aiAssessment);
      setInterviewState('completed');

    } catch (error) {
      console.error('Error processing interview assessment:', error);
      // Show basic completion without AI assessment
      setInterviewState('completed');
    } finally {
  // Setup Phase
  if (interviewState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Face-to-Face Interview
            </h1>
            <p className="text-gray-600 text-lg">
              AI-Powered Technical Interview with Voice & Video
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-2">Interview Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Topic:</span>
                  <span className="font-medium text-blue-600">{interviewConfig.topic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium text-green-600 capitalize">{interviewConfig.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-purple-600">{interviewConfig.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-orange-600 capitalize">{interviewConfig.interviewType}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-2">Features Available</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>AI Voice Questions</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Camera & Microphone</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Voice + Text Responses</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>AI Performance Analysis</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-800 mb-3">📋 Interview Process</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-semibold mb-2">🎤 Audio & Video Setup</h4>
                <ul className="space-y-1">
                  <li>• Camera and microphone permissions required</li>
                  <li>• AI will speak questions aloud</li>
                  <li>• Choose text typing or voice recording</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🤖 AI Assessment</h4>
                <ul className="space-y-1">
                  <li>• Comprehensive performance analysis</li>
                  <li>• Detailed feedback and recommendations</li>
                  <li>• Technical skills evaluation</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/mock-interviews')}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
            >
              Back to Setup
            </button>
            <button
              onClick={requestMediaPermissions}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold shadow-lg"
            >
              Start Interview Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Camera Check Phase
  if (interviewState === 'camera-check') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Camera & Microphone Setup
            </h1>
            <p className="text-gray-600">
              Please check your camera and microphone before starting the interview
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Camera Preview */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Camera Preview
              </h3>
              
              <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                {cameraPermission ? (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    className="w-full h-64 object-cover"
                    videoConstraints={{
                      width: 640,
                      height: 480,
                      facingMode: "user"
                    }}
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center">
                    <div className="text-white text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                      <p className="opacity-75">Camera access required</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                {cameraPermission ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 font-semibold">Camera Active</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-semibold">Camera Not Detected</span>
                  </>
                )}
              </div>
            </div>

            {/* Microphone & Settings */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Audio Settings
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Microphone Status</span>
                    {microphonePermission ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        ✓ Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        ✗ Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Response Input Method</h4>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="inputMethod"
                      value="text"
                      checked={inputMethod === 'text'}
                      onChange={(e) => setInputMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Text Only</div>
                      <div className="text-sm text-gray-600">Type your responses</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="inputMethod"
                      value="voice"
                      checked={inputMethod === 'voice'}
                      onChange={(e) => setInputMethod(e.target.value)}
                      className="mr-3"
                      disabled={!microphonePermission}
                    />
                    <div>
                      <div className="font-medium">Voice Only</div>
                      <div className="text-sm text-gray-600">Speak your responses</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="inputMethod"
                      value="both"
                      checked={inputMethod === 'both'}
                      onChange={(e) => setInputMethod(e.target.value)}
                      className="mr-3"
                      disabled={!microphonePermission}
                    />
                    <div>
                      <div className="font-medium">Voice + Text</div>
                      <div className="text-sm text-gray-600">Combine speaking and typing</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Tips for Best Results</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Ensure good lighting on your face</li>
                  <li>• Minimize background noise</li>
                  <li>• Speak clearly and at normal pace</li>
                  <li>• Look at the camera when speaking</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setInterviewState('setup')}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
            >
              Back
            </button>
            <button
              onClick={startInterview}
              disabled={!cameraPermission || !microphonePermission}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-colors font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

      const data = await response.json();
      
      if (data.success && data.questions) {
        // Convert MCQ questions to interview questions
        const interviewQuestions = data.questions.map((q, index) => ({
          id: index + 1,
          question: q.question,
          type: 'open-ended',
          expectedDuration: 3, // 3 minutes per question
          context: q.explanation
        }));

        // Add some general interview questions
        const generalQuestions = [
          {
            id: interviewQuestions.length + 1,
            question: `Tell me about your experience with ${interviewConfig.topic}`,
            type: 'experience',
            expectedDuration: 4
          },
          {
            id: interviewQuestions.length + 2,
            question: `What challenges have you faced while working with ${interviewConfig.topic} and how did you overcome them?`,
            type: 'problem-solving',
            expectedDuration: 5
          }
        ];

        setQuestions([...generalQuestions, ...interviewQuestions.slice(0, 6)]);
        setUserResponses(new Array(generalQuestions.length + 6).fill(''));
      } else {
        throw new Error('Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback questions
      setQuestions([
        {
          id: 1,
          question: `Tell me about your experience with ${interviewConfig.topic}`,
          type: 'experience',
          expectedDuration: 4
        },
        {
          id: 2,
          question: `What are the key principles of ${interviewConfig.topic}?`,
          type: 'technical',
          expectedDuration: 3
        },
        {
          id: 3,
          question: `How would you approach solving a complex problem in ${interviewConfig.topic}?`,
          type: 'problem-solving',
          expectedDuration: 5
        }
      ]);
      setUserResponses(new Array(3).fill(''));
    } finally {
      setLoading(false);
    }
  };

  const startInterview = () => {
    setInterviewState('active');
    setTimeRemaining(interviewConfig.duration * 60);
  };

  const handleResponseChange = (value) => {
    setCurrentResponse(value);
    const updatedResponses = [...userResponses];
    updatedResponses[currentQuestionIndex] = value;
    setUserResponses(updatedResponses);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentResponse(userResponses[currentQuestionIndex + 1]);
    } else {
      endInterview();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentResponse(userResponses[currentQuestionIndex - 1]);
    }
  };

  const endInterview = async () => {
    setInterviewState('assessment');
    setLoading(true);
    
    try {
      // Get AI assessment
      const assessmentData = {
        userId: user.uid,
        interviewType: interviewConfig.interviewType,
        topic: interviewConfig.topic,
        difficulty: interviewConfig.difficulty,
        duration: interviewConfig.duration,
        interviewQuestions: questions.map(q => q.question),
        userResponses: userResponses.filter(r => r.trim() !== ''),
        interviewData: {
          totalQuestions: questions.length,
          answeredQuestions: userResponses.filter(r => r.trim() !== '').length,
          timeSpent: (interviewConfig.duration * 60) - timeRemaining
        }
      };

      const aiAssessment = await progressService.getAIAssessment(assessmentData);
      
      // Save the interview session and assessment
      await progressService.saveInterviewAssessment(user.uid, {
        ...assessmentData,
        aiAssessment
      });

      setAssessment(aiAssessment);
      setInterviewState('completed');

    } catch (error) {
      console.error('Error processing interview assessment:', error);
      // Show basic completion without AI assessment
      setInterviewState('completed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 4.0) return 'text-green-600';
    if (score >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {interviewState === 'setup' ? 'Preparing your interview...' : 'Processing your assessment...'}
          </p>
        </div>
      </div>
    );
  // Interview Phase
  if (interviewState === 'interview') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-black bg-opacity-50 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">LIVE INTERVIEW</span>
              </div>
              <div className="text-gray-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-xl font-mono">
                ⏱️ {formatTime(timeRemaining)}
              </div>
              
              <button
                onClick={endInterview}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Camera and Status */}
            <div className="lg:col-span-1 space-y-6">
              {/* Camera Feed */}
              <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                <div className="p-3 bg-gray-800 border-b">
                  <h3 className="font-semibold flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Camera View
                  </h3>
                </div>
                <div className="relative">
                  {cameraPermission ? (
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      className="w-full h-48 object-cover"
                      videoConstraints={{
                        width: 640,
                        height: 480,
                        facingMode: "user"
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-800">
                      <span className="text-gray-400">Camera not available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Interview Progress */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
                  </svg>
                  Progress
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Questions Completed</span>
                    <span className="font-semibold">{responses.length}/{questions.length}</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(responses.length / questions.length) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Time Elapsed: {formatTime(interviewConfig.duration * 60 - timeRemaining)}</span>
                  </div>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1V9h3v7zM6 9v6a3 3 0 003 3h.5" />
                  </svg>
                  Audio Settings
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Voice Questions</span>
                    <button
                      onClick={() => setAiVoiceEnabled(!aiVoiceEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        aiVoiceEnabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                        aiVoiceEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Microphone</span>
                    <div className="flex items-center space-x-2">
                      {microphonePermission ? (
                        <span className="px-2 py-1 bg-green-600 rounded text-xs">ON</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-600 rounded text-xs">OFF</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Question and Response */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Question */}
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-600 rounded-full text-sm font-semibold">
                      Q{currentQuestionIndex + 1}
                    </span>
                    <span className="text-gray-400">
                      {questions[currentQuestionIndex]?.category || 'Technical'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (aiVoiceEnabled && 'speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex]?.question);
                        utterance.rate = 0.8;
                        speechSynthesis.speak(utterance);
                      }
                    }}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    title="Read question aloud"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M13 16h-1v-4h-1V9h3v7zM6 9v6a3 3 0 003 3h.5" />
                    </svg>
                  </button>
                </div>
                
                <div className="text-xl leading-relaxed mb-6">
                  {questions[currentQuestionIndex]?.question}
                </div>
                
                {questions[currentQuestionIndex]?.context && (
                  <div className="bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-300 mb-2">Context:</h4>
                    <p className="text-blue-100">{questions[currentQuestionIndex].context}</p>
                  </div>
                )}
              </div>

              {/* Response Area */}
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Your Response</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>Input Method:</span>
                    <span className="px-2 py-1 bg-gray-700 rounded capitalize">
                      {inputMethod}
                    </span>
                  </div>
                </div>

                {(inputMethod === 'text' || inputMethod === 'both') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type your answer:
                    </label>
                    <textarea
                      value={currentResponse}
                      onChange={(e) => setCurrentResponse(e.target.value)}
                      placeholder="Type your detailed response here..."
                      className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                )}

                {(inputMethod === 'voice' || inputMethod === 'both') && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-300">
                        Voice Recording:
                      </label>
                      <div className="text-sm text-gray-400">
                        {isRecording ? `Recording: ${formatTime(recordingTime)}` : 'Ready to record'}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={!microphonePermission}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                          isRecording 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isRecording ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <rect x="6" y="6" width="12" height="12" rx="1"/>
                            </svg>
                            <span>Stop Recording</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
                              <path d="M19 11v1a7 7 0 0 1-14 0v-1"/>
                              <line x1="12" y1="19" x2="12" y2="23"/>
                              <line x1="8" y1="23" x2="16" y2="23"/>
                            </svg>
                            <span>Start Recording</span>
                          </>
                        )}
                      </button>
                      
                      {audioBlob && (
                        <div className="flex items-center space-x-2">
                          <audio controls className="h-8">
                            <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                          </audio>
                          <button
                            onClick={() => setAudioBlob(null)}
                            className="p-1 text-red-500 hover:text-red-400"
                            title="Delete recording"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {speechTranscription && (
                      <div className="mt-3 p-3 bg-gray-700 border border-gray-600 rounded-lg">
                        <div className="text-sm text-gray-300 mb-1">Transcription:</div>
                        <div className="text-white">{speechTranscription}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    {currentResponse || speechTranscription ? (
                      <span className="text-green-400">Response ready</span>
                    ) : (
                      <span>Please provide your response</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    {currentQuestionIndex > 0 && (
                      <button
                        onClick={previousQuestion}
                        className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Previous
                      </button>
                    )}
                    
                    <button
                      onClick={nextQuestion}
                      disabled={!currentResponse && !speechTranscription}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                    >
                      {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assessment Phase
  if (interviewState === 'assessment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Analyzing Performance
            </h1>
            <p className="text-gray-600 text-lg">
              Our AI is evaluating your interview responses...
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-4">🤖 AI Assessment In Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-semibold mb-2">Analyzing:</h4>
                <ul className="space-y-1">
                  <li>• Technical accuracy and depth</li>
                  <li>• Communication clarity</li>
                  <li>• Problem-solving approach</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Generating:</h4>
                <ul className="space-y-1">
                  <li>• Detailed performance scores</li>
                  <li>• Personalized feedback</li>
                  <li>• Improvement recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default return (should not reach here)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Loading interview...</p>
      </div>
    </div>
  );
};
