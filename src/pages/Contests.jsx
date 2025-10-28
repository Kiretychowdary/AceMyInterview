// nmkrspvlidata
// Uses global Inter font and unique blue/purple gradients for a professional, modern look
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUpcomingContests, getPastContests } from '../services/ContestService';
import AccentBlobs from '../components/AccentBlobs';

const Contests = () => {
  const navigate = useNavigate();
  const [selectedContest, setSelectedContest] = useState(null);
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load contests from Firebase
  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      const [upcoming, past] = await Promise.all([
        getUpcomingContests(),
        getPastContests()
      ]);
      
      setUpcomingContests(upcoming);
      setPastContests(past);
    } catch (error) {
      console.error('Error loading contests:', error);
      toast.error('Failed to load contests');
      // Set empty fallbacks if loading fails
      setUpcomingContests([]);
      setPastContests([]);
    } finally {
      setLoading(false);
    }
  };

  // Default contest data (fallback)
  // const defaultUpcomingContests = [
  //   {
  //     id: 1,
  //     title: 'Weekly Coding Challenge #45',
  //     type: 'Algorithm',
  //     difficulty: 'Medium',
  //     startTime: '2025-10-28T10:00:00',
  //     duration: '2 hours',
  //     participants: 1250,
  //     prize: '🏆 Top 10 get certificates',
  //     description: 'Test your algorithmic skills with challenging problems covering arrays, strings, and dynamic programming.',
  //     problems: 5,
  //     rating: '1400-1800',
  //     tags: ['Arrays', 'DP', 'Strings', 'Graphs'],
  //     status: 'upcoming'
  //   },
  //   {
  //     id: 2,
  //     title: 'Monthly Data Structures Sprint',
  //     type: 'Data Structures',
  //     difficulty: 'Hard',
  //     startTime: '2025-10-30T14:00:00',
  //     duration: '3 hours',
  //     participants: 890,
  //     prize: '💎 Top 3 get premium access',
  //     description: 'Master complex data structures including trees, heaps, and advanced graph algorithms.',
  //     problems: 6,
  //     rating: '1800-2200',
  //     tags: ['Trees', 'Heaps', 'Graphs', 'Advanced DS'],
  //     status: 'upcoming'
  //   },
  //   {
  //     id: 3,
  //     title: 'Beginner Friendly Contest',
  //     type: 'Basics',
  //     difficulty: 'Easy',
  //     startTime: '2025-10-26T16:00:00',
  //     duration: '90 minutes',
  //     participants: 2100,
  //     prize: '🎯 Completion badges for all',
  //     description: 'Perfect for beginners! Focus on basic programming concepts, loops, and conditionals.',
  //     problems: 4,
  //     rating: '800-1200',
  //     tags: ['Basics', 'Loops', 'Conditionals', 'Math'],
  //     status: 'upcoming'
  //   },
  //   {
  //     id: 4,
  //     title: 'System Design Challenge',
  //     type: 'System Design',
  //     difficulty: 'Expert',
  //     startTime: '2025-11-02T18:00:00',
  //     duration: '4 hours',
  //     participants: 450,
  //     prize: '🌟 Top 5 get job referrals',
  //     description: 'Design scalable systems and solve real-world architectural problems.',
  //     problems: 3,
  //     rating: '2000+',
  //     tags: ['Scalability', 'Architecture', 'Distributed Systems'],
  //     status: 'upcoming'
  //   }
  // ];

  // const defaultPastContests = [
  //   {
  //     id: 5,
  //     title: 'Weekly Coding Challenge #44',
  //     type: 'Algorithm',
  //     difficulty: 'Medium',
  //     endTime: '2025-10-21T12:00:00',
  //     participants: 1450,
  //     winner: 'CodeMaster123',
  //     status: 'past'
  //   },
  //   {
  //     id: 6,
  //     title: 'Special Weekend Contest',
  //     type: 'Mixed',
  //     difficulty: 'Hard',
  //     endTime: '2025-10-20T16:00:00',
  //     participants: 980,
  //     winner: 'AlgoWizard',
  //     status: 'past'
  //   }
  // ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntil = (dateString) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target - now;
    
    if (diff < 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `in ${days}d ${hours}h`;
    return `in ${hours}h`;
  };

  // Parse a duration string like "2 hours", "90 minutes" into milliseconds
  const parseDurationMs = (durationStr) => {
    if (!durationStr) return 2 * 60 * 60 * 1000; // default 2 hours
    const s = String(durationStr).toLowerCase();
    const numMatch = s.match(/(\d+(?:\.\d+)?)/);
    const num = numMatch ? Number(numMatch[1]) : 0;
    if (s.includes('hour')) return (num || 2) * 60 * 60 * 1000;
    if (s.includes('minute')) return (num || 90) * 60 * 1000;
    // fallback to hours if unknown
    return (num || 2) * 60 * 60 * 1000;
  };

  // Compute contest end time from either explicit endTime or startTime + duration
  const getContestEndTime = (contest) => {
    if (contest.endTime) return new Date(contest.endTime);
    if (contest.startTime && contest.duration) {
      const start = new Date(contest.startTime).getTime();
      const dur = parseDurationMs(contest.duration);
      return new Date(start + dur);
    }
    return null;
  };

  const isOngoing = (contest) => {
    const now = Date.now();
    if (contest.status === 'ongoing') return true;
    if (!contest.startTime) return false;
    const start = new Date(contest.startTime).getTime();
    const end = getContestEndTime(contest);
    if (!end) return now >= start; // if no end, consider it ongoing if started
    return now >= start && now < end.getTime();
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

  const handleStartContest = (contest) => {
    navigate('/compiler', { state: { contest } });
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-4 md:px-8 font-sans relative overflow-hidden">
      <AccentBlobs />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm mb-4">
            🏆 Compete & Learn
          </span>
          <h1 className="text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 mb-4 font-sans">
            Coding Contests
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto font-sans">
            Challenge yourself with competitive programming contests. Improve your skills and compete with developers worldwide.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading contests...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Upcoming Contests */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 font-sans">
                  Upcoming Contests
                </h2>
                <span className="text-sm text-gray-500 font-medium bg-gray-100 px-4 py-2 rounded-lg font-sans">
                  {upcomingContests.length} contests
                </span>
              </div>

              {upcomingContests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-blue-200 font-sans">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-blue-700">No upcoming contests</p>
                  <p className="text-blue-600 text-sm">Check back later for new contests!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 font-sans">
                  {upcomingContests.map((contest, index) => (
                    <motion.div
                      key={contest.id}
                      initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl border-2 border-blue-100 hover:border-blue-300 transition-all cursor-pointer font-sans"
                onClick={() => setSelectedContest(contest)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl text-gray-800 mb-2 group-hover:text-blue-700 transition-colors font-sans">
                      {contest.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-3 py-1 rounded-lg border ${getDifficultyColor(contest.difficulty)}`}> 
                        {contest.difficulty}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        {contest.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl mb-1">⏰</div>
                    <div className="text-xs text-blue-700">
                      {getTimeUntil(contest.startTime)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-sans">
                  {contest.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 font-sans">
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                    <div className="text-xs text-gray-600 font-sans">Duration</div>
                    <div className="text-blue-700 text-sm font-sans">{contest.duration}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                          <div className="text-xs text-gray-600 font-sans">Problems</div>
                            <div className="text-blue-700 text-sm font-sans">{Array.isArray(contest.problems) ? contest.problems.length : (contest.problems || 0)}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                    <div className="text-xs text-gray-600 font-sans">Rating</div>
                    <div className="text-blue-700 text-sm font-sans">{contest.rating}</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {contest.tags?.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-sans">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-sans">
                    <span className="text-lg">👥</span>
                    <span>{contest.participants || 0} registered</span>
                  </div>
                  <motion.button
                    onClick={() => setSelectedContest(contest)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg font-sans"
                  >
                    View Details →
                  </motion.button>
                </div>
              </motion.div>
            ))}
                </div>
              )}
            </motion.div>

            {/* Ongoing Contests (new) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 font-sans">Ongoing Contests</h2>
                <span className="text-sm text-gray-500 font-medium bg-gray-100 px-4 py-2 rounded-lg font-sans">{ /* count inserted below */ }</span>
              </div>

              {(() => {
                const ongoingFromFetched = [ ...upcomingContests, ...pastContests ].filter(isOngoing);
                if (ongoingFromFetched.length === 0) {
                  return (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-blue-200 font-sans">
                      <div className="text-6xl mb-4">🔥</div>
                      <p className="text-blue-700">No contests are currently live</p>
                      <p className="text-blue-600 text-sm">Upcoming contests will appear here when they start.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid md:grid-cols-2 gap-6 font-sans">
                    {ongoingFromFetched.map((contest, index) => (
                      <motion.div
                        key={`ongoing-${contest.id}-${index}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                        whileHover={{ y: -4 }}
                        className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl border-2 border-blue-100 hover:border-blue-300 transition-all cursor-pointer font-sans"
                        onClick={() => setSelectedContest(contest)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl text-gray-800 mb-2 group-hover:text-blue-700 transition-colors font-sans">{contest.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`text-xs px-3 py-1 rounded-lg border ${getDifficultyColor(contest.difficulty)}`}>{contest.difficulty}</span>
                              <span className="text-xs px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">{contest.type}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl mb-1">⏳</div>
                            <div className="text-xs text-blue-700">Live now</div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-sans">{contest.description}</p>

                        <div className="grid grid-cols-3 gap-3 mb-4 font-sans">
                          <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                            <div className="text-xs text-gray-600 font-sans">Duration</div>
                            <div className="text-blue-700 text-sm font-sans">{contest.duration}</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                              <div className="text-xs text-gray-600 font-sans">Problems</div>
                              <div className="text-blue-700 text-sm font-sans">{Array.isArray(contest.problems) ? contest.problems.length : (contest.problems || 0)}</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                            <div className="text-xs text-gray-600 font-sans">Participants</div>
                            <div className="text-blue-700 text-sm font-sans">{contest.participants || 0}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-sans">
                            <span className="text-lg">👥</span>
                            <span>{contest.participants || 0} registered</span>
                          </div>
                          <motion.button
                            onClick={() => handleStartContest(contest)}
                            whileHover={{ scale: 1.03 }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg font-sans"
                          >
                            Join Now →
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>

            {/* Past Contests */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl text-blue-800 mb-6 font-sans">Past Contests</h2>
              {pastContests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-blue-200 font-sans">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-blue-700">No past contests</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4 font-sans">
                  {pastContests.map((contest, index) => (
              <motion.div
                key={contest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-md border border-blue-200 font-sans"
              >
                <h3 className="text-gray-800 mb-2 font-sans">{contest.title}</h3>
                <div className="flex gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(contest.difficulty)} font-sans`}> 
                    {contest.difficulty}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2 font-sans">
                  <div>🏆 Winner: <span>{contest.winner || 'TBA'}</span></div>
                  <div>👥 {contest.participants || 0} participants</div>
                </div>
                <button 
                  onClick={() => setSelectedContest(contest)}
                  className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-sans"
                >
                  View Results
                </button>
              </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Contest Details Modal */}
      <AnimatePresence>
        {selectedContest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans"
            onClick={() => setSelectedContest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl border-2 border-blue-200 max-h-[90vh] overflow-y-auto font-sans"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl">
                      🏆
                    </div>
                    <h2 className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 font-sans">
                      {selectedContest.title}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-3 py-1.5 rounded-lg border ${getDifficultyColor(selectedContest.difficulty)} font-sans`}> 
                      {selectedContest.difficulty}
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-sans">
                      {selectedContest.type}
                    </span>
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-sans">
                      Rating: {selectedContest.rating}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContest(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contest Info */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 mb-6 border-2 border-blue-200 font-sans">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      📅
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 font-sans">Start Time</div>
                      <div className="text-gray-800 font-sans">{formatDate(selectedContest.startTime)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      ⏱️
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 font-sans">Duration</div>
                      <div className="text-gray-800 font-sans">{selectedContest.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      📝
                    </div>
                  <div>
                      <div className="text-xs text-gray-600 font-sans">Problems</div>
                      <div className="text-gray-800 font-sans">{Array.isArray(selectedContest.problems) ? selectedContest.problems.length : (selectedContest.problems || 0)} challenges</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      👥
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 font-sans">Participants</div>
                      <div className="text-gray-800 font-sans">{selectedContest.participants} registered</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-blue-200 font-sans">
                  <div className="text-sm text-blue-700 mb-2 font-sans">{selectedContest.prize}</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 font-sans">
                <h3 className="text-lg text-gray-800 mb-3 font-sans">About This Contest</h3>
                <p className="text-gray-600 leading-relaxed font-sans">{selectedContest.description}</p>
              </div>

              {/* Topics */}
              <div className="mb-6 font-sans">
                <h3 className="text-lg text-gray-800 mb-3 font-sans">Topics Covered</h3>
                <div className="flex flex-wrap gap-2 font-sans">
                          {(selectedContest.tags || []).map((tag, i) => {
                            const label = typeof tag === 'string' ? tag : (tag.label || tag.name || tag.title || JSON.stringify(tag));
                            return (
                              <span key={label + i} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 font-sans">
                                {label}
                              </span>
                            );
                          })}
                </div>
                  <div className="text-gray-800 font-sans">{selectedContest.participants || 0} registered</div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 font-sans">
                <motion.button
                  onClick={() => setSelectedContest(null)}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 transition-all hover:bg-gray-50 shadow-sm hover:shadow-md font-sans"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
                <motion.button
                  onClick={() => handleStartContest(selectedContest)}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-sans"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xl">🚀</span>
                  Start Contest
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contests;
