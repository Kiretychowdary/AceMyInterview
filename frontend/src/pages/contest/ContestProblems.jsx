// Contest Problems List - Shows all problems when user joins a contest
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getContestWithProblems } from "../../services/ContestService";
import { useAuth } from "../../contexts/AuthContext";
import ActiveParticipantsIndicator from "../../components/admin/ActiveParticipantsIndicator";
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading contest problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      {/* Active Participants Indicator */}
      {user?.uid && contestId && (
        <ActiveParticipantsIndicator 
          contestId={contestId}
          userId={user.uid}
          username={user.displayName || user.email}
          email={user.email}
        />
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button
            onClick={() => navigate('/contests')}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white text-gray-700 hover:text-blue-600 rounded border border-gray-300 hover:border-blue-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-semibold">Back to Contests</span>
          </button>

          {/* Contest Header Card */}
          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
            {/* Header Section */}
            <div className="bg-blue-600 px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white mb-1">
                    {contest?.title || 'Contest'}
                  </h1>
                  <p className="text-blue-100 text-sm max-w-3xl">{contest?.description}</p>
                </div>
              </div>
            </div>

            {/* Contest Info Grid */}
            <div className="px-6 py-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {contest?.difficulty && (
                  <span className={`text-xs font-semibold px-3 py-1 rounded border ${getDifficultyColor(contest.difficulty)}`}>
                    {contest.difficulty}
                  </span>
                )}
                {contest?.type && (
                  <span className="text-xs font-semibold px-3 py-1 rounded bg-blue-50 text-blue-700 border border-blue-300">
                    {contest.type}
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Start Time */}
                <div className="bg-blue-50 rounded p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-blue-800 uppercase mb-1">Start Time</div>
                      <div className="text-xs text-gray-700">{formatDate(contest?.startTime)}</div>
                    </div>
                  </div>
                </div>

                {/* End Time */}
                <div className="bg-purple-50 rounded p-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-purple-800 uppercase mb-1">End Time</div>
                      <div className="text-xs text-gray-700">{formatDate(contest?.endTime)}</div>
                    </div>
                  </div>
                </div>

                {/* Duration & Problems */}
                <div className="bg-orange-50 rounded p-4 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-orange-800 uppercase mb-1">Duration</div>
                      <div className="text-xs text-gray-700 mb-1">{contest?.duration || 'N/A'}</div>
                      <div className="text-xs text-orange-700 font-medium">{problems.length} Challenge{problems.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>

                {/* Your Progress */}
                <div className="bg-green-50 rounded p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-green-800 uppercase mb-1">Your Progress</div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-green-600">{userProgress.solved || 0}</span>
                          <span className="text-xs text-gray-600">Solved</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-orange-600">{userProgress.partial || 0}</span>
                          <span className="text-xs text-gray-600">Partial</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contest Prize Section */}
              {contest?.prize && (
                <div className="mt-4 bg-yellow-50 rounded p-4 border border-yellow-300">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-xs font-semibold text-yellow-800 uppercase mb-1">Contest Prize</div>
                      <div className="text-sm font-bold text-yellow-900">{contest.prize}</div>
                    </div>
                  </div>
                </div>
              )}
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
            <h2 className="text-lg font-bold text-gray-800">
              Contest Problems <span className="text-blue-600">({problems.length})</span>
            </h2>
            <button
              onClick={async () => {
                await Promise.all([
                  loadProblemStatuses(problems),
                  loadUserProgress()
                ]);
                toast.success('Progress updated!');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2 text-xs font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {problems.length === 0 ? (
            <div className="bg-white rounded p-8 text-center border border-gray-300">
              <div className="text-7xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Problems Yet</h3>
              <p className="text-slate-500">Problems will appear here once they're added to the contest</p>
            </div>
          ) : (
            <div className="space-y-5">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem._id || problem.id || `problem-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleProblemClick(problem, index)}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl border-2 border-slate-200 hover:border-blue-400 cursor-pointer transition-all group relative overflow-hidden"
                >
                  {/* Accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      {/* Problem Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-xl md:text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {problem.title || `Problem ${index + 1}`}
                            </h3>
                            {/* Status Indicators */}
                            {problemStatuses[problem._id]?.completionStatus === 'fully_solved' && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md" 
                                title="All test cases passed"
                              >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs text-white font-bold uppercase tracking-wide">Solved</span>
                              </motion.div>
                            )}
                            {problemStatuses[problem._id]?.completionStatus === 'partially_solved' && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg shadow-md" 
                                title={`${problemStatuses[problem._id]?.passedTestCases}/${problemStatuses[problem._id]?.totalTestCases} test cases passed`}
                              >
                                <div className="w-4 h-4 border-2 border-white rounded-full relative">
                                  <div className="absolute inset-0 border-r-2 border-white" style={{ transform: 'rotate(45deg)' }} />
                                </div>
                                <span className="text-xs text-white font-bold uppercase tracking-wide">Partial ({problemStatuses[problem._id]?.passedTestCases}/{problemStatuses[problem._id]?.totalTestCases})</span>
                              </motion.div>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {problem.difficulty && (
                              <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border-2 shadow-sm ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            )}
                            {problem.tags && problem.tags.length > 0 && (
                              <div className="flex gap-2">
                                {problem.tags.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                                    {tag}
                                  </span>
                                ))}
                                {problem.tags.length > 3 && (
                                  <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                                    +{problem.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description Preview */}
                      {problem.description && (
                        <p className="text-slate-600 text-sm md:text-base mb-4 line-clamp-2 leading-relaxed">
                          {problem.description}
                        </p>
                      )}

                      {/* Stats Footer */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pt-4 border-t border-slate-100">
                        {problem.testCases && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{Array.isArray(problem.testCases) ? problem.testCases.length : 0} Test Cases</span>
                          </div>
                        )}
                        {problem.constraints && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="font-medium">Constraints Defined</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          <span className="font-medium">Code Editor</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 hidden md:flex">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 group-hover:from-blue-500 group-hover:to-indigo-500 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg group-hover:shadow-xl group-hover:scale-110">
                        <svg className="w-7 h-7 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
