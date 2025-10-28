import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getAllContests,
  createContest,
  updateContest,
  deleteContest,
  updateContestProblems,
  getContestStatistics
} from '../services/ContestService';
import AccentBlobs from '../components/AccentBlobs';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contests');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
    totalProblems: 0,
    avgProblemsPerContest: 0,
    byDifficulty: { Easy: 0, Medium: 0, Hard: 0, Expert: 0 }
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [draftProblems, setDraftProblems] = useState([]);

  // Check admin authentication
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (!adminAuth) {
      toast.error('Unauthorized access! Redirecting...');
      navigate('/admin-login');
    }
  }, [navigate]);

  // Load contests from Firebase
  useEffect(() => {
    loadContests();
    loadStatistics();
  }, []);

  const loadContests = async () => {
    try {
      setLoading(true);
      const fetchedContests = await getAllContests();
      setContests(fetchedContests);
    } catch (error) {
      console.error('Error loading contests:', error);
      toast.error('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getContestStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Decorative corner accents (shared) */}
      <AccentBlobs />
      {/* Tuned left-side vertical gradient accent: wider, slightly darker, higher opacity, stronger blur, behind content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-full w-40 sm:w-56 bg-gradient-to-r from-blue-200 to-transparent opacity-80 blur-2xl -z-10"
      />
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                🔐
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-blue-100">Contest Management System</p>
              </div>
            </div>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all"
            >
              🚪 Logout
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">📊</div>
              <div className="text-3xl font-bold text-blue-700">{statistics.total}</div>
            </div>
            <div className="text-gray-600 font-semibold">Total Contests</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">✅</div>
              <div className="text-3xl font-bold text-green-700">
                {statistics.active}
              </div>
            </div>
            <div className="text-gray-600 font-semibold">Active Contests</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">⏰</div>
              <div className="text-3xl font-bold text-yellow-700">
                {statistics.upcoming}
              </div>
            </div>
            <div className="text-gray-600 font-semibold">Upcoming Contests</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">📝</div>
              <div className="text-3xl font-bold text-purple-700">
                {statistics.totalProblems}
              </div>
            </div>
            <div className="text-gray-600 font-semibold">Total Problems</div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('contests')}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === 'contests'
                  ? 'text-blue-700 border-b-4 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🏆 Contests
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'text-blue-700 border-b-4 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📈 Analytics
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-semibold">Loading contests...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'contests' && (
                  <ContestsTab
                    contests={contests}
                    onCreateContest={() => {
                      setDraftProblems([]);
                      setSelectedContest(null);
                      setShowCreateModal(true);
                    }}
                    onEditContest={(contest) => {
                      setSelectedContest(contest);
                      setShowCreateModal(true);
                    }}
                    onDeleteContest={async (id) => {
                      if (window.confirm('Are you sure you want to delete this contest?')) {
                        try {
                          await deleteContest(id);
                          toast.success('Contest deleted successfully');
                          await loadContests();
                          await loadStatistics();
                        } catch (error) {
                          console.error('Error deleting contest:', error);
                          toast.error('Failed to delete contest');
                        }
                      }
                    }}
                    onManageQuestions={(contest) => {
                      setSelectedContest(contest);
                      setShowQuestionModal(true);
                    }}
                  />
                )}

                {activeTab === 'analytics' && (
                  <AnalyticsTab contests={contests} statistics={statistics} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Contest Modal */}
      <CreateContestModal
        show={showCreateModal}
        contest={selectedContest}
        problems={draftProblems}
        onManageQuestions={() => setShowQuestionModal(true)}
        onUpdateProblems={(probs) => setDraftProblems(probs)}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedContest(null);
          setDraftProblems([]);
        }}
        onSave={async (contest) => {
          try {
            if (selectedContest) {
              // Edit existing
              await updateContest(contest.id, contest);
              toast.success('Contest updated successfully');
            } else {
              // Create new - include any drafted problems
              const newContest = {
                ...contest,
                createdAt: new Date().toISOString(),
                problems: draftProblems || []
              };
              await createContest(newContest);
              toast.success('Contest created successfully');
            }
            await loadContests();
            await loadStatistics();
            setShowCreateModal(false);
            setSelectedContest(null);
            setDraftProblems([]);
          } catch (error) {
            console.error('Error saving contest:', error);
            toast.error('Failed to save contest');
          }
        }}
      />

      {/* Manage Questions Modal */}
      <ManageQuestionsModal
        show={showQuestionModal}
        contest={selectedContest}
        initialProblems={draftProblems}
        onClose={() => {
          setShowQuestionModal(false);
          if (!selectedContest) setDraftProblems((p) => p || []);
          setSelectedContest(null);
        }}
        onSave={async (problems) => {
          try {
            if (selectedContest) {
              // Saving problems for an existing contest
              await updateContestProblems(selectedContest.id, problems);
              toast.success('Questions updated successfully');
              await loadContests();
              await loadStatistics();
              setShowQuestionModal(false);
              setSelectedContest(null);
            } else {
              // We're creating a new contest; store in draftProblems
              setDraftProblems(problems || []);
              toast.success('Questions saved to draft. Create contest to persist.');
              setShowQuestionModal(false);
            }
          } catch (error) {
            console.error('Error updating questions:', error);
            toast.error('Failed to update questions');
          }
        }}
      />
    </div>
  );
};

