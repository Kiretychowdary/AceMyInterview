// AI-POWERED FACE-TO-FACE INTERVIEW ROOM WITH ASSESSMENT
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { progressService } from '../services/ProgressService';
import { useNavigate, useLocation } from 'react-router-dom';

const FaceToFaceInterview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [interviewState, setInterviewState] = useState('setup'); // setup, active, completed, assessment
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [userResponses, setUserResponses] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes default
  const [isRecording, setIsRecording] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  // Interview configuration from navigation state
  const interviewConfig = location.state || {
    topic: 'Software Developer',
    difficulty: 'medium',
    duration: 30,
    interviewType: 'technical'
  };

  useEffect(() => {
    if (interviewState === 'setup') {
      generateInterviewQuestions();
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
          count: 8
        }),
      });

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
  }

  // Setup Phase
  if (interviewState === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Face-to-Face Interview Setup
          </h1>
          
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <p className="text-lg font-semibold text-blue-600">{interviewConfig.topic}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <p className="text-lg font-semibold text-green-600 capitalize">{interviewConfig.difficulty}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <p className="text-lg font-semibold text-purple-600">{interviewConfig.duration} minutes</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Questions</label>
                <p className="text-lg font-semibold text-orange-600">{questions.length} prepared</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <h3 className="font-semibold text-blue-800 mb-2">Interview Guidelines:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Answer each question thoughtfully and thoroughly</li>
              <li>• You can navigate between questions using the navigation buttons</li>
              <li>• The interview will be automatically assessed by AI upon completion</li>
              <li>• You'll receive detailed feedback and recommendations</li>
              <li>• Take your time - there's no rush, but mind the overall time limit</li>
            </ul>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/mock-interviews')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Setup
            </button>
            <button
              onClick={startInterview}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              disabled={questions.length === 0}
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Interview Phase
  if (interviewState === 'active') {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with timer and progress */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Interview in Progress
              </h2>
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-lg font-bold ${timeRemaining <= 300 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timeRemaining)}
              </div>
              <button
                onClick={endInterview}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                End Interview
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2">
            <div 
              className="bg-blue-600 h-2 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main interview content */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
                  {currentQuestion?.question}
                </h3>
                <div className="ml-4 text-sm text-gray-500">
                  ~{currentQuestion?.expectedDuration} min
                </div>
              </div>
              
              {currentQuestion?.type && (
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-4">
                  {currentQuestion.type.replace('-', ' ')}
                </div>
              )}
            </div>

            {/* Response area */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response:
              </label>
              <textarea
                value={currentResponse}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder="Type your answer here... Be detailed and specific."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-2 text-sm text-gray-500">
                Characters: {currentResponse.length} | Words: {currentResponse.split(' ').filter(w => w.length > 0).length}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Previous Question
              </button>

              <div className="text-center">
                <div className="text-sm text-gray-600">
                  Progress: {userResponses.filter(r => r.trim() !== '').length} / {questions.length} answered
                </div>
              </div>

              <button
                onClick={nextQuestion}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assessment Processing Phase
  if (interviewState === 'assessment') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Processing Your Interview</h2>
          <p className="text-gray-600 mb-4">Our AI is analyzing your responses and preparing detailed feedback...</p>
          <div className="text-sm text-gray-500">This may take a moment</div>
        </div>
      </div>
    );
  }

  // Completed Interview with Assessment
  if (interviewState === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Completed!</h1>
            <p className="text-gray-600">
              Congratulations! You've completed your {interviewConfig.topic} interview.
            </p>
            
            {assessment && (
              <div className="mt-6 flex justify-center">
                <div className="bg-blue-50 px-6 py-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {assessment.overallRating}/5.0
                  </div>
                  <div className="text-sm text-blue-800">Overall Rating</div>
                </div>
              </div>
            )}
          </div>

          {assessment && (
            <>
              {/* Detailed Scores */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Detailed Assessment</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {Object.entries(assessment.detailedScores || {}).map(([category, score]) => (
                    <div key={category} className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(score)} mb-2`}>
                        {score}/5.0
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Performance Insights */}
                {assessment.performanceInsights && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(assessment.performanceInsights).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-4 rounded-lg">
                          <div className="font-medium text-gray-800 capitalize mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-sm text-gray-600">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Strengths and Improvements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-xl font-semibold text-green-600 mb-4">Strengths</h3>
                  <ul className="space-y-2">
                    {(assessment.strengths || []).map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-xl font-semibold text-red-600 mb-4">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {(assessment.improvements || []).map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">!</span>
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h3 className="text-xl font-semibold text-blue-600 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {(assessment.recommendations || []).map((recommendation, index) => (
                    <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-500 mr-3 mt-1">💡</span>
                      <span className="text-gray-700">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              {assessment.nextSteps && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-xl font-semibold text-purple-600 mb-4">Next Steps</h3>
                  <ul className="space-y-2">
                    {assessment.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-500 mr-2 mt-1">{index + 1}.</span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {assessment.interviewReadiness && (
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                      <div className="font-semibold text-purple-800">Interview Readiness</div>
                      <div className="text-purple-700">{assessment.interviewReadiness}</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="space-y-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold mr-4"
              >
                View Dashboard
              </button>
              <button
                onClick={() => navigate('/mock-interviews')}
                className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Take Another Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FaceToFaceInterview;
