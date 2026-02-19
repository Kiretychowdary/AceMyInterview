import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, TrendingUp, Plus, Edit2, Trash2, Eye, Building2, BookOpen } from 'lucide-react';
import CreateScheduledInterviewModal from '../../components/admin/CreateScheduledInterviewModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ManageScheduledInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [participations, setParticipations] = useState({});

  useEffect(() => {
    fetchInterviews();
    fetchAnalytics();
  }, []);

  const fetchInterviews = async (status = null) => {
    try {
      setLoading(true);
      const url = status
        ? `${API_BASE_URL}/api/admin/scheduled-interviews?status=${status}`
        : `${API_BASE_URL}/api/admin/scheduled-interviews`;

      const response = await fetch(url, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setInterviews(data.interviews);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      alert('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-interviews/analytics`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchParticipations = async (interviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-interviews/${interviewId}/participations`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setParticipations(prev => ({
          ...prev,
          [interviewId]: data
        }));
      }
    } catch (error) {
      console.error('Error fetching participations:', error);
    }
  };

  const handleDelete = async (interviewId) => {
    if (!confirm('Are you sure you want to delete this interview?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-interviews/${interviewId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        alert('Interview deleted successfully');
        fetchInterviews();
        fetchAnalytics();
      } else {
        alert('Error: ' + (data.error || 'Failed to delete interview'));
      }
    } catch (error) {
      console.error('Error deleting interview:', error);
      alert('Failed to delete interview');
    }
  };

  const handleEdit = (interview) => {
    setSelectedInterview(interview);
    setShowCreateModal(true);
  };

  const handleViewParticipations = (interview) => {
    fetchParticipations(interview.interviewId);
  };

  const filteredInterviews = interviews.filter(interview => {
    if (activeTab === 'all') return true;
    return interview.status === activeTab;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time;
  };

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      ongoing: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Scheduled Interviews</h1>
            <p className="text-gray-400">Manage and track scheduled interviews</p>
          </div>
          <button
            onClick={() => {
              setSelectedInterview(null);
              setShowCreateModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Interview
          </button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Interviews</p>
                  <p className="text-3xl font-bold text-white mt-1">{analytics.totalInterviews}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Upcoming</p>
                  <p className="text-3xl font-bold text-white mt-1">{analytics.upcomingInterviews}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Participants</p>
                  <p className="text-3xl font-bold text-white mt-1">{analytics.totalParticipants}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-pink-500/30 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Score</p>
                  <p className="text-3xl font-bold text-white mt-1">{analytics.averageScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-pink-400" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-purple-500/30">
          {['all', 'upcoming', 'ongoing', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Interviews List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">Loading interviews...</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No interviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview, index) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{interview.interviewName}</h3>
                      {getStatusBadge(interview.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(interview.scheduledDate)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(interview.startTime)} - {formatTime(interview.endTime)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        {interview.interviewType === 'company-based' ? (
                          <>
                            <Building2 className="w-4 h-4" />
                            <span>{interview.companyName}</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-4 h-4" />
                            <span>{interview.topics.join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {interview.description && (
                      <p className="text-gray-400 text-sm mt-3">{interview.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <span className="text-gray-400">
                        Difficulty: <span className="text-white">{interview.difficulty}</span>
                      </span>
                      <span className="text-gray-400">
                        Questions: <span className="text-white">{interview.numberOfQuestions}</span>
                      </span>
                      <span className="text-gray-400">
                        Duration: <span className="text-white">{interview.duration} min</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleViewParticipations(interview)}
                      className="p-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      title="View Participations"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(interview)}
                      className="p-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                      title="Edit Interview"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(interview.interviewId)}
                      className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Delete Interview"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Participations */}
                {participations[interview.interviewId] && (
                  <div className="mt-6 pt-6 border-t border-purple-500/30">
                    <h4 className="text-white font-semibold mb-4">Participation Analytics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Participants</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {participations[interview.interviewId].analytics.totalParticipants}
                        </p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Avg Score</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {participations[interview.interviewId].analytics.averageScore}%
                        </p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Avg Duration</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {participations[interview.interviewId].analytics.averageDuration} min
                        </p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Completion</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {participations[interview.interviewId].analytics.completionRate}%
                        </p>
                      </div>
                    </div>

                    {/* Recent Participations */}
                    {participations[interview.interviewId].participations.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-gray-400 text-sm mb-2">Recent Participants</h5>
                        <div className="space-y-2">
                          {participations[interview.interviewId].participations.slice(0, 5).map(p => (
                            <div key={p._id} className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">{p.userName}</p>
                                <p className="text-gray-400 text-sm">{p.userEmail}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-bold">{p.percentageScore}%</p>
                                <p className="text-gray-400 text-sm">{p.duration} min</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateScheduledInterviewModal
        show={showCreateModal}
        interview={selectedInterview}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedInterview(null);
        }}
        onSuccess={() => {
          fetchInterviews();
          fetchAnalytics();
        }}
      />
    </div>
  );
};

export default ManageScheduledInterviews;
