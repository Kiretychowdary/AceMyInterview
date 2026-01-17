// NMKRSPVLIDATA - Professional Contest UI
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUpcomingContests, getPastContests, registerForContest, checkRegistrationStatus } from "../../services/ContestService";
import { useAuth } from "../../contexts/AuthContext";

const Contests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedContest, setSelectedContest] = useState(null);
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState({});
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [contestToRegister, setContestToRegister] = useState(null);
  const [problemProgress, setProblemProgress] = useState({}); // Track problem completion status

  useEffect(() => {
    loadContests();
    const interval = setInterval(loadContests, 30000);
    return () => clearInterval(interval);
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
      
      if (user?.uid) {
        const regStatus = {};
        for (const contest of upcoming) {
          const contestId = contest._id || contest.id;
          try {
            const status = await checkRegistrationStatus(contestId, user.uid);
            regStatus[contestId] = status;
          } catch (err) {
            console.log('Failed to check registration:', contestId);
          }
        }
        setRegistrations(regStatus);
      }
    } catch (error) {
      console.error('Error loading contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (contest) => {
    if (!user?.uid) {
      toast.error('Please login to register', {
        position: 'top-center',
        style: { background: '#fee2e2', color: '#991b1b' }
      });
      navigate('/login');
      return;
    }
    setContestToRegister(contest);
    setShowRegisterModal(true);
  };

  const confirmRegistration = async () => {
    if (!contestToRegister) return;
    const contestId = contestToRegister._id || contestToRegister.id;
    
    try {
      await registerForContest(contestId, user.uid);
      toast.success('🎉 Successfully registered!', {
        position: 'top-center',
        style: { background: '#d1fae5', color: '#065f46', fontWeight: '600' }
      });
      
      const status = await checkRegistrationStatus(contestId, user.uid);
      setRegistrations({ ...registrations, [contestId]: status });
      setShowRegisterModal(false);
      setContestToRegister(null);
    } catch (error) {
      toast.error('Registration failed. Please try again.', {
        position: 'top-center'
      });
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></motion.div>;
    if (status === 'partial') return <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-500"/>;
    return null;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'bg-blue-50 text-blue-600 border-blue-300',
      'Medium': 'bg-blue-100 text-blue-700 border-blue-400',
      'Hard': 'bg-blue-200 text-blue-800 border-blue-500',
      'Expert': 'bg-blue-300 text-blue-900 border-blue-600'
    };
    return colors[difficulty] || 'bg-gray-50 text-gray-700 border-gray-300';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };

  const calculateEndTime = (startTime, duration) => {
    const start = new Date(startTime);
    let durationMinutes = 0;
    
    // Parse duration to minutes
    if (typeof duration === 'number') {
      durationMinutes = duration;
    } else {
      const durationStr = String(duration).toLowerCase();
      if (durationStr.includes('hour')) {
        const hours = parseInt(durationStr);
        durationMinutes = hours * 60;
      } else if (durationStr.includes('min')) {
        durationMinutes = parseInt(durationStr);
      } else {
        durationMinutes = parseInt(duration) || 0;
      }
    }
    
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return end.toISOString();
  };

  const getContestStatus = (startTime, duration) => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const endTime = new Date(calculateEndTime(startTime, duration)).getTime();
    
    if (now < start) return 'upcoming';
    if (now >= start && now <= endTime) return 'ongoing';
    return 'completed';
  };

  const formatDuration = (duration) => {
    if (!duration) return '0 hours';
    // If duration is a number (in minutes), convert to hours
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      if (hours === 0) return `${minutes} min`;
      if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      return `${hours}h ${minutes}m`;
    }
    // If duration is already a string, parse it
    const durationStr = String(duration).toLowerCase();
    // Check if it contains 'hour' or 'min'
    if (durationStr.includes('hour') || durationStr.includes('min')) {
      return duration; // Already formatted
    }
    // Assume it's minutes if it's just a number string
    const durationNum = parseInt(duration);
    if (!isNaN(durationNum)) {
      const hours = Math.floor(durationNum / 60);
      const minutes = durationNum % 60;
      if (hours === 0) return `${minutes} min`;
      if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      return `${hours}h ${minutes}m`;
    }
    return duration;
  };

  const getTimeRemaining = (startTime) => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const diff = start - now;
    
    if (diff <= 0) return { ended: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, ended: false };
  };

  const CountdownTimer = ({ startTime }) => {
    const [time, setTime] = useState(getTimeRemaining(startTime));
    
    useEffect(() => {
      const interval = setInterval(() => {
        setTime(getTimeRemaining(startTime));
      }, 1000);
      return () => clearInterval(interval);
    }, [startTime]);
    
    if (time.ended) return <span className="text-red-600 font-semibold">Live Now! 🔴</span>;
    
    return (
      <div className="flex gap-2 items-center">
        {time.days > 0 && (
          <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-center min-w-[48px]">
            <div className="text-lg font-bold">{time.days}</div>
            <div className="text-[9px] uppercase font-medium">Days</div>
          </motion.div>
        )}
        <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, ease: "easeInOut" }} className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-center min-w-[48px]">
          <div className="text-lg font-bold">{String(time.hours).padStart(2, '0')}</div>
          <div className="text-[9px] uppercase font-medium">Hours</div>
        </motion.div>
        <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, ease: "easeInOut" }} className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-center min-w-[48px]">
          <div className="text-lg font-bold">{String(time.minutes).padStart(2, '0')}</div>
          <div className="text-[9px] uppercase font-medium">Mins</div>
        </motion.div>
        <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6, ease: "easeInOut" }} className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-center min-w-[48px]">
          <div className="text-lg font-bold">{String(time.seconds).padStart(2, '0')}</div>
          <div className="text-[9px] uppercase font-medium">Secs</div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Clean Background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-50 to-transparent"/>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-md mb-6"
          >
            <span className="text-xl">🚀</span>
            <span className="tracking-wide">CODING CONTESTS</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl font-bold mb-4 text-gray-900"
          >
            Compete & Excel
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 text-base max-w-2xl mx-auto"
          >
            Join live coding contests, solve challenging problems, and climb the leaderboard to showcase your skills
          </motion.p>
        </motion.div>

        {/* Upcoming Contests Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-24"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl">
                🚀
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Contests</h2>
                <p className="text-gray-600 text-sm">Register now and prepare to compete</p>
              </div>
            </div>
            <button
              onClick={loadContests}
              className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              <span className="flex items-center gap-2">
                🔄 Refresh
              </span>
            </button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse shadow-md border border-gray-200">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"/>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"/>
                  <div className="h-24 bg-gray-200 rounded mb-4"/>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-slate-200 rounded-xl"/>
                    <div className="h-20 bg-slate-200 rounded-xl"/>
                    <div className="h-20 bg-slate-200 rounded-xl"/>
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingContests.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-12 text-center shadow-md border border-gray-200"
            >
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Upcoming Contests</h3>
              <p className="text-gray-600">Check back soon for new challenges!</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingContests.map((contest, index) => {
                const contestId = contest._id || contest.id;
                const isRegistered = registrations[contestId];
                
                return (
                  <motion.div
                    key={contestId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 hover:border-blue-500 transition-all cursor-pointer"
                    onClick={() => setSelectedContest(contest)}
                  >
                    <div className="p-6">
                      {/* Header Section */}
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(contest.difficulty)}`}>
                            {contest.difficulty}
                          </span>
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white">
                            {contest.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                          {contest.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{contest.description}</p>
                      </div>

                      {/* Countdown Timer Section */}
                      <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-xs text-blue-700 font-semibold mb-3 text-center">
                          Starts In
                        </div>
                        <div className="flex justify-center mb-3">
                          <CountdownTimer startTime={contest.startTime} />
                        </div>
                        <div className="space-y-1.5 pt-3 border-t border-blue-200">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-blue-200">
                              <span className="text-gray-600">Start:</span>
                              <span className="font-semibold text-gray-800">{formatTime(contest.startTime)}</span>
                            </div>
                            <span className="text-gray-400">→</span>
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-blue-200">
                              <span className="text-gray-600">End:</span>
                              <span className="font-semibold text-gray-800">{formatTime(calculateEndTime(contest.startTime, contest.duration))}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                          <div className="text-xl mb-1">⏱️</div>
                          <div className="text-xs text-blue-700 font-medium mb-0.5">Duration</div>
                          <div className="text-sm font-bold text-blue-900">{formatDuration(contest.duration)}</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                          <div className="text-xl mb-1">📝</div>
                          <div className="text-xs text-blue-700 font-medium mb-0.5">Problems</div>
                          <div className="text-sm font-bold text-blue-900">
                            {Array.isArray(contest.problems) ? contest.problems.length : contest.problems || 0}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                          <div className="text-xl mb-1">👥</div>
                          <div className="text-xs text-blue-700 font-medium mb-0.5">Registered</div>
                          <div className="text-sm font-bold text-blue-900">{contest.participants || 0}</div>
                        </div>
                      </div>

                      {/* Prize Section */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-5">
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <span className="text-xl">🏆</span>
                          <span className="font-semibold text-blue-900">{contest.prize}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const status = getContestStatus(contest.startTime, contest.duration);
                          if (status === 'ongoing') {
                            navigate(`/contest/${contestId}/problems`);
                          } else {
                            handleRegisterClick(contest);
                          }
                        }}
                        className={`w-full py-3 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all ${
                          isRegistered 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {(() => {
                          const status = getContestStatus(contest.startTime, contest.duration);
                          if (status === 'ongoing') {
                            return 'Start Contest →';
                          }
                          if (isRegistered) {
                            return '✓ Registered';
                          }
                          return 'Register Now';
                        })()}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Past Contests */}
        {pastContests.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              {/* Section Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl">
                    📚
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Past Contests
                  </h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Review completed challenges and check your performance history
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastContests.map((contest, index) => {
                  const contestId = contest._id || contest.id;
                  const isRegistered = registrations[contestId];
                  
                  return (
                    <motion.div
                      key={contestId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg border border-gray-200 transition-all cursor-pointer"
                      onClick={() => setSelectedContest(contest)}
                    >
                      {/* Completed Badge */}
                      <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1.5 rounded-bl-xl font-semibold text-xs">
                        <span className="flex items-center gap-1.5">
                          ✓ Completed
                        </span>
                      </div>

                      <div className="pt-6">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(contest.difficulty)}`}>
                            {contest.difficulty}
                          </span>
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white">
                            {contest.type}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {contest.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {contest.description}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                            <span>📅</span>
                            <span className="font-semibold">{formatTime(contest.startTime)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-200 text-center">
                              <div className="text-xs text-blue-700 font-medium mb-0.5">Duration</div>
                              <div className="text-sm font-bold text-blue-900">{formatDuration(contest.duration)}</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-200 text-center">
                              <div className="text-xs text-blue-700 font-medium mb-0.5">Problems</div>
                              <div className="text-sm font-bold text-blue-900">
                                {Array.isArray(contest.problems) ? contest.problems.length : contest.problems || 0}
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContest(contest);
                          }}
                          className="w-full py-2.5 rounded-lg font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Registration Confirmation Modal */}
      <AnimatePresence>
        {showRegisterModal && contestToRegister && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center p-6"
            onClick={() => setShowRegisterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-10 max-w-xl w-full shadow-2xl border-2 border-slate-200 relative overflow-hidden"
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-100 to-blue-100 rounded-full blur-3xl opacity-30 -ml-16 -mb-16" />
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 0.6 }}
                    className="text-7xl mb-5"
                  >
                    🎯
                  </motion.div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    Confirm Registration
                  </h3>
                  <p className="text-slate-600 text-lg font-medium">You're about to join this challenge!</p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border-2 border-indigo-200 shadow-lg"
                >
                  <h4 className="text-xl font-bold text-slate-800 mb-5 pb-4 border-b-2 border-indigo-200">{contestToRegister.title}</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-xl shadow-md">
                        🚀
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide mb-0.5">Start Time</div>
                        <div className="text-sm font-bold text-slate-800">{formatTime(contestToRegister.startTime)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg flex items-center justify-center text-xl shadow-md">
                        🏁
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-600 font-semibold uppercase tracking-wide mb-0.5">End Time</div>
                        <div className="text-sm font-bold text-slate-800">{formatTime(calculateEndTime(contestToRegister.startTime, contestToRegister.duration))}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                        <div className="text-2xl">⏱️</div>
                        <div>
                          <div className="text-xs text-slate-600 font-semibold">Duration</div>
                          <div className="text-sm font-bold text-slate-800">{formatDuration(contestToRegister.duration)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                        <div className="text-2xl">📝</div>
                        <div>
                          <div className="text-xs text-slate-600 font-semibold">Problems</div>
                          <div className="text-sm font-bold text-slate-800">{Array.isArray(contestToRegister.problems) ? contestToRegister.problems.length : contestToRegister.problems || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowRegisterModal(false)}
                    className="flex-1 py-3 rounded-lg font-semibold text-sm bg-white text-gray-700 border border-gray-300 transition-all hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRegistration}
                    className="flex-1 py-3 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contest Details Modal */}
      <AnimatePresence>
        {selectedContest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedContest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-3xl w-full shadow-lg border border-gray-200 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedContest(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(selectedContest.difficulty)}`}>
                    {selectedContest.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white">
                    {selectedContest.type}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {selectedContest.title}
                </h2>
                <p className="text-gray-600 text-sm">{selectedContest.description}</p>
              </div>

              {/* Contest Info Grid */}
              <div className="grid md:grid-cols-2 gap-3 mb-6">
                {/* Start Time */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🚀</div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-700 font-medium mb-1">Start Time</div>
                      <div className="text-xs text-gray-600">{formatDateTime(selectedContest.startTime).date}</div>
                      <div className="text-sm font-semibold text-blue-900">{formatDateTime(selectedContest.startTime).time}</div>
                    </div>
                  </div>
                </div>
                
                {/* End Time */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🏁</div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-700 font-medium mb-1">End Time</div>
                      <div className="text-xs text-gray-600">{formatDateTime(calculateEndTime(selectedContest.startTime, selectedContest.duration)).date}</div>
                      <div className="text-sm font-semibold text-blue-900">{formatDateTime(calculateEndTime(selectedContest.startTime, selectedContest.duration)).time}</div>
                    </div>
                  </div>
                </div>
                
                {/* Duration */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⏱️</div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-700 font-medium mb-1">Duration</div>
                      <div className="text-sm font-semibold text-blue-900">{formatDuration(selectedContest.duration)}</div>
                    </div>
                  </div>
                </div>
                
                {/* Problems */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📝</div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-700 font-medium mb-1">Problems</div>
                      <div className="text-sm font-semibold text-blue-900">
                        {Array.isArray(selectedContest.problems) ? selectedContest.problems.length : selectedContest.problems || 0} Challenges
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prize */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1">
                    <div className="text-xs text-blue-700 font-medium mb-0.5">Contest Prize</div>
                    <div className="text-base font-semibold text-blue-900">{selectedContest.prize}</div>
                  </div>
                </div>
              </div>

              {/* Topics */}
              {selectedContest.tags && selectedContest.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🏷️</span>
                    Topics Covered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContest.tags.map((tag, i) => {
                      const label = typeof tag === 'string' ? tag : (tag.label || tag.name || tag.title || JSON.stringify(tag));
                      return (
                        <span
                          key={`tag-${i}`}
                          className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-300 font-medium text-xs"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Problems List */}
              {Array.isArray(selectedContest.problems) && selectedContest.problems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📝</span>
                    <span>Contest Problems</span>
                    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg">
                      {selectedContest.problems.length}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {selectedContest.problems.map((problem, index) => {
                      const problemId = `${selectedContest._id || selectedContest.id}-${index}`;
                      const status = problemProgress[problemId] || 'not-started';
                      
                      return (
                        <div
                          key={`problem-${index}`}
                          className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:border-blue-400 cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              {/* Status Indicator */}
                              <div className="flex items-center justify-center w-6 h-6">
                                {getStatusIcon(status)}
                              </div>
                              
                              {/* Problem Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                                    #{index + 1}
                                  </span>
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    {problem.title || `Problem ${index + 1}`}
                                  </h4>
                                </div>
                                {problem.description && (
                                  <p className="text-gray-600 text-xs line-clamp-2">{problem.description}</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Difficulty Badge */}
                            {problem.difficulty && (
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Button - Only show for upcoming and ongoing contests */}
              {(() => {
                const status = getContestStatus(selectedContest.startTime, selectedContest.duration);
                
                // Don't show register button for completed contests
                if (status === 'completed') {
                  return null;
                }
                
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const contestId = selectedContest._id || selectedContest.id;
                      if (status === 'ongoing') {
                        navigate(`/contest/${contestId}/problems`);
                      } else {
                        handleRegisterClick(selectedContest);
                      }
                    }}
                    className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
                      registrations[selectedContest._id || selectedContest.id]
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {(() => {
                      const isRegistered = registrations[selectedContest._id || selectedContest.id];
                      
                      if (status === 'ongoing') {
                        return 'Start Contest Now →';
                      }
                      
                      if (isRegistered) {
                        return '✓ Successfully Registered';
                      }
                      
                      return 'Register for Contest';
                    })()}
                  </button>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contests;
