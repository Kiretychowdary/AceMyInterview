// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION
// AI Interview Component - FLOW LOGIC WITH PDF UPLOAD & TEXT-TO-SPEECH

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/phi3';

export default function AIInterview() {
  // Interview state
  const [stage, setStage] = useState('setup'); // setup, interview, completed
  const [subject, setSubject] = useState('');
  const [resume, setResume] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [useFile, setUseFile] = useState(false);
  
  // Current question state
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  
  // Interview history
  const [answers, setAnswers] = useState([]);
  const [report, setReport] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const speechRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechRef.current = window.speechSynthesis;
    }
  }, []);

  // Speak text
  const speak = (text) => {
    if (!voiceEnabled || !speechRef.current) return;

    // Cancel any ongoing speech
    speechRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (speechRef.current) {
      speechRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setError(null);
    } else {
      setError('Please select a PDF file');
      setResumeFile(null);
    }
  };

  // Start interview
  const handleStart = async () => {
    if (!subject.trim()) {
      setError('Please provide subject');
      return;
    }

    if (!useFile && !resume.trim()) {
      setError('Please provide resume text or upload a PDF');
      return;
    }

    if (useFile && !resumeFile) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;

      if (useFile && resumeFile) {
        // Send as FormData with PDF file
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('resume', resumeFile);

        result = await axios.post(`${API_BASE}/start`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Send as JSON with text resume (or empty if optional)
        result = await axios.post(`${API_BASE}/start`, {
          subject,
          resume: resume.trim() || undefined
        });
      }

      setCurrentQuestion(result.data.question);
      setQuestionNumber(1);
      setStage('interview');

      // Speak the first question
      speak(result.data.question);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const handleSubmit = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await axios.post(`${API_BASE}/submit`, {
        subject,
        resume,
        answer: currentAnswer,
        questionNumber
      });

      // Save answer with score and feedback
      setAnswers([...answers, {
        questionNumber,
        question: currentQuestion,
        answer: currentAnswer,
        score: result.data.score,
        feedback: result.data.feedback
      }]);

      // Speak feedback
      speak(`You scored ${result.data.score} out of 10. ${result.data.feedback}`);

      // Check if we should continue or end
      if (questionNumber >= 5) {
        // End interview after 5 questions
        await endInterview([...answers, {
          questionNumber,
          question: currentQuestion,
          answer: currentAnswer,
          score: result.data.score,
          feedback: result.data.feedback
        }]);
      } else {
        // Show next question
        setCurrentQuestion(result.data.nextQuestion);
        setQuestionNumber(result.data.questionNumber);
        setCurrentAnswer('');

        // Speak next question after a short delay
        setTimeout(() => {
          speak(result.data.nextQuestion);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  // End interview
  const endInterview = async (finalAnswers) => {
    try {
      const result = await axios.post(`${API_BASE}/end`, {
        answers: finalAnswers,
        totalQuestions: 5
      });

      setReport(result.data.report);
      setStage('completed');
    } catch (err) {
      setError('Failed to generate report');
    }
  };

  // Restart interview
  const handleRestart = () => {
    stopSpeaking();
    setStage('setup');
    setSubject('');
    setResume('');
    setResumeFile(null);
    setUseFile(false);
    setCurrentQuestion('');
    setCurrentAnswer('');
    setQuestionNumber(0);
    setAnswers([]);
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 AI Interview Assistant
          </h1>
          <p className="text-gray-600">Dynamic Questions • Real-time Evaluation • Smart Scoring</p>
          
          {/* Voice Toggle */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                voiceEnabled 
                  ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                  : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
              }`}
            >
              {voiceEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
            </button>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold border-2 border-red-300 hover:bg-red-200"
              >
                ⏸️ Stop Speaking
              </button>
            )}
          </div>
        </div>

        {/* Setup Stage */}
        {stage === 'setup' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Setup Interview</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interview Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Full Stack Development, Data Structures"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Resume / Background (Optional)
                </label>
                
                {/* Toggle between text and file */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => { setUseFile(false); setResumeFile(null); }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      !useFile 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📝 Type Text
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUseFile(true); setResume(''); }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      useFile 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📄 Upload PDF
                  </button>
                </div>

                {!useFile ? (
                  <textarea
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    placeholder="Paste your resume or leave blank for general questions..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                    rows="6"
                  />
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {resumeFile && (
                      <p className="mt-2 text-sm text-green-600">✓ {resumeFile.name}</p>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg"
              >
                {loading ? 'Starting Interview...' : 'Start Interview'}
              </button>
            </div>
          </div>
        )}

        {/* Interview Stage */}
        {stage === 'interview' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Question {questionNumber}/5</h2>
              <span className="text-sm text-gray-500">{answers.length} answered</span>
            </div>

            {/* Current Question */}
            <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg relative">
              <p className="text-lg text-gray-800 font-medium">{currentQuestion}</p>
              {isSpeaking && (
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                    <span className="text-2xl">🔊</span>
                    <span className="text-sm font-semibold">Speaking...</span>
                  </div>
                </div>
              )}
              <button
                onClick={() => speak(currentQuestion)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                🔁 Repeat Question
              </button>
            </div>

            {/* Answer Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Answer
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                rows="6"
              />
            </div>

            {/* Previous Feedback */}
            {answers.length > 0 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Last Answer Feedback:</h3>
                <p className="text-sm text-gray-700">{answers[answers.length - 1].feedback}</p>
                <p className="text-sm font-bold text-green-600 mt-1">
                  Score: {answers[answers.length - 1].score}/10
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !currentAnswer.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg"
            >
              {loading ? 'Evaluating...' : questionNumber >= 5 ? 'Submit & Finish' : 'Submit Answer'}
            </button>
          </div>
        )}

        {/* Completed Stage */}
        {stage === 'completed' && report && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
              🎉 Interview Complete!
            </h2>

            {/* Overall Score */}
            <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {report.averageScore}/10
              </div>
              <p className="text-gray-600">{report.feedback}</p>
            </div>

            {/* Answer Review */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-bold text-gray-800">Your Answers:</h3>
              {report.answers.map((ans, idx) => (
                <div key={idx} className="p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-700">Q{ans.questionNumber}: {ans.question}</p>
                    <span className="text-lg font-bold text-blue-600">{ans.score}/10</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2"><strong>Your Answer:</strong> {ans.answer}</p>
                  <p className="text-sm text-green-600"><strong>Feedback:</strong> {ans.feedback}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleRestart}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg"
            >
              Start New Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
