import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ManageInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [loadingParticipations, setLoadingParticipations] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    role: '',
    difficulty: 'medium',
    duration: 30,
    numberOfQuestions: 5,
    accessType: 'public',
    settings: {
      allowTextInput: true,
      allowVoiceInput: true,
      showTimer: true,
      recordVideo: false,
      aiGenerated: true
    }
  });

  useEffect(() => {
    fetchInterviews();
    fetchAnalytics();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/interviews`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setInterviews(response.data.interviews);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to fetch interviews', {
        position: 'top-right',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/interviews/analytics`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleCreateInterview = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/interviews`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('🎉 Interview created successfully!', {
          position: 'top-center',
          autoClose: 5000
        });
        
        // Show link in a separate info toast
        setTimeout(() => {
          toast.info(
            <div>
              <strong>Interview ID:</strong> {response.data.interview.interviewId}<br/>
              <strong>Link:</strong> {response.data.interview.fullLink}
            </div>,
            {
              position: 'top-center',
              autoClose: 10000
            }
          );
        }, 500);
        
        setShowCreateModal(false);
        fetchInterviews();
        fetchAnalytics();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      toast.error('Failed to create interview: ' + (error.response?.data?.error || error.message), {
        position: 'top-right',
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (interviewId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/admin/interviews/${interviewId}/toggle`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchInterviews();
        const message = response.data.status === 'active' ? '✅ Interview activated' : '⏸️ Interview paused';
        toast.success(message, {
          position: 'top-right',
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleDeleteInterview = async (interviewId) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/interviews/${interviewId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchInterviews();
        fetchAnalytics();
        toast.success('🗑️ Interview deleted successfully', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast.error('Failed to delete interview', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('📋 Link copied to clipboard!', {
      position: 'top-center',
      autoClose: 2000
    });
  };

  const handleDownloadParticipations = async (interviewId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/interviews/${interviewId}/download`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interview_participations_${interviewId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('📥 Participations downloaded successfully!', {
        position: 'top-right',
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error downloading participations:', error);
      toast.error('Failed to download participations', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const fetchParticipations = async (interviewId) => {
    try {
      setLoadingParticipations(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/interviews/${interviewId}/participations`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setParticipations(response.data.participations);
      }
    } catch (error) {
      console.error('Error fetching participations:', error);
      toast.error('Failed to load participations', {
        position: 'top-right',
        autoClose: 3000
      });
    } finally {
      setLoadingParticipations(false);
    }
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetailsModal(true);
    fetchParticipations(interview.interviewId);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      role: '',
      difficulty: 'medium',
      duration: 30,
      numberOfQuestions: 5,
      accessType: 'public',
      settings: {
        allowTextInput: true,
        allowVoiceInput: true,
        showTimer: true,
        recordVideo: false,
        aiGenerated: true
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manage Interviews</h1>
            <p className="text-gray-400">Create custom interviews with unique shareable links</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            + Create Interview
          </button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="text-3xl font-bold text-white">{analytics.totalInterviews}</div>
              <div className="text-gray-400 text-sm mt-1">Total Interviews</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="text-3xl font-bold text-green-400">{analytics.activeInterviews}</div>
              <div className="text-gray-400 text-sm mt-1">Active</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="text-3xl font-bold text-blue-400">{analytics.totalAttempts}</div>
              <div className="text-gray-400 text-sm mt-1">Total Attempts</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="text-3xl font-bold text-purple-400">{analytics.completionRate}%</div>
              <div className="text-gray-400 text-sm mt-1">Completion Rate</div>
            </motion.div>
          </div>
        )}

        {/* Interviews List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white">Your Interviews</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-white">Loading...</div>
          ) : interviews.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No interviews created yet. Click "Create Interview" to get started!
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {interviews.map((interview) => (
                <div key={interview._id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer" 
                      onClick={() => handleViewDetails(interview)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white hover:text-blue-400 transition-colors">{interview.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          interview.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {interview.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {interview.difficulty}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm mb-3">{interview.description || 'No description'}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                        <span>👤 {interview.role}</span>
                        <span>⏱️ {interview.duration} min</span>
                        <span>❓ {interview.numberOfQuestions} questions</span>
                        <span>🔗 {interview.accessType}</span>
                        <span>📊 {interview.totalAttempts || 0} attempts</span>
                        <span>✅ {interview.completedAttempts || 0} completed</span>
                      </div>

                      <div className="mt-3 text-xs text-blue-400 hover:text-blue-300">
                        Click to view participant details →
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(`${window.location.origin}${interview.interviewLink}`);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                        title="Copy Interview Link"
                      >
                        📋 Copy Link
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadParticipations(interview.interviewId);
                          }}
                          className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Download Participations (Excel)"
                        >
                          <span className="text-xl">📥</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(interview.interviewId);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title={interview.status === 'active' ? 'Close Interview' : 'Activate Interview'}
                        >
                          <span className="text-xl">
                            {interview.status === 'active' ? '⏸️' : '▶️'}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteInterview(interview.interviewId);
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete Interview"
                        >
                          <span className="text-xl">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Interview Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Create New Interview</h2>

            <form onSubmit={handleCreateInterview} className="space-y-4">
              <div>
                <label className="block text-white mb-2 font-medium">Interview Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Senior Developer Interview"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Brief description of the interview"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 font-medium">Role *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Full Stack Developer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 font-medium">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    min="5"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">Number of Questions</label>
                  <input
                    type="number"
                    value={formData.numberOfQuestions}
                    onChange={(e) => setFormData({...formData, numberOfQuestions: parseInt(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2 font-medium">Access Type</label>
                <select
                  value={formData.accessType}
                  onChange={(e) => setFormData({...formData, accessType: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="public">Public (Anyone with link)</option>
                  <option value="private">Private (Invited only)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-white mb-2 font-medium">Interview Settings</label>
                
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.settings.allowTextInput}
                    onChange={(e) => setFormData({...formData, settings: {...formData.settings, allowTextInput: e.target.checked}})}
                    className="w-5 h-5"
                  />
                  <span>Allow Text Input</span>
                </label>

                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.settings.allowVoiceInput}
                    onChange={(e) => setFormData({...formData, settings: {...formData.settings, allowVoiceInput: e.target.checked}})}
                    className="w-5 h-5"
                  />
                  <span>Allow Voice Input</span>
                </label>

                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.settings.showTimer}
                    onChange={(e) => setFormData({...formData, settings: {...formData.settings, showTimer: e.target.checked}})}
                    className="w-5 h-5"
                  />
                  <span>Show Timer</span>
                </label>

                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.settings.aiGenerated}
                    onChange={(e) => setFormData({...formData, settings: {...formData.settings, aiGenerated: e.target.checked}})}
                    className="w-5 h-5"
                  />
                  <span>AI-Generated Questions</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Interview'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Participation Details Modal */}
      {showDetailsModal && selectedInterview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedInterview.title}</h2>
                <p className="text-gray-400">{selectedInterview.description}</p>
                <div className="flex gap-3 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {selectedInterview.role}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {selectedInterview.difficulty}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedInterview.status === 'active' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {selectedInterview.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedInterview(null);
                  setParticipations([]);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Interview Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{selectedInterview.totalAttempts || 0}</div>
                <div className="text-gray-400 text-sm">Total Attempts</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-green-400">{selectedInterview.completedAttempts || 0}</div>
                <div className="text-gray-400 text-sm">Completed</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-blue-400">{selectedInterview.numberOfQuestions}</div>
                <div className="text-gray-400 text-sm">Questions</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-purple-400">{selectedInterview.duration} min</div>
                <div className="text-gray-400 text-sm">Duration</div>
              </div>
            </div>

            {/* Interview Link */}
            <div className="mb-6">
              <label className="block text-white mb-2 font-medium">Interview Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}${selectedInterview.interviewLink}`}
                  readOnly
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}${selectedInterview.interviewLink}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Copy Link
                </button>
              </div>
            </div>

            {/* Participations Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">Participant Details</h3>
                <button
                  onClick={() => handleDownloadParticipations(selectedInterview.interviewId)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <span>📥</span>
                  Download Excel
                </button>
              </div>

              {loadingParticipations ? (
                <div className="text-center py-12 text-gray-400">Loading participants...</div>
              ) : participations.length === 0 ? (
                <div className="bg-white/5 rounded-lg p-12 text-center border border-white/10">
                  <div className="text-5xl mb-3">👥</div>
                  <div className="text-gray-400">No participants yet</div>
                  <div className="text-gray-500 text-sm mt-2">Share the interview link to get started</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {participations.map((participation, index) => (
                    <motion.div
                      key={participation._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/5 rounded-lg p-5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-white">{participation.userName || 'Anonymous'}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              participation.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400'
                                : participation.status === 'in-progress'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {participation.status}
                            </span>
                          </div>
                          <div className="text-gray-400 text-sm">{participation.userEmail}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-3xl font-bold text-white mb-1">
                            {participation.score || 0}/{participation.maxScore || selectedInterview.numberOfQuestions * 10}
                          </div>
                          <div className="text-sm font-medium text-blue-400">
                            {participation.percentageScore?.toFixed(1) || 0}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-white/5 rounded p-2 border border-white/10">
                          <div className="text-xs text-gray-400">Questions Answered</div>
                          <div className="text-white font-semibold">
                            {participation.questionsAnswered || 0}/{participation.totalQuestions || selectedInterview.numberOfQuestions}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded p-2 border border-white/10">
                          <div className="text-xs text-gray-400">Duration</div>
                          <div className="text-white font-semibold">
                            {participation.duration ? `${Math.floor(participation.duration / 60)}m ${participation.duration % 60}s` : 'N/A'}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded p-2 border border-white/10">
                          <div className="text-xs text-gray-400">Completed At</div>
                          <div className="text-white font-semibold text-xs">
                            {participation.completedAt ? new Date(participation.completedAt).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Overall Feedback */}
                      {participation.overallFeedback && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                          <div className="text-xs text-blue-400 font-medium mb-1">Overall Feedback</div>
                          <div className="text-white text-sm">{participation.overallFeedback}</div>
                        </div>
                      )}

                      {/* Transcript Preview */}
                      {participation.transcript && participation.transcript.length > 0 && (
                        <details className="bg-white/5 border border-white/10 rounded-lg p-3">
                          <summary className="text-sm text-gray-400 font-medium cursor-pointer hover:text-white">
                            View Interview Transcript ({participation.transcript.length} exchanges)
                          </summary>
                          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                            {participation.transcript.map((exchange, idx) => (
                              <div key={idx} className="text-xs">
                                <div className="text-blue-400 font-medium">Q{idx + 1}: {exchange.question}</div>
                                <div className="text-gray-300 mt-1">A: {exchange.answer || 'No answer'}</div>
                                {exchange.feedback && (
                                  <div className="text-green-400 mt-1">Feedback: {exchange.feedback}</div>
                                )}
                                {idx < participation.transcript.length - 1 && <hr className="my-2 border-white/10" />}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-white/20">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedInterview(null);
                  setParticipations([]);
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManageInterviews;