// Contests Tab Component
const ContestsTab = ({ contests, onCreateContest, onEditContest, onDeleteContest, onManageQuestions }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Contests</h2>
        <motion.button
          onClick={onCreateContest}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">➕</span>
          Create New Contest
        </motion.button>
      </div>

      {contests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg font-semibold">No contests yet</p>
          <p className="text-sm">Create your first contest to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {contests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              onEdit={() => onEditContest(contest)}
              onDelete={() => onDeleteContest(contest.id)}
              onManageQuestions={() => onManageQuestions(contest)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Contest Card Component
const ContestCard = ({ contest, onEdit, onDelete, onManageQuestions }) => {
  const handleDownloadReport = async (format = 'csv') => {
    try {
      // dynamic import of service to avoid circular issues in some bundlers
      const { getContestReport } = await import('../services/ContestService');
      const report = await getContestReport(contest.id);

      if (format === 'json') {
        const json = JSON.stringify(report, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(report.title || 'contest').replace(/[^a-z0-9-_]/gi, '_')}_report_${report.id || ''}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success('JSON report download started');
        return;
      }

      // CSV flow - create problems CSV first
      const problemsHeader = [
        'contest_id', 'title', 'description', 'type', 'difficulty', 'status', 'startTime', 'duration', 'participants', 'createdAt', 'updatedAt',
        'problem_index', 'problem_title', 'problem_difficulty', 'points', 'problem_description', 'problem_testcases'
      ];

      const problemRows = [];
      const problems = report.problems || [];
      if (problems.length === 0) {
        problemRows.push([
          report.id, report.title, report.description, report.type, report.difficulty, report.status, report.startTime, report.duration, report.participants, report.createdAt, report.updatedAt,
          '', '', '', '', '', ''
        ]);
      } else {
        problems.forEach((p, idx) => {
          problemRows.push([
            report.id, report.title, report.description, report.type, report.difficulty, report.status, report.startTime, report.duration, report.participants, report.createdAt, report.updatedAt,
            idx + 1, p.title || '', p.difficulty || '', p.points || '', (p.description || '').replace(/\r?\n/g, ' '), JSON.stringify(p.testCases || [])
          ]);
        });
      }

      const problemsCsvLines = [problemsHeader.join(','), ...problemRows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))];
      const problemsCsv = problemsCsvLines.join('\n');

      // Trigger problems CSV download
      const blobP = new Blob([problemsCsv], { type: 'text/csv;charset=utf-8;' });
      const urlP = URL.createObjectURL(blobP);
      const aP = document.createElement('a');
      aP.href = urlP;
      aP.download = `${(report.title || 'contest').replace(/[^a-z0-9-_]/gi, '_')}_problems_${report.id || ''}.csv`;
      document.body.appendChild(aP);
      aP.click();
      aP.remove();
      URL.revokeObjectURL(urlP);

      // If submissions exist, create a second CSV for submissions
      const submissions = report.submissions || [];
      if (submissions.length > 0) {
        const subsHeader = [
          'submission_id', 'contest_id', 'user_id', 'username', 'problem_index', 'language_id', 'verdict', 'status', 'time', 'memory', 'code_length', 'createdAt'
        ];
        const subsRows = submissions.map(s => [
          s.id || '', s.contestId || '', s.userId || s.user_id || '', s.username || s.user_name || '', s.problemIndex ?? s.problem_index ?? '', s.languageId ?? s.language_id ?? '', s.verdict || s.result || '', s.status || '', s.time || s.executionTime || '', s.memory || s.memoryUsed || '', s.codeLength || (s.code ? s.code.length : ''), s.createdAt || ''
        ]);

        const subsCsvLines = [subsHeader.join(','), ...subsRows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))];
        const subsCsv = subsCsvLines.join('\n');

        const blobS = new Blob([subsCsv], { type: 'text/csv;charset=utf-8;' });
        const urlS = URL.createObjectURL(blobS);
        const aS = document.createElement('a');
        aS.href = urlS;
        aS.download = `${(report.title || 'contest').replace(/[^a-z0-9-_]/gi, '_')}_submissions_${report.id || ''}.csv`;
        document.body.appendChild(aS);
        aS.click();
        aS.remove();
        URL.revokeObjectURL(urlS);
      }

      toast.success('Report download(s) started');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };
  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'bg-green-100 text-green-700 border-green-300',
      Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Hard: 'bg-orange-100 text-orange-700 border-orange-300',
      Expert: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-300',
      active: 'bg-green-100 text-green-700 border-green-300',
      ended: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:border-blue-300 transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{contest.title}</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2 py-1 rounded-lg font-semibold border ${getDifficultyColor(contest.difficulty)}`}>
              {contest.difficulty}
            </span>
            <span className={`text-xs px-2 py-1 rounded-lg font-semibold border ${getStatusColor(contest.status)}`}>
              {contest.status}
            </span>
            <span className="text-xs px-2 py-1 rounded-lg font-semibold bg-purple-100 text-purple-700 border border-purple-300">
              {contest.problems?.length || 0} Problems
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>Start: {new Date(contest.startTime).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>⏱️</span>
          <span>Duration: {contest.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🎯</span>
          <span>Type: {contest.type}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <motion.button
          onClick={onManageQuestions}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
        >
          📝 Questions
        </motion.button>
        <motion.button
          onClick={() => handleDownloadReport('csv')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm"
        >
          📥 CSV
        </motion.button>
        <motion.button
          onClick={() => handleDownloadReport('json')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold text-sm"
        >
          🗄️ JSON
        </motion.button>
        <motion.button
          onClick={onEdit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-sm"
        >
          ✏️ Edit
        </motion.button>
        <motion.button
          onClick={onDelete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm"
        >
          🗑️
        </motion.button>
      </div>
    </motion.div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ contests, statistics }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Contest Analytics</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Contest Distribution</h3>
          <div className="space-y-3">
            {Object.entries(statistics.byDifficulty).map(([diff, count]) => (
              <div key={diff} className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">{diff}</span>
                <span className="text-2xl font-bold text-blue-700">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border-2 border-purple-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Problem Statistics</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Problems</div>
              <div className="text-3xl font-bold text-purple-700">{statistics.totalProblems}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Avg Problems/Contest</div>
              <div className="text-3xl font-bold text-purple-700">{statistics.avgProblemsPerContest}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Contest Modal Component
const CreateContestModal = ({ show, contest, onClose, onSave, problems = [], onManageQuestions }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    type: 'Algorithm',
    difficulty: 'Medium',
    startTime: '',
    endTime: '',
    duration: '2 hours',
    status: 'upcoming',
    prize: '',
    rating: '1400-1800',
    tags: '',
    technology: ''
  });

  useEffect(() => {
    if (contest) {
      setFormData({
        ...contest,
        tags: contest.tags?.join(', ') || '',
        technology: (contest.technology && Array.isArray(contest.technology)) ? contest.technology.join(', ') : (contest.technology || '')
      });
    } else {
      // Reset form
      setFormData({
        id: '',
        title: '',
        description: '',
        type: 'Algorithm',
        difficulty: 'Medium',
        startTime: '',
        endTime: '',
        duration: '2 hours',
        status: 'upcoming',
        prize: '',
        rating: '1400-1800',
        tags: '',
        technology: ''
      });
    }
  }, [contest, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation for end time
    if (formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        toast.error('End time must be a valid date/time that is after the start time');
        return;
      }
    }

    // If creating a new contest and an ID was provided, validate format and uniqueness
    if (!contest && formData.id) {
      const id = String(formData.id).trim();
      const validId = /^[a-zA-Z0-9_-]+$/.test(id);
      if (!validId) {
        toast.error('Contest ID may only contain letters, numbers, hyphens and underscores');
        return;
      }

      try {
        // Use efficient server-side check for id existence
        const { checkContestId } = await import('../services/ContestService');
        const exists = await checkContestId(id);
        if (exists) {
          toast.error('Contest ID already exists. Choose a different ID or leave empty to auto-generate.');
          return;
        }
      } catch (err) {
        // If we can't verify uniqueness due to network error, warn but allow creation
        console.warn('Could not verify contest ID uniqueness:', err);
        toast.info('Could not verify contest ID uniqueness due to network error; server will enforce uniqueness.');
      }
    }

    const contestData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      technology: formData.technology.split(',').map(t => t.trim()).filter(Boolean),
      participants: contest?.participants || 0
    };
    
    // Allow specifying id when creating, and preserve id when editing
    if (contest?.id) {
      contestData.id = contest.id;
    } else if (formData.id) {
      contestData.id = formData.id;
    }
    
    onSave(contestData);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl border-2 border-blue-200 my-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                {contest ? 'Edit Contest' : 'Create New Contest'}
              </h2>
              <p className="text-gray-600 mt-1">Fill in the contest details</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contest Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contest ID (optional)</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                    placeholder="custom-contest-id (leave empty to auto-generate)"
                    disabled={!!contest?.id}
                  />
                  {contest?.id && (
                    <p className="text-xs text-gray-500 mt-1">Contest ID cannot be changed while editing</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contest Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option>Algorithm</option>
                  <option>Data Structures</option>
                  <option>System Design</option>
                  <option>Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty *</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                  <option>Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="Optional: specify explicit end time"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration *</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option>1 hour</option>
                  <option>1.5 hours</option>
                  <option>2 hours</option>
                  <option>2.5 hours</option>
                  <option>3 hours</option>
                  <option>4 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating Range</label>
                <input
                  type="text"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., 1400-1800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prize/Reward</label>
                <input
                  type="text"
                  value={formData.prize}
                  onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Top 10 get certificates"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                rows="3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="e.g., Arrays, DP, Strings"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Technology (comma-separated)</label>
              <input
                type="text"
                value={formData.technology}
                onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="e.g., JavaScript, Python, React"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Problems: <span className="font-semibold">{(problems || []).length}</span></div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onManageQuestions && onManageQuestions()}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold"
                  >
                    Manage Problems
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateProblems && onUpdateProblems([])}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold"
                  >
                    Clear Draft
                  </button>
                </div>
              </div>

              {/* Inline preview of drafted problems with simple reorder/delete */}
              {(problems || []).length > 0 && (
                <div className="space-y-2">
                  {(problems || []).map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border">
                      <div>
                        <div className="font-semibold">{idx + 1}. {p.title}</div>
                        <div className="text-xs text-gray-600">{p.difficulty} • {p.points} pts</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!onUpdateProblems) return;
                            const copy = [...problems];
                            if (idx > 0) {
                              const tmp = copy[idx-1]; copy[idx-1] = copy[idx]; copy[idx] = tmp;
                              onUpdateProblems(copy);
                            }
                          }}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                        >↑</button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!onUpdateProblems) return;
                            const copy = [...problems];
                            if (idx < copy.length - 1) {
                              const tmp = copy[idx+1]; copy[idx+1] = copy[idx]; copy[idx] = tmp;
                              onUpdateProblems(copy);
                            }
                          }}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                        >↓</button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!onUpdateProblems) return;
                            const copy = [...problems]; copy.splice(idx, 1); onUpdateProblems(copy);
                          }}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                        >Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg"
              >
                {contest ? 'Update Contest' : 'Create Contest'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Manage Questions Modal Component (continued in next file due to size)
const ManageQuestionsModal = ({ show, contest, initialProblems = [], onClose, onSave }) => {
  const [problems, setProblems] = useState([]);
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);

  useEffect(() => {
    if (contest?.problems) {
      setProblems(contest.problems);
    } else if (initialProblems && initialProblems.length > 0) {
      setProblems(initialProblems);
    } else {
      setProblems([]);
    }
  }, [contest, initialProblems]);

  const handleAddProblem = (problem) => {
    if (editingProblem !== null) {
      // Edit existing
      const updated = [...problems];
      updated[editingProblem] = problem;
      setProblems(updated);
      setEditingProblem(null);
    } else {
      // Add new
      setProblems([...problems, problem]);
    }
    setShowAddProblem(false);
  };

  const handleDeleteProblem = (index) => {
    setProblems(problems.filter((_, i) => i !== index));
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 max-w-5xl w-full shadow-2xl border-2 border-blue-200 my-8 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                Manage Questions
              </h2>
              <p className="text-gray-600 mt-1">{contest?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <motion.button
              onClick={() => {
                setEditingProblem(null);
                setShowAddProblem(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">➕</span>
              Add New Problem
            </motion.button>
          </div>

          {problems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg font-semibold">No problems added yet</p>
              <p className="text-sm">Add problems to this contest</p>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <ProblemCard
                  key={index}
                  problem={problem}
                  index={index}
                  onEdit={() => {
                    setEditingProblem(index);
                    setShowAddProblem(true);
                  }}
                  onDelete={() => handleDeleteProblem(index)}
                />
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={() => onSave(problems)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg"
            >
              Save All Changes
            </motion.button>
          </div>

          {showAddProblem && (
            <AddProblemForm
              problem={editingProblem !== null ? problems[editingProblem] : null}
              onSave={handleAddProblem}
              onCancel={() => {
                setShowAddProblem(false);
                setEditingProblem(null);
              }}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Problem Card Component
const ProblemCard = ({ problem, index, onEdit, onDelete }) => {
  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'bg-green-100 text-green-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      Hard: 'bg-red-100 text-red-700'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold text-gray-700">Problem {index + 1}</span>
            <span className={`text-xs px-3 py-1 rounded-lg font-semibold ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="text-xs px-3 py-1 rounded-lg font-semibold bg-purple-100 text-purple-700">
              {problem.points} pts
            </span>
          </div>
          <h4 className="font-bold text-gray-800 mb-2">{problem.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{problem.description}</p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Problem Form Component
const AddProblemForm = ({ problem, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: problem?.title || '',
    difficulty: problem?.difficulty || 'Easy',
    points: problem?.points || 100,
    description: problem?.description || '',
    examples: problem?.examples || [{ input: '', output: '', explanation: '' }],
    constraints: problem?.constraints || [''],
    testCases: problem?.testCases || [{ input: '', output: '', isHidden: false }]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onSave(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '', explanation: '' }]
    });
  };

  const removeExample = (index) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index)
    });
  };

  const updateExample = (index, field, value) => {
    const updated = [...formData.examples];
    updated[index][field] = value;
    setFormData({ ...formData, examples: updated });
  };

  const addConstraint = () => {
    setFormData({
      ...formData,
      constraints: [...formData.constraints, '']
    });
  };

  const removeConstraint = (index) => {
    setFormData({
      ...formData,
      constraints: formData.constraints.filter((_, i) => i !== index)
    });
  };

  const updateConstraint = (index, value) => {
    const updated = [...formData.constraints];
    updated[index] = value;
    setFormData({ ...formData, constraints: updated });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', output: '', isHidden: false }]
    });
  };

  const removeTestCase = (index) => {
    setFormData({
      ...formData,
      testCases: formData.testCases.filter((_, i) => i !== index)
    });
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...formData.testCases];
    updated[index][field] = value;
    setFormData({ ...formData, testCases: updated });
  };

  const toggleTestCaseVisibility = (index) => {
    const updated = [...formData.testCases];
    updated[index].isHidden = !updated[index].isHidden;
    setFormData({ ...formData, testCases: updated });
  };

  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return 'Question Details';
      case 2: return 'Description & Constraints';
      case 3: return 'Sample Test Cases & Explanations';
      case 4: return 'Test Cases Configuration';
      default: return 'Add Problem';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header with Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">
              {problem ? 'Edit Problem' : 'Add New Problem'}
            </h3>
            <div className="text-sm font-semibold text-blue-600">
              Step {currentStep} of 4
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-all ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 font-semibold">{getStepTitle()}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Question Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Problem Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., Two Sum"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Points *</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  min="50"
                  step="50"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Points awarded for solving this problem</p>
              </div>
            </div>
          )}

          {/* Step 2: Description & Constraints */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Problem Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                  rows="6"
                  placeholder="Describe the problem in detail..."
                  required
                />
              </div>

              {/* Constraints Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Constraints</label>
                  <button
                    type="button"
                    onClick={addConstraint}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
                  >
                    + Add Constraint
                  </button>
                </div>
                {formData.constraints.map((constraint, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={constraint}
                      onChange={(e) => updateConstraint(index, e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      placeholder="e.g., 1 <= n <= 10^5"
                    />
                    {formData.constraints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeConstraint(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Sample Test Cases & Explanations */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Sample Examples *</label>
                  <p className="text-xs text-gray-500 mt-1">Add examples with explanations to help users understand</p>
                </div>
                <button
                  type="button"
                  onClick={addExample}
                  className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
                >
                  + Add Example
                </button>
              </div>
              
              {formData.examples.map((example, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-4 mb-3 border-2 border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-blue-700">Example {index + 1}</span>
                    {formData.examples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExample(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Input *</label>
                      <textarea
                        value={example.input}
                        onChange={(e) => updateExample(index, 'input', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-mono bg-white"
                        rows="2"
                        placeholder="nums = [2,7,11,15], target = 9"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Output *</label>
                      <textarea
                        value={example.output}
                        onChange={(e) => updateExample(index, 'output', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-mono bg-white"
                        rows="2"
                        placeholder="[0,1]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Explanation (optional)</label>
                      <textarea
                        value={example.explanation || ''}
                        onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm bg-white"
                        rows="2"
                        placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Test Cases Configuration */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Test Cases Configuration</h4>
                    <p className="text-sm text-gray-600">
                      Add test cases and mark them as <span className="font-semibold text-green-700">Visible</span> (shown to participants) 
                      or <span className="font-semibold text-purple-700">Hidden</span> (used for final evaluation only)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Test Cases *</label>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold"
                >
                  + Add Test Case
                </button>
              </div>
              
              {formData.testCases.map((testCase, index) => (
                <div 
                  key={index} 
                  className={`rounded-lg p-4 mb-3 border-2 ${
                    testCase.isHidden 
                      ? 'bg-purple-50 border-purple-200' 
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${
                        testCase.isHidden ? 'text-purple-700' : 'text-green-700'
                      }`}>
                        Test Case {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleTestCaseVisibility(index)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          testCase.isHidden
                            ? 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                            : 'bg-green-200 text-green-800 hover:bg-green-300'
                        }`}
                      >
                        {testCase.isHidden ? '🔒 Hidden' : '👁️ Visible'}
                      </button>
                    </div>
                    {formData.testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Input *</label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-mono bg-white"
                        rows="2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Output *</label>
                      <textarea
                        value={testCase.output}
                        onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-mono bg-white"
                        rows="2"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 mt-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">Tip:</span> Add at least 2-3 visible test cases for debugging 
                    and 3-5 hidden test cases for thorough evaluation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all"
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl transition-all hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              {currentStep === 4 ? (problem ? 'Update Problem' : 'Add Problem') : 'Next →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
