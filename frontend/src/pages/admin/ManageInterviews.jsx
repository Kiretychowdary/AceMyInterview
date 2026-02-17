import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ManageInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);

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
      alert('Failed to fetch interviews');
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
        alert(`Interview created successfully!\n\nInterview ID: ${response.data.interview.interviewId}\n\nShare this link:\n${response.data.interview.fullLink}`);
        setShowCreateModal(false);
        fetchInterviews();
        fetchAnalytics();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      alert('Failed to create interview: ' + (error.response?.data?.error || error.message));
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
        alert(`Interview ${response.data.status}`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle status');
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
        alert('Interview deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting interview:', error);
      alert('Failed to delete interview');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
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
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{interview.title}</h3>
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
                        <span>📊 {interview.totalAttempts} attempts</span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          value={`${window.location.origin}${interview.interviewLink}`}
                          readOnly
                          className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}${interview.interviewLink}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleStatus(interview.interviewId)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title={interview.status === 'active' ? 'Close Interview' : 'Activate Interview'}
                      >
                        <span className="text-xl">
                          {interview.status === 'active' ? '⏸️' : '▶️'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteInterview(interview.interviewId)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete Interview"
                      >
                        <span className="text-xl">🗑️</span>
                      </button>
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
    </div>
  );
};

export default ManageInterviews;
