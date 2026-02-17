import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AIInterview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Interview State
  const [stage, setStage] = useState('config'); // config, intro, interview, evaluation, report
  const [sessionId, setSessionId] = useState(null);
  const [config, setConfig] = useState({
    role: '',
    difficulty: 'medium',
    topic: '',
    totalQuestions: 5
  });
  
  // Interview Progress
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef(null);
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Timer for question
  useEffect(() => {
    if (stage === 'interview' && currentQuestion) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, currentQuestion]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Interview
  const handleStartInterview = async () => {
    if (!config.role.trim()) {
      toast.error('Please enter the job role');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/interview/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest',
          ...config
        })
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setStage('intro');
        toast.success('Interview session created!');
      } else {
        throw new Error(data.error || 'Failed to start interview');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Begin Interview (after intro)
  const handleBeginInterview = async () => {
    setStage('interview');
    await fetchNextQuestion();
  };

  // Fetch Next Question
  const fetchNextQuestion = async () => {
    setIsLoading(true);
    setTimeSpent(0);
    try {
      const response = await fetch(`${API_BASE}/api/interview/next-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();
      if (data.success) {
        if (data.completed) {
          // All questions answered, get final report
          await fetchFinalReport();
        } else {
          setCurrentQuestion(data.question);
          setQuestionNumber(data.question.number);
          setCurrentAnswer('');
          setEvaluation(null);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch question');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/interview/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionNumber,
          answer: currentAnswer,
          timeSpent
        })
      });

      const data = await response.json();
      if (data.success) {
        setEvaluation(data.evaluation);
        setStage('evaluation');
        toast.success(`Answer evaluated: ${data.evaluation.score}/10`);
      } else {
        throw new Error(data.error || 'Failed to evaluate answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Continue to Next Question
  const handleContinue = async () => {
    setStage('interview');
    await fetchNextQuestion();
  };

  // Fetch Final Report
  const fetchFinalReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/interview/final-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();
      if (data.success) {
        setFinalReport(data);
        setStage('report');
        toast.success('Interview completed!');
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Configuration Stage
  const renderConfig = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Interview</h2>
          <p className="text-gray-600">Configure your personalized interview session</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Role / Position *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
              value={config.role}
              onChange={(e) => setConfig({...config, role: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Focus Area / Topic (Optional)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="e.g., React, Python, System Design, Leadership"
              value={config.topic}
              onChange={(e) => setConfig({...config, topic: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setConfig({...config, difficulty: level})}
                  className={`px-4 py-3 rounded-lg font-medium transition ${
                    config.difficulty === level
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Questions
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={config.totalQuestions}
              onChange={(e) => setConfig({...config, totalQuestions: parseInt(e.target.value)})}
            >
              <option value={3}>3 Questions (~10 min)</option>
              <option value={5}>5 Questions (~15 min)</option>
              <option value={7}>7 Questions (~20 min)</option>
              <option value={10}>10 Questions (~30 min)</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Powered by AI</p>
                <p>All questions and evaluations are generated in real-time by our AI model based on your preferences. No predefined questions.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={isLoading || !config.role.trim()}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Session...
              </span>
            ) : (
              'Start Interview'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Render Introduction Stage
  const renderIntro = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Session Ready</h2>
          <p className="text-gray-600">Session ID: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{sessionId}</code></p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Interview Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="font-semibold text-gray-900">{config.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Difficulty</p>
                <p className="font-semibold text-gray-900 capitalize">{config.difficulty}</p>
              </div>
              {config.topic && (
                <div>
                  <p className="text-sm text-gray-600">Focus Area</p>
                  <p className="font-semibold text-gray-900">{config.topic}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Questions</p>
                <p className="font-semibold text-gray-900">{config.totalQuestions}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Before You Begin
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Find a quiet place where you won't be interrupted</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Take your time to think before answering each question</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Provide detailed answers with specific examples when possible</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Each answer will be evaluated by AI and you'll receive immediate feedback</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You can take breaks between questions if needed</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-3">📝 Self-Introduction Tips</h3>
            <p className="text-sm text-purple-800 mb-3">
              Your first question will be about your professional background. Consider including:
            </p>
            <ul className="space-y-1 text-sm text-purple-800">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Your current role and experience</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Key skills and expertise</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Notable achievements or projects</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Why you're interested in this role</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStage('config')}
            className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Configuration
          </button>
          <button
            onClick={handleBeginInterview}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition shadow-md hover:shadow-lg"
          >
            {isLoading ? 'Loading...' : 'Begin Interview'}
          </button>
        </div>
      </div>
    </div>
  );

  // Render Interview Stage
  const renderInterview = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Question {questionNumber} of {config.totalQuestions}</h2>
              <p className="text-blue-100 text-sm mt-1">{config.role} Interview</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatTime(timeSpent)}</div>
              <p className="text-blue-100 text-sm">Time</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-800 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / config.totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600 font-medium">AI is generating your next question...</p>
            </div>
          ) : currentQuestion ? (
            <>
              <div className="mb-6">
                <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {currentQuestion.category}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 leading-relaxed mb-4">
                  {currentQuestion.text}
                </h3>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Answer
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-[200px] resize-y"
                  placeholder="Type your answer here... Take your time and provide detailed responses."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                  <span>{currentAnswer.length} characters</span>
                  <span>Minimum 50 characters recommended</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isLoading || !currentAnswer.trim() || currentAnswer.length < 20}
                  className="flex-1 bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Answer
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  // Render Evaluation Stage
  const renderEvaluation = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${
          evaluation.score >= 8 ? 'bg-gradient-to-r from-green-600 to-green-700' :
          evaluation.score >= 6 ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' :
          'bg-gradient-to-r from-red-600 to-red-700'
        } text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Question {questionNumber} Evaluated</h2>
              <p className="text-sm opacity-90 mt-1">{currentQuestion?.category}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold">{evaluation.score}</div>
              <p className="text-sm opacity-90">out of 10</p>
            </div>
          </div>
        </div>

        {/* Evaluation Content */}
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Question</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{currentQuestion?.text}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Answer</h3>
            <p className="text-gray-700 bg-blue-50 p-4 rounded-lg whitespace-pre-wrap">{currentAnswer}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Strengths
            </h3>
            <ul className="space-y-2">
              {evaluation.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start text-green-800">
                  <span className="mr-2 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {evaluation.improvements && evaluation.improvements.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {evaluation.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start text-yellow-800">
                    <span className="mr-2 mt-1">→</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">AI Feedback</h3>
            <p className="text-blue-800">{evaluation.feedback}</p>
          </div>

          {evaluation.keyPointsCovered && evaluation.keyPointsCovered.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">Key Points Covered</h3>
              <div className="flex flex-wrap gap-2">
                {evaluation.keyPointsCovered.map((point, idx) => (
                  <span key={idx} className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {point}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition shadow-md hover:shadow-lg flex items-center justify-center"
            >
              {questionNumber < config.totalQuestions ? (
                <>
                  Next Question
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              ) : (
                <>
                  View Final Report
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Final Report Stage
  const renderReport = () => (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`p-8 ${
          finalReport.report.overallScore >= 8 ? 'bg-gradient-to-r from-green-600 to-green-700' :
          finalReport.report.overallScore >= 6 ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' :
          'bg-gradient-to-r from-orange-600 to-orange-700'
        } text-white`}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-2">Interview Complete!</h1>
            <p className="text-xl opacity-90">Overall Performance</p>
            <div className="text-6xl font-bold mt-4">{finalReport.report.overallScore}/10</div>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-8 space-y-8">
          {/* Interview Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Interview Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Position</p>
                <p className="font-bold text-gray-900">{finalReport.interviewDetails.role}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Difficulty</p>
                <p className="font-bold text-gray-900 capitalize">{finalReport.interviewDetails.difficulty}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Questions</p>
                <p className="font-bold text-gray-900">{finalReport.interviewDetails.totalQuestions}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Duration</p>
                <p className="font-bold text-gray-900">{Math.floor(finalReport.interviewDetails.duration / 60)} min</p>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {finalReport.report.categoryBreakdown && finalReport.report.categoryBreakdown.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Performance by Category</h2>
              <div className="space-y-3">
                {finalReport.report.categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cat.category}</h3>
                        <p className="text-sm text-gray-600">{cat.questionsCount} {cat.questionsCount === 1 ? 'question' : 'questions'}</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{cat.score}/10</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          cat.score >= 8 ? 'bg-green-500' :
                          cat.score >= 6 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(cat.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Strengths
            </h2>
            <ul className="space-y-3">
              {finalReport.report.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start text-green-800">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold">{idx + 1}</span>
                  </span>
                  <span className="flex-1">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-yellow-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Areas for Improvement
            </h2>
            <ul className="space-y-3">
              {finalReport.report.improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start text-yellow-800">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold">{idx + 1}</span>
                  </span>
                  <span className="flex-1">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Recommendations
            </h2>
            <ul className="space-y-3">
              {finalReport.report.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start text-blue-800">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold">{idx + 1}</span>
                  </span>
                  <span className="flex-1">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-purple-900 mb-4">Overall Assessment</h2>
            <p className="text-purple-800 leading-relaxed whitespace-pre-wrap">{finalReport.report.summary}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 rounded-lg hover:bg-gray-300 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setStage('config');
                setSessionId(null);
                setCurrentQuestion(null);
                setCurrentAnswer('');
                setQuestionNumber(0);
                setEvaluation(null);
                setFinalReport(null);
                setTimeSpent(0);
              }}
              className="flex-1 bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
            >
              Start New Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">AI-Powered • Real-time Evaluation</span>
          </div>
        </div>

        {/* Main Content */}
        {stage === 'config' && renderConfig()}
        {stage === 'intro' && renderIntro()}
        {stage === 'interview' && renderInterview()}
        {stage === 'evaluation' && renderEvaluation()}
        {stage === 'report' && renderReport()}
      </div>
    </div>
  );
};

export default AIInterview;
