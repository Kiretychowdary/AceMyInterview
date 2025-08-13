// DASHBOARD TEST COMPONENT - Verify Complete Flow
import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { progressService } from '../services/ProgressService';

const DashboardTest = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generateSampleData = async () => {
    if (!user) {
      setResult('Please login first');
      return;
    }

    setLoading(true);
    try {
      // Generate sample MCQ session
      await progressService.saveMCQSession(user.uid, {
        topic: 'JavaScript',
        difficulty: 'medium',
        totalQuestions: 10,
        correctAnswers: 8,
        timeSpent: 600, // 10 minutes
        questions: [
          { question: 'What is closure in JavaScript?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 }
        ],
        answers: [
          { question: 'What is closure in JavaScript?', selectedAnswer: 'A', correctAnswer: 'A', isCorrect: true }
        ]
      });

      // Generate sample coding session
      await progressService.saveCodingSession(user.uid, {
        topic: 'algorithms',
        difficulty: 'medium',
        language: 'javascript',
        totalProblems: 3,
        solvedProblems: 2,
        timeSpent: 1800, // 30 minutes
        problems: [
          { title: 'Two Sum', difficulty: 'Easy' },
          { title: 'Binary Search', difficulty: 'Medium' },
          { title: 'Merge Intervals', difficulty: 'Hard' }
        ],
        solutions: [
          { problemId: 1, solved: true, code: 'function twoSum(){}' },
          { problemId: 2, solved: true, code: 'function binarySearch(){}' },
          { problemId: 3, solved: false, code: 'function mergeIntervals(){}' }
        ]
      });

      // Generate sample AI assessment
      const sampleAssessment = {
        overallRating: 4.2,
        detailedScores: {
          technicalKnowledge: 4.0,
          problemSolving: 4.5,
          communication: 3.8,
          codeQuality: 4.1
        },
        strengths: [
          'Strong problem-solving approach',
          'Good understanding of algorithms',
          'Clear communication style'
        ],
        improvements: [
          'Could improve on edge case handling',
          'Practice more system design concepts'
        ],
        recommendations: [
          'Practice advanced data structures',
          'Focus on system design patterns',
          'Work on explaining solutions step by step'
        ]
      };

      await progressService.saveInterviewAssessment(user.uid, {
        interviewType: 'technical',
        topic: 'Software Developer',
        difficulty: 'medium',
        duration: 30,
        interviewQuestions: [
          'Tell me about your JavaScript experience',
          'How would you optimize this code?',
          'Explain the concept of promises'
        ],
        userResponses: [
          'I have 3 years of experience with JavaScript...',
          'I would use memoization and reduce time complexity...',
          'Promises represent eventual completion of async operations...'
        ],
        aiAssessment: sampleAssessment
      });

      setResult('✅ Sample data generated successfully! Check your dashboard.');
    } catch (error) {
      console.error('Error generating sample data:', error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setResult(`✅ Backend connected: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Backend connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Testing Panel</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="space-y-2">
          <p>👤 User: {user ? `✅ ${user.email}` : '❌ Not logged in'}</p>
          <p>🎯 Frontend: ✅ http://localhost:5174</p>
          <p>🔧 Backend: Testing connection...</p>
          <p>🔥 Firebase: ✅ Configured</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        <div className="space-y-4">
          <button
            onClick={testApiConnection}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Backend Connection'}
          </button>
          
          <button
            onClick={generateSampleData}
            disabled={loading || !user}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Sample Dashboard Data'}
          </button>
          
          <a
            href="/dashboard"
            className="block w-full px-6 py-3 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700"
          >
            Open Dashboard
          </a>
        </div>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Test Result:</h3>
          <pre className="whitespace-pre-wrap text-sm bg-white p-4 rounded border overflow-auto">
            {result}
          </pre>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-yellow-700">
          <li>Make sure you're logged in</li>
          <li>Test backend connection first</li>
          <li>Generate sample data to populate dashboard</li>
          <li>View your dashboard to see progress tracking</li>
          <li>Try taking actual interviews to see real-time updates</li>
        </ol>
      </div>
    </div>
  );
};

export default DashboardTest;
