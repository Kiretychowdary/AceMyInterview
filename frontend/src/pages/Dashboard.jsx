// USER PROGRESS DASHBOARD - COMPREHENSIVE TRACKING SYSTEM
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalMCQAttempts: 0,
    totalCodingAttempts: 0,
    totalFaceToFaceInterviews: 0,
    mcqAccuracy: 0,
    codingSuccess: 0,
    recentActivity: [],
    topicProgress: [],
    difficultyProgress: [],
    monthlyProgress: [],
    overallRating: 0,
    strengths: [],
    improvements: [],
    recommendations: []
  });
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');

  useEffect(() => {
    // Only fetch data when auth is complete and user exists
    if (!authLoading && user?.uid) {
      fetchDashboardData();
    }
  }, [user, selectedTimeframe, authLoading]);

  const fetchDashboardData = async () => {
    if (!user?.uid) {
      console.warn('No user ID available, skipping dashboard data fetch');
      return;
    }

    setDataLoading(true);
    try {
      const userId = user.uid;
      console.log('📊 Fetching dashboard data for user:', userId);

      // Fetch data from MongoDB backend API instead of Firestore
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      let recentSessions = [];
      let assessments = [];
      
      try {
        // Fetch interview history from MongoDB backend
        const historyResponse = await fetch(`${API_BASE}/api/interview/history/${userId}?limit=20`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          recentSessions = historyData.sessions || [];
          console.log('✅ Fetched sessions from backend:', recentSessions.length);
          
          // Transform backend data to match expected format
          recentSessions = recentSessions.map(session => ({
            id: session.sessionId,
            type: session.interviewType,
            topic: session.topic,
            difficulty: session.difficulty,
            totalQuestions: session.totalQuestions,
            correctAnswers: session.answeredQuestions,
            totalProblems: session.totalQuestions,
            solvedProblems: session.answeredQuestions,
            timestamp: session.createdAt,
            assessment: session.assessment
          }));
          
          // Separate face-to-face interviews as assessments
          assessments = recentSessions.filter(s => s.type === 'face-to-face');
        } else {
          console.warn('Backend returned error:', historyResponse.status);
        }
      } catch (error) {
        console.warn('⚠️ Backend not available, using empty data:', error);
      }

      // Process and aggregate data
      const processedData = processProgressData({}, recentSessions, assessments);
      setDashboardData(processedData);
      console.log('✅ Dashboard data loaded successfully');

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Show user-friendly message for index requirement
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      if (errorMessage.indexOf('requires an index') !== -1 || errorMessage.indexOf('index') !== -1) {
        console.info('Firestore indexes are being created. Dashboard will show demo data until indexes are ready.');
      }
      
      // Provide fallback data structure with helpful messages
      setDashboardData({
        totalMCQAttempts: 0,
        totalCodingAttempts: 0,
        totalFaceToFaceInterviews: 0,
        mcqAccuracy: 0,
        codingSuccess: 0,
        recentActivity: [],
        topicProgress: [
          { topic: 'JavaScript', attempts: 0, successRate: 0 },
          { topic: 'React', attempts: 0, successRate: 0 },
          { topic: 'System Design', attempts: 0, successRate: 0 }
        ],
        difficultyProgress: [
          { level: 'Easy', count: 0 },
          { level: 'Medium', count: 0 },
          { level: 'Hard', count: 0 }
        ],
        monthlyProgress: generateMonthlyProgress([]),
        overallRating: 0,
        strengths: ['Start taking interviews to see your strengths here!'],
        improvements: ['Complete some practice sessions for personalized feedback'],
        recommendations: [
          'Begin with MCQ questions to build confidence',
          'Practice coding problems to improve technical skills',
          'Try face-to-face interviews for comprehensive assessment'
        ]
      });
    } finally {
      setDataLoading(false);
    }
  };

  const processProgressData = (progressData, sessions, assessments) => {
    // Add safety checks for input parameters
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const safeAssessments = Array.isArray(assessments) ? assessments : [];
    
    const mcqSessions = safeSessions.filter(s => s?.type === 'mcq');
    const codingSessions = safeSessions.filter(s => s?.type === 'coding');
    const faceToFaceSessions = safeAssessments;

    // If no data exists, provide demo data to showcase dashboard features
    if (safeSessions.length === 0 && safeAssessments.length === 0) {
      return {
        totalMCQAttempts: 0,
        totalCodingAttempts: 0,
        totalFaceToFaceInterviews: 0,
        mcqAccuracy: 0,
        codingSuccess: 0,
        recentActivity: [],
        topicProgress: [
          { topic: 'JavaScript', attempts: 0, successRate: 0 },
          { topic: 'React', attempts: 0, successRate: 0 },
          { topic: 'System Design', attempts: 0, successRate: 0 }
        ],
        difficultyProgress: [
          { level: 'Easy', count: 0 },
          { level: 'Medium', count: 0 },
          { level: 'Hard', count: 0 }
        ],
        monthlyProgress: generateMonthlyProgress([]),
        overallRating: 0,
        strengths: ['Complete some interviews to see your strengths!'],
        improvements: ['Take practice interviews to get personalized feedback'],
        recommendations: [
          'Start with MCQ questions to build confidence',
          'Practice coding problems daily',
          'Try a face-to-face interview for comprehensive feedback'
        ]
      };
    }

    // Calculate MCQ accuracy
    const totalMCQQuestions = mcqSessions.reduce((sum, session) => 
      sum + (session.totalQuestions || 0), 0);
    const correctMCQAnswers = mcqSessions.reduce((sum, session) => 
      sum + (session.correctAnswers || 0), 0);
    const mcqAccuracy = totalMCQQuestions > 0 ? 
      Math.round((correctMCQAnswers / totalMCQQuestions) * 100) : 0;

    // Calculate coding success rate
    const totalCodingProblems = codingSessions.reduce((sum, session) => 
      sum + (session.totalProblems || 0), 0);
    const solvedCodingProblems = codingSessions.reduce((sum, session) => 
      sum + (session.solvedProblems || 0), 0);
    const codingSuccess = totalCodingProblems > 0 ? 
      Math.round((solvedCodingProblems / totalCodingProblems) * 100) : 0;

    // Process topic progress
    const topicStats = {};
    safeSessions.forEach(session => {
      if (session?.topic) {
        if (!topicStats[session.topic]) {
          topicStats[session.topic] = { attempts: 0, success: 0 };
        }
        topicStats[session.topic].attempts += 1;
        if (session.type === 'mcq') {
          topicStats[session.topic].success += (session.correctAnswers || 0) / (session.totalQuestions || 1);
        } else if (session.type === 'coding') {
          topicStats[session.topic].success += (session.solvedProblems || 0) / (session.totalProblems || 1);
        }
      }
    });

    const topicProgress = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      attempts: stats.attempts,
      successRate: Math.round((stats.success / stats.attempts) * 100)
    }));

    // Process difficulty progress
    const difficultyStats = { easy: 0, medium: 0, hard: 0 };
    safeSessions.forEach(session => {
      if (session?.difficulty && difficultyStats.hasOwnProperty(session.difficulty.toLowerCase())) {
        difficultyStats[session.difficulty.toLowerCase()] += 1;
      }
    });

    const difficultyProgress = Object.entries(difficultyStats).map(([level, count]) => ({
      level: level.charAt(0).toUpperCase() + level.slice(1),
      count
    }));

    // Calculate overall rating from assessments
    const overallRating = safeAssessments.length > 0 ? 
      safeAssessments.reduce((sum, assessment) => sum + (assessment?.assessment?.overallRating || 0), 0) / safeAssessments.length : 0;

    // Extract strengths and improvements
    const allStrengths = safeAssessments.flatMap(a => a?.assessment?.strengths || []);
    const allImprovements = safeAssessments.flatMap(a => a?.assessment?.improvements || []);
    const allRecommendations = safeAssessments.flatMap(a => a?.assessment?.recommendations || []);

    return {
      totalMCQAttempts: mcqSessions.length,
      totalCodingAttempts: codingSessions.length,
      totalFaceToFaceInterviews: faceToFaceSessions.length,
      mcqAccuracy,
      codingSuccess,
      recentActivity: safeSessions.slice(0, 5),
      topicProgress,
      difficultyProgress,
      monthlyProgress: generateMonthlyProgress(safeSessions),
      overallRating: Math.round(overallRating * 10) / 10,
      strengths: [...new Set(allStrengths)].slice(0, 5),
      improvements: [...new Set(allImprovements)].slice(0, 5),
      recommendations: [...new Set(allRecommendations)].slice(0, 3)
    };
  };

  const generateMonthlyProgress = (sessions) => {
    // Add safety check for sessions parameter
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    
    const monthlyData = {};
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      monthlyData[monthKey] = { mcq: 0, coding: 0, faceToFace: 0 };
      last6Months.push(monthKey);
    }

    safeSessions.forEach(session => {
      if (!session?.timestamp) return; // Skip if no timestamp
      
      const sessionDate = session.timestamp?.toDate ? session.timestamp.toDate() : new Date(session.timestamp);
      const sessionMonth = sessionDate.toISOString().slice(0, 7);
      if (monthlyData[sessionMonth]) {
        if (session.type === 'mcq') monthlyData[sessionMonth].mcq += 1;
        if (session.type === 'coding') monthlyData[sessionMonth].coding += 1;
        if (session.type === 'interview') monthlyData[sessionMonth].faceToFace += 1;
      }
    });

    return last6Months.map(month => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      mcq: monthlyData[month].mcq,
      coding: monthlyData[month].coding,
      faceToFace: monthlyData[month].faceToFace
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Show loading state while authentication is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching dashboard data
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user after auth loading is complete, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Please log in to view your dashboard</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-gray-600">Track your interview preparation progress and performance</p>
          
          {/* Setup Notice for New Users */}
          {dashboardData.totalMCQAttempts === 0 && dashboardData.totalCodingAttempts === 0 && dashboardData.totalFaceToFaceInterviews === 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-blue-800">Welcome to your Dashboard!</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Start taking practice interviews to see your progress here. Your performance data and AI assessments will populate this dashboard as you complete sessions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700">MCQ Attempts</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboardData.totalMCQAttempts}</p>
            <p className="text-sm text-gray-500 mt-1">{dashboardData.mcqAccuracy}% accuracy</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700">Coding Problems</h3>
            <p className="text-3xl font-bold text-green-600">{dashboardData.totalCodingAttempts}</p>
            <p className="text-sm text-gray-500 mt-1">{dashboardData.codingSuccess}% success rate</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-700">Face-to-Face</h3>
            <p className="text-3xl font-bold text-purple-600">{dashboardData.totalFaceToFaceInterviews}</p>
            <p className="text-sm text-gray-500 mt-1">Interviews completed</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-gray-700">Overall Rating</h3>
            <p className="text-3xl font-bold text-yellow-600">{dashboardData.overallRating}/5.0</p>
            <p className="text-sm text-gray-500 mt-1">AI Assessment Score</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Progress Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mcq" stroke="#0088FE" name="MCQ" />
                <Line type="monotone" dataKey="coding" stroke="#00C49F" name="Coding" />
                <Line type="monotone" dataKey="faceToFace" stroke="#FFBB28" name="Face-to-Face" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Topic Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.topicProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="successRate" fill="#8884d8" name="Success Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 capitalize">
                        {activity.type} - {activity.topic}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {activity.difficulty} • {new Date(activity.timestamp?.toDate?.() || activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {activity.type === 'mcq' && (
                        <span className="text-blue-600 font-semibold">
                          {activity.correctAnswers}/{activity.totalQuestions}
                        </span>
                      )}
                      {activity.type === 'coding' && (
                        <span className="text-green-600 font-semibold">
                          {activity.solvedProblems}/{activity.totalProblems}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Analysis</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
              <ul className="space-y-1">
                {dashboardData.strengths.length > 0 ? (
                  dashboardData.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {strength}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-sm">Complete interviews for AI analysis</li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-red-600 mb-2">Areas for Improvement</h4>
              <ul className="space-y-1">
                {dashboardData.improvements.length > 0 ? (
                  dashboardData.improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="text-red-500 mr-2">!</span>
                      {improvement}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-sm">Complete interviews for AI analysis</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Recommendations</h3>
            <div className="space-y-3">
              {dashboardData.recommendations.length > 0 ? (
                dashboardData.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500 text-sm">Complete interviews to receive personalized recommendations</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold text-gray-800 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button 
                  className="w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors"
                  onClick={() => window.location.href = '/mock-interviews'}
                >
                  Start New MCQ Practice →
                </button>
                <button 
                  className="w-full text-left p-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm text-green-700 transition-colors"
                  onClick={() => window.location.href = '/compiler'}
                >
                  Practice Coding Problems →
                </button>
                <button 
                  className="w-full text-left p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-700 transition-colors"
                  onClick={() => window.location.href = '/interview-room'}
                >
                  Start Face-to-Face Interview →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
