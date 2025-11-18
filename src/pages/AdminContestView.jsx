//nmkrspvlidata
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const AdminContestView = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [activeParticipants, setActiveParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    activeNow: 0,
    problemsCount: 0,
    submissions: 0
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    loadContestData();
    // Simulate active participants tracking (you can integrate socket.io later)
    const interval = setInterval(loadActiveParticipants, 5000);
    return () => clearInterval(interval);
  }, [contestId]);

  const loadContestData = async () => {
    try {
      setLoading(true);
      const [contestRes, registrationsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/contests/${contestId}`, { withCredentials: true }),
        axios.get(`${API_BASE}/api/contests/${contestId}/registrations`, { withCredentials: true })
      ]);

      setContest(contestRes.data.data);
      setRegistrations(registrationsRes.data.data || []);
      setStats({
        totalRegistrations: registrationsRes.data.data?.length || 0,
        activeNow: 0, // Will be updated by socket
        problemsCount: contestRes.data.data?.problems?.length || 0,
        submissions: 0 // Will be fetched from submissions
      });
    } catch (error) {
      console.error('Error loading contest data:', error);
      toast.error('Failed to load contest details');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveParticipants = async () => {
    // Simulate active participants (replace with actual socket.io integration)
    const mockActive = Math.floor(Math.random() * (registrations.length + 1));
    setStats(prev => ({ ...prev, activeNow: mockActive }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Contest Details...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Contest Not Found</h2>
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate('/admin-dashboard')}
          className="mb-4 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
                {contest.title}
              </h1>
              <p className="text-gray-600 text-lg mb-4">{contest.description}</p>
              
              <div className="flex flex-wrap gap-3">
                <span className={`px-4 py-2 rounded-lg font-semibold ${
                  contest.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  contest.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  contest.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {contest.difficulty}
                </span>
                <span className={`px-4 py-2 rounded-lg font-semibold ${
                  contest.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                  contest.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {contest.status?.toUpperCase() || 'DRAFT'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">Start Time</div>
              <div className="text-gray-800 font-bold">
                {contest.startTime ? new Date(contest.startTime).toLocaleString() : 'TBD'}
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">End Time</div>
              <div className="text-gray-800 font-bold">
                {contest.endTime ? new Date(contest.endTime).toLocaleString() : 'TBD'}
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">Duration</div>
              <div className="text-gray-800 font-bold">{contest.duration} min</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">Problems</div>
              <div className="text-blue-600 font-bold text-2xl">{stats.problemsCount}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Registrations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Registered Participants</h2>
        
        {registrations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <p className="text-gray-500 text-lg">No registrations yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {registrations.map((reg, index) => (
              <motion.div
                key={reg._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {(reg.userId?.substring(0, 2) || '?').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{reg.userId || 'Anonymous'}</p>
                    <p className="text-sm text-gray-600">
                      Registered: {new Date(reg.registeredAt || reg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {Math.random() > 0.5 && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Active
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Problems List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Contest Problems</h2>
        
        {contest.problems && contest.problems.length > 0 ? (
          <div className="space-y-3">
            {contest.problems.map((problem, index) => (
              <div
                key={problem._id || index}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-800">{index + 1}.</span>
                      <h5 className="text-lg font-bold text-gray-900">{problem.title}</h5>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        problem.difficulty === 'easy' || problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        problem.difficulty === 'medium' || problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {problem.difficulty?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{problem.description}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>📝 {problem.testCases?.length || 0} test cases</span>
                      <span>⭐ {problem.points || 100} points</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <p className="text-gray-500 text-lg">No problems added yet</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminContestView;
