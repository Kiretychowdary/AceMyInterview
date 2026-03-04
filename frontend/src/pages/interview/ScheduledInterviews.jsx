import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, BookOpen, Building2, TrendingUp, ArrowRight, Users, Target, CheckCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ScheduledInterviews = () => {
  const [interviews, setInterviews] = useState({ upcoming: [], ongoing: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [registrations, setRegistrations] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [highlightedInterviewId, setHighlightedInterviewId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchScheduledInterviews();
    
    // Check if there's an interview ID in URL
    const interviewId = searchParams.get('id');
    if (interviewId) {
      setHighlightedInterviewId(interviewId);
      // Scroll to the interview after a small delay
      setTimeout(() => {
        const element = document.getElementById(`interview-${interviewId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }

    // Set up real-time status checking (every 30 seconds)
    const statusCheckInterval = setInterval(() => {
      updateInterviewStatuses();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(statusCheckInterval);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchScheduledInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/public/scheduled-interviews`);
      const data = await response.json();

      if (data.success) {
        console.log('📅 Interviews received from backend:', data.interviews);
        console.log('📅 Sample interview:', data.interviews.upcoming?.[0] || data.interviews.ongoing?.[0]);
        setInterviews(data.interviews);
        
        // Immediately check and update statuses after fetching
        setTimeout(() => {
          updateInterviewStatuses();
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching scheduled interviews:', error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const updateInterviewStatuses = () => {
    setInterviews(prev => {
      const now = new Date();
      const allInterviews = [...prev.upcoming, ...prev.ongoing];
      
      const updated = { upcoming: [], ongoing: [] };
      
      allInterviews.forEach(interview => {
        const status = determineInterviewStatus(interview, now);
        console.log(`🔄 Interview "${interview.interviewName}" status: ${status}`);
        
        // Only show upcoming and ongoing interviews
        if (status === 'ongoing') {
          updated.ongoing.push(interview);
        } else if (status === 'upcoming') {
          updated.upcoming.push(interview);
        }
        // Completed interviews are not added to either array (filtered out)
      });
      
      console.log(`📊 After status update: ${updated.upcoming.length} upcoming, ${updated.ongoing.length} ongoing`);
      return updated;
    });
  };

  const determineInterviewStatus = (interview, now) => {
    let startDateTime, endDateTime;

    if (interview.availableFromDate && interview.availableFromTime) {
      // New flexible timing
      const fromDate = new Date(interview.availableFromDate);
      const [hours, minutes] = interview.availableFromTime.split(':');
      fromDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      startDateTime = fromDate;

      const toDate = new Date(interview.availableToDate || interview.availableFromDate);
      const [endHours, endMinutes] = (interview.availableToTime || interview.availableFromTime).split(':');
      toDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
      endDateTime = toDate;
    } else if (interview.scheduledDate) {
      // Legacy timing
      const date = new Date(interview.scheduledDate);
      const [startHours, startMinutes] = interview.startTime.split(':');
      date.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
      startDateTime = date;

      const endDate = new Date(interview.scheduledDate);
      const [endHours, endMinutes] = interview.endTime.split(':');
      endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
      endDateTime = endDate;
    } else {
      return 'upcoming';
    }

    console.log(`⏰ Checking status for "${interview.interviewName}":`, {
      now: now.toLocaleTimeString(),
      start: startDateTime.toLocaleTimeString(),
      end: endDateTime.toLocaleTimeString(),
      nowTime: now.getTime(),
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime()
    });

    if (now >= startDateTime && now <= endDateTime) {
      return 'ongoing';
    } else if (now < startDateTime) {
      return 'upcoming';
    } else {
      return 'completed';
    }
  };

  const fetchUserRegistrations = async () => {
    if (!user || !user.uid) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/public/users/${user.uid}/registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        const regMap = {};
        data.registrations.forEach(reg => {
          regMap[reg.interviewId] = reg;
        });
        setRegistrations(regMap);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegisterClick = (interview) => {
    if (!user) {
      toast.warning('Please login to register for interviews');
      navigate('/login');
      return;
    }

    setSelectedInterview(interview);
    setShowConfirmModal(true);
  };

  const handleConfirmRegistration = async () => {
    if (!selectedInterview || !user) return;

    setRegistering(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${API_BASE_URL}/api/public/scheduled-interviews/${selectedInterview.interviewId}/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: user.uid,
            userName: user.displayName || user.email,
            userEmail: user.email
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Successfully registered for the interview!');
        setRegistrations(prev => ({
          ...prev,
          [selectedInterview.interviewId]: data.registration
        }));
        setShowConfirmModal(false);
        setSelectedInterview(null);
      } else {
        toast.error(data.error || 'Failed to register');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register for interview');
    } finally {
      setRegistering(false);
    }
  };

  const handleStartInterview = (interview) => {
    if (!user) {
      toast.warning('Please login to participate in interviews');
      navigate('/login');
      return;
    }

    // Check if user is registered
    if (!registrations[interview.interviewId]) {
      toast.warning('Please register for this interview first');
      return;
    }

    // Check if interview is available (time window validation)
    if (interview.status !== 'ongoing') {
      toast.warning('This interview is not currently available');
      return;
    }

    // Navigate to face-to-face interview with interview details
    navigate('/face-to-face-interview', {
      state: {
        scheduledInterview: {
          interviewId: interview.interviewId,
          scheduledInterviewId: interview._id,
          interviewName: interview.interviewName,
          interviewType: interview.interviewType,
          topics: interview.topics,
          companyName: interview.companyName,
          difficulty: interview.difficulty,
          numberOfQuestions: interview.numberOfQuestions,
          duration: interview.duration,
          isScheduled: true
        }
      }
    });
  };

  const formatDate = (date) => {
    if (!date) return 'TBD';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return time;
  };

  const getInterviewDateTime = (interview) => {
    console.log('🔍 Getting date/time for interview:', {
      interviewName: interview.interviewName,
      availableFromDate: interview.availableFromDate,
      availableFromTime: interview.availableFromTime,
      availableToDate: interview.availableToDate,
      availableToTime: interview.availableToTime,
      scheduledDate: interview.scheduledDate,
      startTime: interview.startTime,
      endTime: interview.endTime
    });

    // Handle new flexible timing
    if (interview.availableFromDate && interview.availableFromTime) {
      const result = {
        date: interview.availableFromDate,
        startTime: interview.availableFromTime,
        endTime: interview.availableToTime || interview.availableFromTime,
        isFlexible: true
      };
      console.log('✅ Using flexible timing:', result);
      return result;
    }
    // Handle legacy timing
    if (interview.scheduledDate) {
      const result = {
        date: interview.scheduledDate,
        startTime: interview.startTime,
        endTime: interview.endTime,
        isFlexible: false
      };
      console.log('✅ Using legacy timing:', result);
      return result;
    }
    console.log('⚠️ No valid date/time found');
    return {
      date: null,
      startTime: null,
      endTime: null,
      isFlexible: false
    };
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-green-700 bg-green-100 border-green-300',
      medium: 'text-yellow-700 bg-yellow-100 border-yellow-300',
      hard: 'text-red-700 bg-red-100 border-red-300'
    };
    return colors[difficulty] || colors.medium;
  };

  const displayInterviews = activeTab === 'upcoming' ? interviews.upcoming : interviews.ongoing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Scheduled Interviews
            </h1>
            <p className="text-gray-600 text-lg">
              Join scheduled interviews and practice your skills
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white border border-blue-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{interviews.upcoming.length}</p>
              <p className="text-gray-600 text-sm">Upcoming</p>
            </div>
            <div className="bg-white border border-green-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{interviews.ongoing.length}</p>
              <p className="text-gray-600 text-sm">Live Now</p>
            </div>
            <div className="bg-white border border-blue-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {interviews.upcoming.filter(i => i.interviewType === 'topic-based').length + 
                 interviews.ongoing.filter(i => i.interviewType === 'topic-based').length}
              </p>
              <p className="text-gray-600 text-sm">Topic-Based</p>
            </div>
            <div className="bg-white border border-blue-200 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {interviews.upcoming.filter(i => i.interviewType === 'company-based').length + 
                 interviews.ongoing.filter(i => i.interviewType === 'company-based').length}
              </p>
              <p className="text-gray-600 text-sm">Company-Based</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming Interviews ({interviews.upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'ongoing'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Live Now ({interviews.ongoing.length})
          </button>
        </div>

        {/* Interviews Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading interviews...</p>
          </div>
        ) : displayInterviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No {activeTab} interviews
            </h3>
            <p className="text-gray-600">
              {activeTab === 'upcoming' 
                ? 'Check back later for scheduled interviews'
                : 'No interviews are currently live'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayInterviews.map((interview, index) => (
              <motion.div
                key={interview._id}
                id={`interview-${interview.interviewId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-lg transition-all group ${
                  highlightedInterviewId === interview.interviewId
                    ? 'border-green-400 shadow-lg shadow-green-500/30 ring-2 ring-green-400/50'
                    : 'border-blue-200 hover:border-blue-400 hover:shadow-blue-200/50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {interview.interviewName}
                      </h3>
                      {highlightedInterviewId === interview.interviewId && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-600 text-xs font-medium rounded-full border border-green-400/30">
                          📋 Shared
                        </span>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(interview.difficulty)}`}>
                      {interview.difficulty.toUpperCase()}
                    </span>
                  </div>
                  {activeTab === 'ongoing' && (
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  {(() => {
                    const dateTime = getInterviewDateTime(interview);
                    return (
                      <>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(dateTime.date)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {formatTime(dateTime.startTime)} - {formatTime(dateTime.endTime)}
                          </span>
                        </div>
                      </>
                    );
                  })()}

                  <div className="flex items-center gap-2 text-gray-600">
                    {interview.interviewType === 'company-based' ? (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm font-medium text-gray-900">{interview.companyName}</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">
                          {interview.topics.length > 2 
                            ? `${interview.topics.slice(0, 2).join(', ')}...` 
                            : interview.topics.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                    <p className="text-gray-600 text-xs">Questions</p>
                    <p className="text-gray-900 font-bold mt-1">{interview.numberOfQuestions}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                    <p className="text-gray-600 text-xs">Duration</p>
                    <p className="text-gray-900 font-bold mt-1">{interview.duration} min</p>
                  </div>
                </div>

                {/* Description */}
                {interview.description && (
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {interview.description}
                  </p>
                )}

                {/* Action Buttons */}
                {!user ? (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    Login to Register
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : !registrations[interview.interviewId] ? (
                  <button
                    onClick={() => handleRegisterClick(interview)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <UserPlus className="w-5 h-5" />
                    Register Now
                  </button>
                ) : registrations[interview.interviewId].hasAttended ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 py-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Completed</span>
                  </div>
                ) : activeTab === 'ongoing' ? (
                  <button
                    onClick={() => handleStartInterview(interview)}
                    className="w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                  >
                    Start Interview
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-blue-600 py-3 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Registered</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedInterview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-blue-200"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Registration</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to register for:
              </p>
              <p className="text-blue-600 font-semibold text-lg mb-4">
                {selectedInterview.interviewName}
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-2 text-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="text-gray-900 font-medium">
                    {selectedInterview.interviewType === 'company-based' 
                      ? selectedInterview.companyName 
                      : selectedInterview.topics.join(', ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="text-gray-900 font-medium capitalize">{selectedInterview.difficulty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900 font-medium">{selectedInterview.duration} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="text-gray-900 font-medium">{selectedInterview.numberOfQuestions}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedInterview(null);
                  }}
                  disabled={registering}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRegistration}
                  disabled={registering}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {registering ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Registering...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduledInterviews;
