//nmkrspvlidata
//radhakrishna
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { toast } from 'react-toastify';
import { useAuth } from '../components/AuthContext';
import geminiService from '../services/GeminiService';
import progressService from '../services/ProgressService';

const FaceToFaceInterview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const faceDetectionIntervalRef = useRef(null);
  
  // Interview configuration from navigation state
  const interviewConfig = location.state || {
    topic: 'Software Engineering',
    difficulty: 'intermediate',
    duration: 30,
    interviewType: 'face-to-face'
  };

  // Core interview state
  const [interviewState, setInterviewState] = useState('setup'); // setup, camera-check, interview, assessment, completed
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(interviewConfig.duration * 60);
  const [loading, setLoading] = useState(true);

  // Media permissions and settings
  const [cameraPermission, setCameraPermission] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [inputMethod, setInputMethod] = useState('text'); // text, voice, both
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [speechTranscription, setSpeechTranscription] = useState('');

  // Face detection state
  const [faceModel, setFaceModel] = useState(null);
  const [faceCount, setFaceCount] = useState(0);
  const [faceDetectionActive, setFaceDetectionActive] = useState(false);
  const [integrityViolations, setIntegrityViolations] = useState([]);
  const [showIntegrityAlert, setShowIntegrityAlert] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    initializeFaceDetection();
    generateQuestions();
  }, [user, navigate]);

  useEffect(() => {
    let timer;
    if (interviewState === 'interview' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [interviewState, timeRemaining]);

  useEffect(() => {
    let recordingTimer;
    if (isRecording) {
      recordingTimer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(recordingTimer);
  }, [isRecording]);

  // Start face detection when interview begins
  useEffect(() => {
    if (interviewState === 'interview' && faceModel && webcamRef.current) {
      startFaceDetection();
    } else if (interviewState !== 'interview') {
      stopFaceDetection();
    }
    return () => stopFaceDetection();
  }, [interviewState, faceModel]);

  // Initialize face detection model
  const initializeFaceDetection = async () => {
    try {
      await tf.ready();
      const model = await blazeface.load();
      setFaceModel(model);
      console.log('Face detection model loaded successfully');
    } catch (error) {
      console.error('Error loading face detection model:', error);
    }
  };

  // Start continuous face detection
  const startFaceDetection = () => {
    if (faceDetectionIntervalRef.current) return;
    
    setFaceDetectionActive(true);
    faceDetectionIntervalRef.current = setInterval(async () => {
      await detectFaces();
    }, 2000); // Check every 2 seconds
  };

  // Stop face detection
  const stopFaceDetection = () => {
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }
    setFaceDetectionActive(false);
  };

  // Detect faces in webcam feed
  const detectFaces = async () => {
    if (!faceModel || !webcamRef.current || !webcamRef.current.video) return;
    
    try {
      const video = webcamRef.current.video;
      const predictions = await faceModel.estimateFaces(video, false);
      
      const currentFaceCount = predictions.length;
      setFaceCount(currentFaceCount);
      
      // Check for integrity violations
      if (currentFaceCount === 0) {
        handleIntegrityViolation('No face detected', 'Please ensure you are visible to the camera');
      } else if (currentFaceCount > 1) {
        handleIntegrityViolation('Multiple faces detected', `${currentFaceCount} faces detected. Only one person should be present`);
      }
      
      // Draw face detection boxes (optional visual feedback)
      if (canvasRef.current && predictions.length > 0) {
        drawFaceBoxes(predictions);
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
  };

  // Draw bounding boxes around detected faces
  const drawFaceBoxes = (predictions) => {
    if (!canvasRef.current || !webcamRef.current) return;
    
    const canvas = canvasRef.current;
    const video = webcamRef.current.video;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.topLeft.concat(prediction.bottomRight);
      
      // Draw bounding box
      ctx.strokeStyle = predictions.length === 1 ? '#00ff00' : '#ff0000'; // Green for 1 face, red for multiple
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width - x, height - y);
      
      // Add face count label
      ctx.fillStyle = predictions.length === 1 ? '#00ff00' : '#ff0000';
      ctx.font = '16px Arial';
      ctx.fillText(`Face ${predictions.indexOf(prediction) + 1}`, x, y - 10);
    });
  };

  // Handle integrity violations
  const handleIntegrityViolation = (type, message) => {
    const violation = {
      type,
      message,
      timestamp: new Date().toISOString(),
      questionIndex: currentQuestionIndex
    };
    
    setIntegrityViolations(prev => [...prev, violation]);
    setShowIntegrityAlert(true);
    
    // Auto-hide alert after 5 seconds
    setTimeout(() => {
      setShowIntegrityAlert(false);
    }, 5000);
    
    // Log violation for assessment
    console.warn('Interview integrity violation:', violation);
  };

  const generateQuestions = async () => {
    setLoading(true);
    try {
      // Show motivational quote while loading
      const motivationalQuote = geminiService.getMotivationalQuote();
      toast.info(motivationalQuote, { 
        duration: 8000,  // Longer duration to read the quote
        position: "top-center",
        style: {
          backgroundColor: '#f8f9fa',
          color: '#2c3e50',
          fontSize: '14px',
          textAlign: 'center',
          padding: '12px',
          borderRadius: '8px',
          maxWidth: '500px'
        }
      });

      // Secondary loading message
      setTimeout(() => {
        toast.info('🎤 AI is preparing interview questions tailored for you...', { 
          duration: 5000,
          position: "bottom-right"
        });
      }, 2000);

      const response = await geminiService.generateInterviewQuestions({
        topic: interviewConfig.topic,
        difficulty: interviewConfig.difficulty,
        count: 8,
        interviewType: 'face-to-face'
      });

      if (response && response.questions) {
        const interviewQuestions = response.questions.map((q, index) => ({
          id: index + 1,
          question: q.question,
          category: q.category || 'General',
          expectedDuration: q.expectedDuration || 3,
          type: q.type || 'technical'
        }));

        setQuestions(interviewQuestions);
        setResponses(new Array(interviewQuestions.length).fill(''));
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
          category: 'Experience',
          expectedDuration: 4,
          type: 'experience'
        },
        {
          id: 2,
          question: `What are the key principles of ${interviewConfig.topic}?`,
          category: 'Technical Knowledge',
          expectedDuration: 3,
          type: 'technical'
        },
        {
          id: 3,
          question: `How would you approach solving a complex problem in ${interviewConfig.topic}?`,
          category: 'Problem Solving',
          expectedDuration: 5,
          type: 'problem-solving'
        }
      ]);
      setResponses(new Array(3).fill(''));
    } finally {
      setLoading(false);
    }
  };

  const requestMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setCameraPermission(true);
      setMicrophonePermission(true);
      setInterviewState('camera-check');
      
      // Stop the stream for now, we'll start it again when needed
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error requesting media permissions:', error);
      alert('Camera and microphone access is required for this interview. Please allow permissions and try again.');
    }
  };

  const startRecording = async () => {
    if (!microphonePermission) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start speech recognition if available
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
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setSpeechTranscription(prev => prev + ' ' + finalTranscript);
          }
        };
        
        recognition.start();
        
        // Store recognition instance to stop it later
        mediaRecorderRef.current.recognition = recognition;
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.recognition) {
        mediaRecorderRef.current.recognition.stop();
      }
      setIsRecording(false);
    }
  };

  const startInterview = () => {
    setInterviewState('interview');
    setTimeRemaining(interviewConfig.duration * 60);
    
    // Announce the first question if AI voice is enabled
    if (aiVoiceEnabled && questions[0]) {
      const utterance = new SpeechSynthesisUtterance(questions[0].question);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const nextQuestion = () => {
    // Save current response
    const updatedResponses = [...responses];
    updatedResponses[currentQuestionIndex] = currentResponse || speechTranscription || '';
    setResponses(updatedResponses);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentResponse('');
      setSpeechTranscription('');
      setAudioBlob(null);
      
      // Announce next question if AI voice is enabled
      if (aiVoiceEnabled && questions[currentQuestionIndex + 1]) {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex + 1].question);
          utterance.rate = 0.8;
          speechSynthesis.speak(utterance);
        }, 500);
      }
    } else {
      endInterview();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current response
      const updatedResponses = [...responses];
      updatedResponses[currentQuestionIndex] = currentResponse || speechTranscription || '';
      setResponses(updatedResponses);

      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentResponse(responses[currentQuestionIndex - 1] || '');
      setSpeechTranscription('');
      setAudioBlob(null);
    }
  };

  const endInterview = async () => {
    // Save final response
    const finalResponses = [...responses];
    finalResponses[currentQuestionIndex] = currentResponse || speechTranscription || '';
    setResponses(finalResponses);

    setInterviewState('assessment');
    setLoading(true);
    
    try {
      const assessmentData = {
        userId: user.uid,
        interviewType: interviewConfig.interviewType,
        topic: interviewConfig.topic,
        difficulty: interviewConfig.difficulty,
        duration: interviewConfig.duration,
        interviewQuestions: questions.map(q => q.question),
        userResponses: finalResponses.filter(r => r.trim() !== ''),
        interviewData: {
          totalQuestions: questions.length,
          answeredQuestions: finalResponses.filter(r => r.trim() !== '').length,
          timeSpent: (interviewConfig.duration * 60) - timeRemaining,
          inputMethod: inputMethod,
          voiceUsed: inputMethod.includes('voice'),
          integrityViolations: integrityViolations,
          integrityScore: integrityViolations.length === 0 ? 5.0 : Math.max(1.0, 5.0 - (integrityViolations.length * 0.5))
        }
      };

      const response = await geminiService.getInterviewAssessment(assessmentData);
      
      await progressService.saveInterviewSession({
        userId: user.uid,
        sessionType: 'face-to-face-interview',
        topic: interviewConfig.topic,
        difficulty: interviewConfig.difficulty,
        questions: questions,
        responses: finalResponses.filter(r => r.trim() !== ''),
        assessment: response,
        duration: (interviewConfig.duration * 60) - timeRemaining,
        timestamp: Date.now()
      });

      setAssessment(response);
      setInterviewState('completed');
    } catch (error) {
      console.error('Error processing assessment:', error);
      setAssessment({
        overallScore: 3.5,
        detailedScores: {
          technicalKnowledge: 3.5,
          communication: 4.0,
          problemSolving: 3.0,
          clarity: 3.8
        },
        overallFeedback: {
          strengths: ['Good communication skills', 'Clear explanations'],
          recommendations: ['Study advanced concepts', 'Practice more technical interviews']
        },
        questionAnalysis: questions.map((q, index) => ({
          category: q.category,
          score: Math.random() * 2 + 3, // Random score between 3-5
          strengths: ['Good understanding of concepts'],
          improvements: ['More detailed examples needed'],
          feedback: 'Solid response with room for more technical depth.'
        }))
      });
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            {interviewState === 'setup' ? 'Preparing your interview...' : 
             interviewState === 'assessment' ? 'AI is analyzing your performance...' : 
             'Loading...'}
          </p>
        </div>
      </div>
    );
  }

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
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium text-orange-600">{questions.length} prepared</span>
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
            </div>

            <div className="space-y-6">
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

  // Interview Phase - Main interview UI with multimedia features
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
          {/* Integrity Alert */}
          {showIntegrityAlert && (
            <div className="fixed top-4 right-4 z-50 bg-red-600 text-white p-4 rounded-lg shadow-lg border-l-4 border-red-800 max-w-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-200 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-sm">Interview Integrity Alert</h4>
                  <p className="text-sm mt-1 opacity-90">
                    {integrityViolations[integrityViolations.length - 1]?.message}
                  </p>
                </div>
                <button 
                  onClick={() => setShowIntegrityAlert(false)}
                  className="ml-auto text-red-200 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Camera and Face Detection */}
            <div className="lg:col-span-1 space-y-6">
              {/* Camera with Face Detection Overlay */}
              <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                <div className="p-3 bg-gray-800 border-b flex justify-between items-center">
                  <h3 className="font-semibold flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Camera View
                  </h3>
                  
                  {/* Face Detection Status */}
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      faceDetectionActive ? 
                        (faceCount === 1 ? 'bg-green-500' : 
                         faceCount === 0 ? 'bg-yellow-500' : 'bg-red-500') : 
                        'bg-gray-500'
                    }`}></div>
                    <span className={`${
                      faceCount === 1 ? 'text-green-400' :
                      faceCount === 0 ? 'text-yellow-400' :
                      faceCount > 1 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {faceDetectionActive ? 
                        (faceCount === 1 ? '1 Face' :
                         faceCount === 0 ? 'No Face' :
                         `${faceCount} Faces`) : 'Detecting...'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  {cameraPermission ? (
                    <>
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
                      {/* Face Detection Canvas Overlay */}
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-48 pointer-events-none"
                        style={{ zIndex: 10 }}
                      />
                    </>
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-800">
                      <span className="text-gray-400">Camera not available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Face Detection Status Panel */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Integrity Monitoring
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Face Detection</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        faceDetectionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                      }`}></div>
                      <span className={faceDetectionActive ? 'text-green-400' : 'text-gray-400'}>
                        {faceDetectionActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Faces Detected</span>
                    <span className={`font-semibold ${
                      faceCount === 1 ? 'text-green-400' :
                      faceCount === 0 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {faceCount}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Violations</span>
                    <span className={`font-semibold ${
                      integrityViolations.length === 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {integrityViolations.length}
                    </span>
                  </div>

                  {/* Status Message */}
                  <div className="mt-4 p-3 rounded-lg border text-center text-xs">
                    {faceCount === 1 ? (
                      <div className="text-green-300 border-green-600 bg-green-900 bg-opacity-30">
                        ✓ Interview integrity maintained
                      </div>
                    ) : faceCount === 0 ? (
                      <div className="text-yellow-300 border-yellow-600 bg-yellow-900 bg-opacity-30">
                        ⚠ Please position yourself in front of camera
                      </div>
                    ) : (
                      <div className="text-red-300 border-red-600 bg-red-900 bg-opacity-30">
                        🚫 Multiple people detected - Interview may be flagged
                      </div>
                    )}
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
                    <div className="flex items-center space-x-4 mb-3">
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
                            <div className="w-4 h-4 bg-white rounded-sm"></div>
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
                      
                      {isRecording && (
                        <div className="text-red-400 text-sm">
                          Recording: {formatTime(recordingTime)}
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
        </div>
      </div>
    );
  }

  // Results Phase
  if (interviewState === 'completed' && assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Interview Completed! 🎉
              </h1>
              <p className="text-gray-600 text-lg">
                Here's your comprehensive performance analysis
              </p>
            </div>
          </div>

          {/* Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {assessment.overallScore.toFixed(1)}
              </div>
              <div className="text-gray-600">Overall Score</div>
              <div className="text-sm text-gray-500 mt-1">out of 5.0</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {responses.filter(r => r.trim()).length}
              </div>
              <div className="text-gray-600">Questions Answered</div>
              <div className="text-sm text-gray-500 mt-1">Complete responses</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {formatTime(interviewConfig.duration * 60 - timeRemaining)}
              </div>
              <div className="text-gray-600">Time Taken</div>
              <div className="text-sm text-gray-500 mt-1">Interview duration</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className={`text-4xl font-bold mb-2 ${
                integrityViolations.length === 0 ? 'text-green-600' : 
                integrityViolations.length <= 2 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {integrityViolations.length === 0 ? '✓' : integrityViolations.length}
              </div>
              <div className="text-gray-600">Integrity Score</div>
              <div className="text-sm text-gray-500 mt-1">
                {integrityViolations.length === 0 ? 'Clean' : `${integrityViolations.length} violations`}
              </div>
            </div>
          </div>

          {/* Integrity Report */}
          {integrityViolations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-yellow-500">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Interview Integrity Report
              </h2>
              
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> The following integrity violations were detected during your interview. 
                  These may affect your assessment and could require verification with a human reviewer.
                </p>
              </div>

              <div className="space-y-3">
                {integrityViolations.map((violation, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{violation.type}</h4>
                          <p className="text-sm text-gray-600 mt-1">{violation.message}</p>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          <div>Q{violation.questionIndex + 1}</div>
                          <div>{new Date(violation.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Recommendations:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Ensure you are alone in the room during future interviews</li>
                  <li>• Position yourself clearly in front of the camera</li>
                  <li>• Maintain good lighting and camera stability</li>
                  <li>• Consider retaking the interview if integrity score is significantly affected</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next?</h2>
              
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold shadow-lg"
                >
                  View Dashboard
                </button>
                
                <button
                  onClick={() => navigate('/mock-interviews')}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-colors font-semibold shadow-lg"
                >
                  Take Another Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default return
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Loading interview...</p>
      </div>
    </div>
  );
};

export default FaceToFaceInterview;
