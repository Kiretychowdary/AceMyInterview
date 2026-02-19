import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, BookOpen, Building2, TrendingUp, ArrowRight, Users, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ScheduledInterviews = () => {
  const [interviews, setInterviews] = useState({ upcoming: [], ongoing: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchScheduledInterviews();
  }, []);

  const fetchScheduledInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/public/scheduled-interviews`);
      const data = await response.json();

      if (data.success) {
        setInterviews(data.interviews);
      }
    } catch (error) {
      console.error('Error fetching scheduled interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = (interview) => {
    if (!user) {
      alert('Please login to participate in interviews');
      navigate('/login');
      return;
    }

    // Navigate to face-to-face interview with interview details
    navigate('/face-to-face-interview', {
      state: {
        scheduledInterview: {
          interviewId: interview.interviewId,
          scheduledInterviewId: interview._id,
          interviewName: interview.interviewName,
          interviewType: interview.interviewType,
          topics: interview.topics,
          companyName: interview.companyName,
          difficulty: interview.difficulty,
          numberOfQuestions: interview.numberOfQuestions,
          duration: interview.duration,
          isScheduled: true
        }
      }
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-green-400 bg-green-500/20 border-green-500/30',
      medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      hard: 'text-red-400 bg-red-500/20 border-red-500/30'
    };
    return colors[difficulty] || colors.medium;
  };

  const displayInterviews = activeTab === 'upcoming' ? interviews.upcoming : interviews.ongoing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Scheduled Interviews
            </h1>
            <p className="text-gray-400 text-lg">
              Join scheduled interviews and practice your skills
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{interviews.upcoming.length}</p>
              <p className="text-gray-400 text-sm">Upcoming</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{interviews.ongoing.length}</p>
              <p className="text-gray-400 text-sm">Live Now</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 text-center">
              <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {interviews.upcoming.filter(i => i.interviewType === 'topic-based').length + 
                 interviews.ongoing.filter(i => i.interviewType === 'topic-based').length}
              </p>
              <p className="text-gray-400 text-sm">Topic-Based</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-pink-500/30 rounded-xl p-4 text-center">
              <Building2 className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {interviews.upcoming.filter(i => i.interviewType === 'company-based').length + 
                 interviews.ongoing.filter(i => i.interviewType === 'company-based').length}
              </p>
              <p className="text-gray-400 text-sm">Company-Based</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-purple-500/30">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Upcoming Interviews ({interviews.upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'ongoing'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Live Now ({interviews.ongoing.length})
          </button>
        </div>

        {/* Interviews Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">Loading interviews...</p>
          </div>
        ) : displayInterviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Calendar className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              No {activeTab} interviews
            </h3>
            <p className="text-gray-400">
              {activeTab === 'upcoming' 
                ? 'Check back later for scheduled interviews'
                : 'No interviews are currently live'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayInterviews.map((interview, index) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {interview.interviewName}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(interview.difficulty)}`}>
                      {interview.difficulty.toUpperCase()}
                    </span>
                  </div>
                  {activeTab === 'ongoing' && (
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(interview.scheduledDate)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {formatTime(interview.startTime)} - {formatTime(interview.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    {interview.interviewType === 'company-based' ? (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm font-medium text-white">{interview.companyName}</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">
                          {interview.topics.length > 2 
                            ? `${interview.topics.slice(0, 2).join(', ')}...` 
                            : interview.topics.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Questions</p>
                    <p className="text-white font-bold mt-1">{interview.numberOfQuestions}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Duration</p>
                    <p className="text-white font-bold mt-1">{interview.duration} min</p>
                  </div>
                </div>

                {/* Description */}
                {interview.description && (
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                    {interview.description}
                  </p>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleStartInterview(interview)}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'ongoing'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30'
                  }`}
                >
                  {activeTab === 'ongoing' ? 'Join Now' : 'Start Interview'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledInterviews;
