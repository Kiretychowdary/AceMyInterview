// Contest Problems List - Shows all problems when user joins a contest
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getContestWithProblems } from '../services/ContestService';
import { useAuth } from '../components/AuthContext';
import ActiveParticipantsIndicator from '../components/ActiveParticipantsIndicator';
import axios from 'axios';

const ContestProblems = () => {
  const navigate = useNavigate();
  const { contestId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  
  const [contest, setContest] = useState(location.state?.contest || null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problemStatuses, setProblemStatuses] = useState({}); // Track submission status per problem
  const [userProgress, setUserProgress] = useState({ solved: 0, partial: 0, totalProblems: 0, score: 0 });

  useEffect(() => {
    loadContestProblems();
  }, [contestId]);

  // Reload statuses and progress when user navigates back to this page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.uid && problems.length > 0) {
        loadProblemStatuses(problems);
        loadUserProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [problems, user]);

  const loadContestProblems = async () => {
    try {
      setLoading(true);
      const data = await getContestWithProblems(contestId, user?.uid);
      setContest(data);
      setProblems(data.problems || []);
      
      // Load submission statuses and progress for all problems
      if (user?.uid && data.problems) {
        await Promise.all([
          loadProblemStatuses(data.problems),
          loadUserProgress()
        ]);
      }
    } catch (error) {
      console.error('Error loading contest problems:', error);
      toast.error(error.body || 'Failed to load contest problems. Please make sure you are registered.');
      // Redirect back to contests if error
      setTimeout(() => navigate('/contests'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_BASE}/api/contests/${contestId}/progress/${user.uid}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setUserProgress(response.data.data);
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const loadProblemStatuses = async (problemsList) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const statuses = {};
      
      for (const problem of problemsList) {
        try {
          const response = await axios.get(
            `${API_BASE}/api/submissions/status/${user.uid}/${contestId}/${problem._id}`,
            { withCredentials: true }
          );
          statuses[problem._id] = response.data.data;
        } catch (err) {
          console.log(`No submission for problem ${problem._id}`);
          statuses[problem._id] = { completionStatus: 'not_attempted' };
        }
      }
      
      setProblemStatuses(statuses);
    } catch (error) {
      console.error('Error loading problem statuses:', error);
    }
  };

  const handleProblemClick = (problem, index) => {
    navigate('/compiler', {
      state: {
        contest,
        problemData: problem,
        contestId: contest._id || contest.id,
        problemIndex: index,
        allProblems: problems
      }
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Hard': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Expert': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contest problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 md:px-8">
      {/* Active Participants Indicator */}
      {user?.uid && contestId && (
        <ActiveParticipantsIndicator 
          contestId={contestId}
          userId={user.uid}
          username={user.displayName || user.email}
          email={user.email}
        />
      )}
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/contests')}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Contests
          </button>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {contest?.title || 'Contest'}
                </h1>
                <p className="text-gray-600 mb-3">{contest?.description}</p>
                <div className="flex flex-wrap gap-2">
                  {contest?.difficulty && (
                    <span className={`text-xs px-3 py-1 rounded-lg border ${getDifficultyColor(contest.difficulty)}`}>
                      {contest.difficulty}
                    </span>
                  )}
                  {contest?.type && (
                    <span className="text-xs px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                      {contest.type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  📅
                </div>
                <div>
                  <div className="text-xs text-gray-600">Start Time</div>
                  <div className="text-sm text-gray-800">{formatDate(contest?.startTime)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  ⏱️
                </div>
                <div>
                  <div className="text-xs text-gray-600">Duration</div>
                  <div className="text-sm text-gray-800">{contest?.duration || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  📝
                </div>
                <div>
                  <div className="text-xs text-gray-600">Problems</div>
                  <div className="text-sm text-gray-800">{problems.length} questions</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.div 
                  key={`${userProgress.solved}-${userProgress.partial}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg"
                >
                  ✓
                </motion.div>
                <div>
                  <div className="text-xs text-gray-600">Your Progress</div>
                  <motion.div 
                    key={`progress-${userProgress.solved}-${userProgress.partial}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-gray-800"
                  >
                    <span className="text-green-600 font-bold">
                      {userProgress.solved || 0}
                    </span>
                    {' solved, '}
                    <span className="text-orange-600 font-bold">
                      {userProgress.partial || 0}
                    </span>
                    {' partial'}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Problems List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>📋</span>
              Contest Problems
            </h2>
            <motion.button
              onClick={async () => {
                await Promise.all([
                  loadProblemStatuses(problems),
                  loadUserProgress()
                ]);
                toast.success('Progress updated!');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Status
            </motion.button>
          </div>

          {problems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600">No problems available for this contest</p>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem._id || problem.id || `problem-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 8 }}
                  onClick={() => handleProblemClick(problem, index)}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Problem Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold text-gray-800">
                              {problem.title || `Problem ${index + 1}`}
                            </h3>
                            {/* Status Indicator */}
                            {problemStatuses[problem._id]?.completionStatus === 'fully_solved' && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full" title="All test cases passed">
                                <span className="text-green-600 text-lg">✓</span>
                                <span className="text-xs text-green-700 font-semibold">Solved</span>
                              </div>
                            )}
                            {problemStatuses[problem._id]?.completionStatus === 'partially_solved' && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full" title={`${problemStatuses[problem._id]?.passedTestCases}/${problemStatuses[problem._id]?.totalTestCases} test cases passed`}>
                                <span className="text-yellow-600 text-lg">◐</span>
                                <span className="text-xs text-yellow-700 font-semibold">Partial</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {problem.difficulty && (
                              <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            )}
                            {problem.tags && problem.tags.length > 0 && (
                              <div className="flex gap-1">
                                {problem.tags.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description Preview */}
                      {problem.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {problem.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {problem.testCases && (
                          <div className="flex items-center gap-1">
                            <span>✓</span>
                            <span>{Array.isArray(problem.testCases) ? problem.testCases.length : 0} test cases</span>
                          </div>
                        )}
                        {problem.constraints && (
                          <div className="flex items-center gap-1">
                            <span>⚡</span>
                            <span>Constraints available</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="ml-4">
                      <div className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ContestProblems;
