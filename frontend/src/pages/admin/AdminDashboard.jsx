import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CreateContestModalNew from '../../components/admin/CreateContestModalNew';
import {
  getAllContests,
  createContest,
  updateContest,
  deleteContest,
  getContestStatistics
} from "../../services/ContestService";

const ProfessionalAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContest, setEditingContest] = useState(null);
  const [statistics, setStatistics] = useState({
    totalContests: 0,
    activeContests: 0,
    totalParticipants: 0,
    byDifficulty: {}
  });

  // Form state for contest creation/editing
  const [contestForm, setContestForm] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    type: 'Algorithm',
    startTime: '',
    endTime: '',
    registrationDeadline: '',
    maxParticipants: 1000,
    problems: [],
    tags: [],
    rules: '',
    prizes: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [contestsData, statsData] = await Promise.all([
        getAllContests(),
        getContestStatistics()
      ]);
      setContests(contestsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty fallbacks to prevent crashes
      setContests([]);
      setStatistics({
        totalContests: 0,
        activeContests: 0,
        totalParticipants: 0,
        byDifficulty: {}
      });
      // Only show error for non-network issues
      if (error.message && !error.message.includes('Failed to fetch')) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContestForm({
      title: '',
      description: '',
      difficulty: 'Medium',
      type: 'Algorithm',
      startTime: '',
      endTime: '',
      registrationDeadline: '',
      maxParticipants: 1000,
      problems: [],
      tags: [],
      rules: '',
      prizes: ''
    });
    setEditingContest(null);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'bg-blue-100 text-blue-700 border-blue-300',
      Medium: 'bg-blue-200 text-blue-800 border-blue-400',
      Hard: 'bg-blue-300 text-blue-900 border-blue-500',
      Expert: 'bg-blue-400 text-white border-blue-600'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusColor = (status) => {
    const colors = {
      'upcoming': 'bg-blue-100 text-blue-700 border-blue-300',
      'ongoing': 'bg-green-100 text-green-700 border-green-300',
      'completed': 'bg-gray-100 text-gray-700 border-gray-300',
      'cancelled': 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Manage contests and monitor platform activity</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
          >
            + Create Contest
          </motion.button>
        </div>
      </motion.div>



      {/* Contests Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Contests</h2>
          <div className="text-sm text-gray-500">
            {contests.length} contest{contests.length !== 1 ? 's' : ''} total
          </div>
        </div>

        {contests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Contests Yet</h3>
            <p className="text-gray-500 mb-6">Create your first contest to get started</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Create First Contest
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest, index) => (
              <motion.div
                key={contest._id || contest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {contest.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-3 py-1 rounded-lg border font-medium ${getDifficultyColor(contest.difficulty)}`}>
                        {contest.difficulty}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-lg border font-medium ${getStatusColor(contest.status)}`}>
                        {contest.status || 'upcoming'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {contest.description || 'No description available'}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Start:</span>
                    <div className="font-medium">{contest.startTime ? new Date(contest.startTime).toLocaleDateString() : 'TBD'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Problems:</span>
                    <div className="font-medium">{contest.problems?.length || 0}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingContest(contest);
                      setContestForm({ ...contest });
                      setShowCreateModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/admin/contest/${contest._id || contest.id}`)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm font-medium shadow-md"
                  >
                    Open Contest
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create/Edit Contest Modal */}
      <CreateContestModalNew
        show={showCreateModal}
        contest={editingContest}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        onSave={async (contestData) => {
          try {
            if (editingContest) {
              await updateContest(editingContest._id || editingContest.id, contestData);
              toast.success('Contest updated successfully!');
            } else {
              await createContest(contestData);
              toast.success('Contest created successfully!');
            }
            setShowCreateModal(false);
            resetForm();
            loadDashboardData();
          } catch (error) {
            console.error('Error saving contest:', error);
            toast.error(error?.body || 'Failed to save contest');
          }
        }}
      />
    </div>
  );
};

export default ProfessionalAdminDashboard;