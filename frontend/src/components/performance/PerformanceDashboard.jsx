// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * Student Performance Dashboard Component
 * Shows AI-powered performance insights and recommendations
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function PerformanceDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchPerformanceData();
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = await user.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/ml/notifications?unreadOnly=false&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();

      // Fetch dashboard summary
      const dashboardResponse = await axios.get(`${API_BASE_URL}/api/ml/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch AI prediction (personal AI now fetches user's actual data)
      const predictionResponse = await axios.get(`${API_BASE_URL}/api/ml/prediction`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDashboardData(dashboardResponse.data);
      setPrediction(predictionResponse.data);

      // If there are new notifications in prediction, show them
      if (predictionResponse.data.notifications && predictionResponse.data.notifications.length > 0) {
        setNotifications(prev => [...predictionResponse.data.notifications, ...prev].slice(0, 5));
      }

    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError(err.response?.data?.message || 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const getMasteryColor = (masteryScore) => {
    if (masteryScore >= 0.7) return 'text-green-600 bg-green-100';
    if (masteryScore >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMasteryLabel = (masteryScore) => {
    if (masteryScore >= 0.7) return 'Strong';
    if (masteryScore >= 0.4) return 'Average';
    return 'Needs Improvement';
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'REVISE':
        return '🔄';
      case 'EXPLORE':
        return '🔍';
      case 'ADVANCE':
        return '🚀';
      case 'START':
        return '✨';
      default:
        return '📚';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading performance data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData?.stats || dashboardData.stats.totalInteractions === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-purple-900 mb-4">
            Welcome to Your Personal AI Trainer! 🎓
          </h2>
          <p className="text-purple-700 mb-6">
            I'm your dedicated learning companion. I'll track your progress, understand your learning style, 
            and guide you personally through your journey. Let's start!
          </p>
          <a
            href="/contests"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-bold"
          >
            Begin Your Journey
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Your Personal AI Trainer Dashboard</h1>
        <p className="text-purple-100">Personalized insights just for you - powered by AI that learns your style</p>
      </div>

      {/* Notifications from Personal AI Trainer */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notif, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 flex items-start space-x-3 animate-pulse"
            >
              <div className="text-3xl">🎉</div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900">{notif.title}</h3>
                <p className="text-green-700 text-sm">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-500 text-sm mb-2">Total Practice</div>
          <div className="text-3xl font-bold text-blue-600">
            {dashboardData.stats.totalInteractions}
          </div>
          <div className="text-sm text-gray-600 mt-1">Problems Solved</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-500 text-sm mb-2">Overall Mastery</div>
          <div className="text-3xl font-bold text-green-600">
            {(dashboardData.stats.overallMastery * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">Across All Topics</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-500 text-sm mb-2">Topics Started</div>
          <div className="text-3xl font-bold text-purple-600">
            {dashboardData.stats.topicsStarted}
          </div>
          <div className="text-sm text-gray-600 mt-1">Out of 10 Topics</div>
        </div>
      </div>

      {/* AI Recommendation */}
      {prediction?.prediction?.recommendation && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="text-5xl animate-bounce">
              {getActionIcon(prediction.prediction.recommendation.action_type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-bold text-gray-800">
                  Your Personal AI Trainer Says:
                </h2>
                <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full font-medium">
                  {prediction.prediction.recommendation.action_type}
                </span>
              </div>
              <p className="text-gray-700 text-lg mb-4">
                {prediction.prediction.recommendation.reason}
              </p>
              {prediction.prediction.recommendation.recommended_topic_name && (
                <div className="bg-white rounded-lg p-4 inline-block shadow-md">
                  <div className="text-sm text-gray-500 mb-1">🎯 Your Next Focus</div>
                  <div className="text-xl font-bold text-purple-600">
                    {prediction.prediction.recommendation.recommended_topic_name}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Topic Mastery */}
      {prediction?.prediction?.mastery && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Topic-wise Mastery
          </h2>
          <div className="space-y-4">
            {Object.entries(prediction.prediction.mastery).map(([topicName, data]) => (
              <div key={topicName} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{topicName}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMasteryColor(data.mastery_score)}`}>
                    {getMasteryLabel(data.mastery_score)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${data.mastery_score * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{(data.mastery_score * 100).toFixed(1)}% Mastery</span>
                  {data.needs_revision && (
                    <span className="text-orange-600 font-medium">Needs Practice</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {dashboardData.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-l-4 border-gray-200 pl-4 py-2"
                style={{
                  borderLeftColor: activity.correct ? '#10b981' : '#ef4444'
                }}
              >
                <div>
                  <span className="font-medium text-gray-700">{activity.topic}</span>
                  <span className="text-gray-400 text-sm ml-2">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <span className={`text-2xl ${activity.correct ? '' : 'opacity-30'}`}>
                  {activity.correct ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchPerformanceData}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh Performance Data
        </button>
      </div>
    </div>
  );
}
