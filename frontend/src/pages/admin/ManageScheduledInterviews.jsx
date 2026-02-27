import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, TrendingUp, Plus, Edit2, Trash2, Eye, Building2, BookOpen, Download, Link as LinkIcon, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
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

      const adminToken = localStorage.getItem('ace_admin_token');
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setInterviews(data.interviews);
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
      const adminToken = localStorage.getItem('ace_admin_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-interviews/analytics`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
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
      const adminToken = localStorage.getItem('ace_admin_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-interviews/${interviewId}/participations`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
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
      const adminToken = localStorage.getItem('ace_admin_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-interviews/${interviewId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('🗑️ Interview deleted successfully', {
          position: 'top-right',
          autoClose: 3000
        });
        fetchInterviews();
        fetchAnalytics();
      } else {
        toast.error('Error: ' + (data.error || 'Failed to delete interview'), {
          position: 'top-right',
          autoClose: 4000
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

  const handleEdit = (interview) => {
    setSelectedInterview(interview);
    setShowCreateModal(true);
  };

  const handleViewParticipations = (interview) => {
    fetchParticipations(interview.interviewId);
  };

  const handleCopyLink = (interviewId) => {
    const baseUrl = window.location.origin; // Gets http://localhost:5173 or production URL
    const interviewLink = `${baseUrl}/scheduled-interviews?id=${interviewId}`;
    
    navigator.clipboard.writeText(interviewLink).then(() => {
      toast.success('🔗 Interview link copied to clipboard!', {
        position: 'top-center',
        autoClose: 2000
      });
    }).catch((err) => {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link. Please try again.', {
        position: 'top-right',
        autoClose: 3000
      });
    });
  };

  const handleDownloadCSV = async (interviewId) => {
    try {
      const adminToken = localStorage.getItem('ace_admin_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-interviews/${interviewId}/download-csv`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Failed to download CSV', {
          position: 'top-right',
          autoClose: 3000
        });
        return;
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-${interviewId}-performance.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('📥 CSV downloaded successfully', {
        position: 'top-right',
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Failed to download CSV', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleDownloadDetailed = async (interviewId) => {
    try {
      const adminToken = localStorage.getItem('ace_admin_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/scheduled-interviews/${interviewId}/download-detailed`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Failed to download detailed data', {
          position: 'top-right',
          autoClose: 3000
        });
        return;
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-${interviewId}-detailed.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('📥 Detailed data downloaded successfully', {
        position: 'top-right',
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error downloading detailed data:', error);
      toast.error('Failed to download detailed data', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    if (activeTab === 'all') return true;
    return interview.status === activeTab;
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time || 'N/A';
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) return 'N/A';
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    return `${formattedDate} at ${time}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
      ongoing: 'bg-green-50 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-300',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheduled Interviews</h1>
            <p className="text-gray-600">Manage and track scheduled interviews</p>
          </div>
          <button
            onClick={() => {
              setSelectedInterview(null);
              setShowCreateModal(true);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md flex items-center gap-2 font-medium"
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
              className="bg-white border border-blue-200 rounded-xl p-6 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Interviews</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalInterviews}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-blue-200 rounded-xl p-6 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.upcomingInterviews}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-blue-200 rounded-xl p-6 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Participants</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalParticipants}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-blue-200 rounded-xl p-6 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Avg Score</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.averageScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-blue-200">
          {['all', 'upcoming', 'ongoing', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-all ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Interviews List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading interviews...</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No interviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview, index) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{interview.interviewName}</h3>
                      {getStatusBadge(interview.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Display availability window */}
                      <div className="flex items-start gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Available From</p>
                          <span className="text-gray-900">
                            {interview.availableFromDate 
                              ? formatDateTime(interview.availableFromDate, interview.availableFromTime)
                              : formatDateTime(interview.scheduledDate, interview.startTime)
                            }
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-gray-600">
                        <Clock className="w-4 h-4 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Available Until</p>
                          <span className="text-gray-900">
                            {interview.availableToDate 
                              ? formatDateTime(interview.availableToDate, interview.availableToTime)
                              : formatDateTime(interview.scheduledDate, interview.endTime)
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-3">
                      <div className="flex items-center gap-2 text-gray-600">
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
                      <p className="text-gray-600 text-sm mt-3">{interview.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <span className="text-gray-600">
                        Difficulty: <span className="text-gray-900">{interview.difficulty}</span>
                      </span>
                      <span className="text-gray-600">
                        Questions: <span className="text-gray-900">{interview.numberOfQuestions}</span>
                      </span>
                      <span className="text-gray-600">
                        Duration: <span className="text-gray-900">{interview.duration} min</span>
                      </span>
                    </div>

                    {/* Shareable Link */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs">
                        <LinkIcon className="w-3 h-3 text-blue-600" />
                        <span className="text-gray-500">Share Link:</span>
                        <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs flex-1 truncate">
                          {window.location.origin}/scheduled-interviews?id={interview.interviewId}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleCopyLink(interview.interviewId)}
                      className="p-2 bg-green-50 border border-green-200 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      title="Copy Interview Link"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleViewParticipations(interview)}
                      className="p-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="View Participations"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(interview)}
                      className="p-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Edit Interview"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(interview.interviewId)}
                      className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete Interview"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Participations */}
                {participations[interview.interviewId] && (
                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-gray-900 font-semibold">Participation Analytics</h4>
                      {participations[interview.interviewId].analytics.totalParticipants > 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadCSV(interview.interviewId)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Download CSV
                          </button>
                          <button
                            onClick={() => handleDownloadDetailed(interview.interviewId)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Download Detailed
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-gray-600 text-sm">Registrations</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {participations[interview.interviewId].analytics.totalRegistrations || 0}
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-gray-600 text-sm">Attended</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {participations[interview.interviewId].analytics.totalParticipants}
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-gray-600 text-sm">Attendance</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {participations[interview.interviewId].analytics.attendanceRate || 0}%
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-gray-600 text-sm">Avg Score</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {participations[interview.interviewId].analytics.averageScore}%
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-gray-600 text-sm">Avg Duration</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {participations[interview.interviewId].analytics.averageDuration} min
                        </p>
                      </div>
                    </div>

                    {/* Registrations List */}
                    {participations[interview.interviewId].registrations && participations[interview.interviewId].registrations.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-gray-600 text-sm mb-2">Recent Registrations</h5>
                        <div className="space-y-2">
                          {participations[interview.interviewId].registrations.slice(0, 5).map(r => (
                            <div key={r._id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                              <div>
                                <p className="text-gray-900 font-medium">{r.userName}</p>
                                <p className="text-gray-600 text-sm">{r.userEmail}</p>
                              </div>
                              <div className="text-right">
                                {r.hasAttended ? (
                                  <span className="text-green-600 text-sm font-medium">✓ Attended</span>
                                ) : (
                                  <span className="text-yellow-600 text-sm font-medium">Registered</span>
                                )}
                                <p className="text-gray-500 text-xs">
                                  {new Date(r.registeredAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Participations */}
                    {participations[interview.interviewId].participations.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-gray-600 text-sm mb-2">Recent Participants</h5>
                        <div className="space-y-2">
                          {participations[interview.interviewId].participations.slice(0, 5).map(p => (
                            <div key={p._id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                              <div>
                                <p className="text-gray-900 font-medium">{p.userName}</p>
                                <p className="text-gray-600 text-sm">{p.userEmail}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-900 font-bold">{p.percentageScore}%</p>
                                <p className="text-gray-600 text-sm">{p.duration} min</p>
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
