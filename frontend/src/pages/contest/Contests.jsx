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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"/>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"/>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-300 rounded-full px-8 py-2.5 mb-6 shadow-md hover:shadow-lg transition-shadow min-w-[220px]"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-2xl"
            >
              🏆
            </motion.div>
            <span className="text-blue-700 font-bold text-sm tracking-wide">CODING CONTESTS</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-6xl font-extrabold mb-5"
          >
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Compete & Excel
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Join live coding contests, solve challenging problems, and climb the leaderboard
          </motion.p>
        </motion.div>

        {/* Upcoming Contests */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <motion.span 
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-3xl"
              >
                🚀
              </motion.span>
              Upcoming Contests
            </h2>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(37, 99, 235, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={loadContests}
              className="bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              <span className="flex items-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>🔄</motion.span>
                Refresh
              </span>
            </motion.button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl p-8 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"/>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"/>
                  <div className="h-24 bg-gray-200 rounded"/>
                </div>
              ))}
            </div>
          ) : upcomingContests.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-16 text-center shadow-xl border-2 border-blue-100"
            >
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-600 text-lg">No upcoming contests at the moment</p>
              <p className="text-gray-500 mt-2">Check back soon for new challenges!</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingContests.map((contest, index) => {
                const contestId = contest._id || contest.id;
                const isRegistered = registrations[contestId];
                
                return (
                  <motion.div
                    key={contestId}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    className="group bg-white rounded-2xl p-7 shadow-lg hover:shadow-2xl border-2 border-blue-100 hover:border-blue-400 transition-all duration-300 cursor-pointer relative overflow-hidden min-h-[520px] flex flex-col"
                    style={{ borderRadius: "1rem" }}
                    onClick={() => setSelectedContest(contest)}
                  >
                    {/* Gradient Overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-100/0 opacity-0 group-hover:opacity-100"
                      animate={{ 
                        background: ['linear-gradient(to bottom right, rgba(239, 246, 255, 0), rgba(219, 234, 254, 0))', 'linear-gradient(to bottom right, rgba(239, 246, 255, 0.5), rgba(219, 234, 254, 0.3))']
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <motion.span 
                              whileHover={{ scale: 1.05 }}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border-2 ${getDifficultyColor(contest.difficulty)} transition-all min-w-[70px] text-center`}
                            >
                              {contest.difficulty}
                            </motion.span>
                            <motion.span 
                              whileHover={{ scale: 1.05 }}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md transition-all min-w-[70px] text-center"
                            >
                              {contest.type}
                            </motion.span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 mb-2.5 line-clamp-2 min-h-[3.5rem] leading-7">
                            {contest.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed min-h-[2.5rem]">{contest.description}</p>
                        </div>
                      </div>

                      {/* Timer */}
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="mb-5 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow min-h-[140px] flex flex-col justify-center"
                      >
                        <div className="text-xs text-blue-700 font-semibold mb-3 uppercase tracking-wide text-center">Starts In</div>
                        <div className="flex justify-center">
                          <CountdownTimer startTime={contest.startTime} />
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="text-xs text-blue-600 font-medium text-center flex items-center justify-center gap-1.5">
                            <span className="font-semibold">Start:</span>
                            <span>{formatTime(contest.startTime)}</span>
                          </div>
                          <div className="text-xs text-blue-600 font-medium text-center flex items-center justify-center gap-1.5">
                            <span className="font-semibold">End:</span>
                            <span>{formatTime(calculateEndTime(contest.startTime, contest.duration))}</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ duration: 0.2 }}
                          className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-3 border border-blue-200 text-center shadow-sm hover:shadow-md transition-shadow min-h-[90px] flex flex-col justify-center"
                        >
                          <div className="text-2xl mb-1">⏱️</div>
                          <div className="text-xs text-gray-600 font-medium mb-1">Duration</div>
                          <div className="text-sm font-bold text-blue-700">{formatDuration(contest.duration)}</div>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ duration: 0.2 }}
                          className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-3 border border-blue-200 text-center shadow-sm hover:shadow-md transition-shadow min-h-[90px] flex flex-col justify-center"
                        >
                          <div className="text-2xl mb-1">📝</div>
                          <div className="text-xs text-gray-600 font-medium mb-1">Problems</div>
                          <div className="text-sm font-bold text-blue-700">
                            {Array.isArray(contest.problems) ? contest.problems.length : contest.problems || 0}
                          </div>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ duration: 0.2 }}
                          className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-3 border border-blue-200 text-center shadow-sm hover:shadow-md transition-shadow min-h-[90px] flex flex-col justify-center"
                        >
                          <div className="text-2xl mb-1">👥</div>
                          <div className="text-xs text-gray-600 font-medium mb-1">Registered</div>
                          <div className="text-sm font-bold text-blue-700">{contest.participants || 0}</div>
                        </motion.div>
                      </div>

                      {/* Prize */}
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-3.5 border-2 border-blue-200 mb-5 shadow-sm hover:shadow-md transition-shadow min-h-[50px] flex items-center justify-center"
                      >
                        <div className="text-sm font-semibold text-blue-800 flex items-center gap-2.5">
                          <span className="text-lg">🏆</span>
                          {contest.prize}
                        </div>
                      </motion.div>

                      {/* Register Button */}
                      <motion.button
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 10px 30px rgba(37, 99, 235, 0.25)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const status = getContestStatus(contest.startTime, contest.duration);
                          if (status === 'ongoing') {
                            navigate(`/contest/${contestId}/problems`);
                          } else {
                            handleRegisterClick(contest);
                          }
                        }}
                        className={`w-full py-3 rounded-lg font-semibold text-base shadow-md transition-all mt-auto min-h-[48px] flex items-center justify-center ${
                          isRegistered 
                            ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-2 border-green-300' 
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                        }`}
                      >
                        {(() => {
                          const status = getContestStatus(contest.startTime, contest.duration);
                          if (status === 'ongoing') {
                            return (
                              <span className="flex items-center justify-center gap-2">
                                <span>Start Contest</span>
                                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                  →
                                </motion.span>
                              </span>
                            );
                          }
                          if (isRegistered) {
                            return (
                              <span className="flex items-center justify-center gap-2">
                                ✅ Registered
                              </span>
                            );
                          }
                          return (
                            <span className="flex items-center justify-center gap-2">
                              <span>Register Now</span>
                              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                →
                              </motion.span>
                            </span>
                          );
                        })()}
                      </motion.button>
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
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <motion.span 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl"
              >
                📚
              </motion.span>
              Past Contests
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastContests.slice(0, 6).map((contest, index) => (
                <motion.div
                  key={contest._id || contest.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -4,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-blue-400 transition-all cursor-pointer min-h-[160px] flex flex-col"
                  onClick={() => setSelectedContest(contest)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getDifficultyColor(contest.difficulty)}`}>
                      {contest.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2.5 py-1 rounded-full">Ended</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2.5 line-clamp-2 min-h-[3.5rem] leading-7">{contest.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-auto">
                    <span>👥 {contest.participants} participated</span>
                  </div>
                </motion.div>
              ))}
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
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowRegisterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-7 max-w-lg w-full shadow-2xl border border-gray-100"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl mb-3"
                >
                  🎯
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Registration</h3>
                <p className="text-gray-600 text-sm">You're about to register for:</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-lg p-5 mb-6 border-2 border-blue-300 shadow-sm">
                <h4 className="text-lg font-bold text-blue-800 mb-3">{contestToRegister.title}</h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600">🚀</span>
                    <span className="font-semibold">Start:</span>
                    <span>{formatTime(contestToRegister.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-red-600">🏁</span>
                    <span className="font-semibold">End:</span>
                    <span>{formatTime(calculateEndTime(contestToRegister.startTime, contestToRegister.duration))}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span>⏱️</span>
                    <span>{formatDuration(contestToRegister.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span>📝</span>
                    <span>{Array.isArray(contestToRegister.problems) ? contestToRegister.problems.length : contestToRegister.problems || 0} Problems</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "rgb(229, 231, 235)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-3 rounded-lg font-semibold bg-gray-100 text-gray-700 border-2 border-gray-200 transition-all min-h-[48px] flex items-center justify-center"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onClick={confirmRegistration}
                  className="flex-1 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md transition-all min-h-[48px] flex items-center justify-center"
                >
                  ✅ Confirm Registration
                </motion.button>
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
              className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl border border-gray-100 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedContest(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2.5 mb-4">
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border-2 ${getDifficultyColor(selectedContest.difficulty)}`}
                  >
                    {selectedContest.difficulty}
                  </motion.span>
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                  >
                    {selectedContest.type}
                  </motion.span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-3 leading-tight">{selectedContest.title}</h2>
                <p className="text-gray-600">{selectedContest.description}</p>
              </div>

              {/* Contest Info Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Start Time */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border-2 border-blue-200 min-h-[110px] flex items-center shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                      🚀
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-1.5">Start Time</div>
                      <div className="text-sm font-bold text-gray-800">{formatDateTime(selectedContest.startTime).date}</div>
                      <div className="text-base font-bold text-blue-700">{formatDateTime(selectedContest.startTime).time}</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* End Time */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border-2 border-blue-200 min-h-[110px] flex items-center shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                      🏁
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-1.5">End Time</div>
                      <div className="text-sm font-bold text-gray-800">{formatDateTime(calculateEndTime(selectedContest.startTime, selectedContest.duration)).date}</div>
                      <div className="text-base font-bold text-blue-700">{formatDateTime(calculateEndTime(selectedContest.startTime, selectedContest.duration)).time}</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Duration */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border-2 border-blue-200 min-h-[110px] flex items-center shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                      ⏱️
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-1.5">Duration</div>
                      <div className="text-base font-bold text-gray-800">{formatDuration(selectedContest.duration)}</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Problems */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border-2 border-blue-200 min-h-[110px] flex items-center shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                      📝
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-1.5">Problems</div>
                      <div className="text-base font-bold text-gray-800">
                        {Array.isArray(selectedContest.problems) ? selectedContest.problems.length : selectedContest.problems || 0} Challenges
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Prize */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-r from-blue-50 via-blue-50 to-white rounded-xl p-5 border-2 border-blue-200 mb-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🏆</div>
                  <div className="flex-1">
                    <div className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">Contest Prize</div>
                    <div className="text-base font-bold text-gray-800">{selectedContest.prize}</div>
                  </div>
                </div>
              </motion.div>

              {/* Topics */}
              {selectedContest.tags && selectedContest.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Topics Covered</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedContest.tags.map((tag, i) => {
                      const label = typeof tag === 'string' ? tag : (tag.label || tag.name || tag.title || JSON.stringify(tag));
                      return (
                        <motion.span
                          key={`tag-${i}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ delay: i * 0.05 }}
                          className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 border-2 border-blue-300 font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                        >
                          {label}
                        </motion.span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Problems List */}
              {Array.isArray(selectedContest.problems) && selectedContest.problems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2.5">
                    <span className="text-xl">📝</span>
                    <span>Contest Problems ({selectedContest.problems.length})</span>
                  </h3>
                  <div className="space-y-2.5">
                    {selectedContest.problems.map((problem, index) => {
                      const problemId = `${selectedContest._id || selectedContest.id}-${index}`;
                      const status = problemProgress[problemId] || 'not-started';
                      
                      return (
                        <motion.div
                          key={`problem-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                          whileHover={{ 
                            scale: 1.02, 
                            x: 4,
                            transition: { duration: 0.2 }
                          }}
                          className="bg-gradient-to-r from-blue-50 via-white to-white p-5 rounded-lg border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all shadow-sm hover:shadow-md min-h-[80px] flex items-center"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {/* Status Indicator */}
                              <div className="flex items-center justify-center w-7">
                                {getStatusIcon(status)}
                              </div>
                              
                              {/* Problem Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-lg text-xs font-bold">
                                    #{index + 1}
                                  </span>
                                  <h4 className="text-base font-bold text-gray-800">
                                    {problem.title || `Problem ${index + 1}`}
                                  </h4>
                                </div>
                                {problem.description && (
                                  <p className="text-gray-600 text-sm line-clamp-2">{problem.description}</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Difficulty Badge */}
                            {problem.difficulty && (
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(37, 99, 235, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  const status = getContestStatus(selectedContest.startTime, selectedContest.duration);
                  const contestId = selectedContest._id || selectedContest.id;
                  if (status === 'ongoing') {
                    navigate(`/contest/${contestId}/problems`);
                  } else {
                    handleRegisterClick(selectedContest);
                  }
                }}
                className={`w-full py-3.5 rounded-xl font-semibold text-base shadow-md transition-all min-h-[52px] flex items-center justify-center ${
                  registrations[selectedContest._id || selectedContest.id]
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                }`}
              >
                {(() => {
                  const status = getContestStatus(selectedContest.startTime, selectedContest.duration);
                  const isRegistered = registrations[selectedContest._id || selectedContest.id];
                  
                  if (status === 'ongoing') {
                    return (
                      <span className="flex items-center justify-center gap-2">
                        <span>Start Contest</span>
                        <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                          →
                        </motion.span>
                      </span>
                    );
                  }
                  
                  if (isRegistered) {
                    return (
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-lg">✅</span>
                        <span>Already Registered</span>
                      </span>
                    );
                  }
                  
                  return (
                    <span className="flex items-center justify-center gap-2">
                      <span>Register for Contest</span>
                      <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        →
                      </motion.span>
                    </span>
                  );
                })()}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contests;
