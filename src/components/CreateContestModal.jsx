import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Plus, X, Save, Trash2 } from 'lucide-react';

const CreateContestModal = ({ show, contest, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    duration: '',
    description: ''
  });

  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(getEmptyProblem());
  const [editingProblemIndex, setEditingProblemIndex] = useState(null);

  function getEmptyProblem() {
    return {
      title: '',
      description: '',
      constraints: '',
      inputFormat: '',
      outputFormat: '',
      sampleTests: [
        { input: '', output: '', explanation: '' },
        { input: '', output: '', explanation: '' }
      ],
      difficulty: 'medium',
      points: 100
    };
  }

  useEffect(() => {
    if (contest) {
      setFormData({
        title: contest.title || '',
        description: contest.description || '',
        startTime: toInputDateTime(contest.startTime),
        endTime: toInputDateTime(contest.endTime),
        registrationDeadline: toInputDateTime(contest.registrationDeadline),
        difficulty: contest.difficulty || 'medium',
        maxParticipants: contest.maxParticipants || '',
        rules: contest.rules || '',
        prizes: contest.prizes || '',
        tags: contest.tags || []
      });
      setProblems(contest.problems || []);
    } else {
      resetForm();
    }
  }, [contest, show]);

  const toInputDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      registrationDeadline: '',
      difficulty: 'medium',
      maxParticipants: '',
      rules: '',
      prizes: '',
      tags: []
    });
    setProblems([]);
    setActiveTab('basic');
  };

  const calculateRegistrationDeadline = (startTime) => {
    if (!startTime) return '';
    const start = new Date(startTime);
    const deadline = new Date(start.getTime() - 60000); // 1 minute before
    return deadline.toISOString().slice(0, 16);
  };

  const handleAddExample = () => {
    setCurrentProblem({
      ...currentProblem,
      examples: [...currentProblem.examples, { input: '', output: '', explanation: '' }]
    });
  };

  const handleRemoveExample = (index) => {
    setCurrentProblem({
      ...currentProblem,
      examples: currentProblem.examples.filter((_, i) => i !== index)
    });
  };

  const handleAddTestCase = () => {
    setCurrentProblem({
      ...currentProblem,
      testCases: [...currentProblem.testCases, { input: '', output: '', isHidden: false, points: 10 }]
    });
  };

  const handleRemoveTestCase = (index) => {
    if (currentProblem.testCases.length <= 1) {
      toast.error('At least one test case is required');
      return;
    }
    setCurrentProblem({
      ...currentProblem,
      testCases: currentProblem.testCases.filter((_, i) => i !== index)
    });
  };

  const handleAddHint = () => {
    setCurrentProblem({
      ...currentProblem,
      hints: [...currentProblem.hints, '']
    });
  };

  const handleRemoveHint = (index) => {
    setCurrentProblem({
      ...currentProblem,
      hints: currentProblem.hints.filter((_, i) => i !== index)
    });
  };

  const handleSaveProblem = () => {
    // Validation
    if (!currentProblem.title.trim()) {
      toast.error('Problem title is required');
      return;
    }
    if (!currentProblem.description.trim()) {
      toast.error('Problem description is required');
      return;
    }
    if (currentProblem.testCases.length === 0) {
      toast.error('At least one test case is required');
      return;
    }

    const validTestCases = currentProblem.testCases.every(tc => tc.input && tc.output);
    if (!validTestCases) {
      toast.error('All test cases must have input and output');
      return;
    }

    if (editingProblemIndex !== null) {
      const updated = [...problems];
      updated[editingProblemIndex] = currentProblem;
      setProblems(updated);
      toast.success('Problem updated successfully');
    } else {
      setProblems([...problems, currentProblem]);
      toast.success('Problem added successfully');
    }

    setCurrentProblem(getEmptyProblem());
    setShowProblemForm(false);
    setEditingProblemIndex(null);
  };

  const handleEditProblem = (index) => {
    setCurrentProblem(problems[index]);
    setEditingProblemIndex(index);
    setShowProblemForm(true);
  };

  const handleDeleteProblem = (index) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      setProblems(problems.filter((_, i) => i !== index));
      toast.success('Problem deleted');
    }
  };

  const handleMoveProblem = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= problems.length) return;

    const updated = [...problems];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setProblems(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Contest title is required');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Start time and end time are required');
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const regDeadline = formData.registrationDeadline ? new Date(formData.registrationDeadline) : new Date(start.getTime() - 60000);

    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    if (regDeadline >= start) {
      toast.error('Registration deadline must be before start time');
      return;
    }

    if (problems.length === 0) {
      toast.error('At least one problem is required');
      return;
    }

    const contestData = {
      ...formData,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      registrationDeadline: regDeadline.toISOString(),
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      problems: problems,
      createdBy: 'admin' // TODO: Get from auth
    };

    onSave(contestData);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {contest ? 'Edit Contest' : 'Create New Contest'}
              </h2>
              <p className="text-blue-100 mt-1">Configure your coding contest with advanced features</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-gray-50 px-8 border-b border-gray-200">
            <div className="flex space-x-1">
              {['basic', 'problems', 'settings', 'preview'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                  {tab === 'problems' && problems.length > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {problems.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-8">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <BasicInfoTab 
                  formData={formData} 
                  setFormData={setFormData}
                  calculateRegistrationDeadline={calculateRegistrationDeadline}
                />
              )}

              {/* Problems Tab */}
              {activeTab === 'problems' && (
                <ProblemsTab
                  problems={problems}
                  showProblemForm={showProblemForm}
                  setShowProblemForm={setShowProblemForm}
                  currentProblem={currentProblem}
                  setCurrentProblem={setCurrentProblem}
                  handleSaveProblem={handleSaveProblem}
                  handleEditProblem={handleEditProblem}
                  handleDeleteProblem={handleDeleteProblem}
                  handleMoveProblem={handleMoveProblem}
                  handleAddExample={handleAddExample}
                  handleRemoveExample={handleRemoveExample}
                  handleAddTestCase={handleAddTestCase}
                  handleRemoveTestCase={handleRemoveTestCase}
                  handleAddHint={handleAddHint}
                  handleRemoveHint={handleRemoveHint}
                  editingProblemIndex={editingProblemIndex}
                />
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <SettingsTab formData={formData} setFormData={setFormData} />
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <PreviewTab formData={formData} problems={problems} />
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {problems.length} problem{problems.length !== 1 ? 's' : ''} added
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {contest ? 'Update Contest' : 'Create Contest'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Basic Info Tab Component
const BasicInfoTab = ({ formData, setFormData, calculateRegistrationDeadline }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Contest Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
          placeholder="e.g., Weekly Coding Challenge #42"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all resize-none"
          rows={4}
          placeholder="Describe your contest, what participants can expect, and any special rules..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Start Date & Time *
        </label>
        <input
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => {
            setFormData({ 
              ...formData, 
              startTime: e.target.value,
              registrationDeadline: calculateRegistrationDeadline(e.target.value)
            });
          }}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          End Date & Time *
        </label>
        <input
          type="datetime-local"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Registration Deadline *
        </label>
        <input
          type="datetime-local"
          value={formData.registrationDeadline}
          onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Users can register until this time (defaults to 1 min before start)
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Difficulty Level *
        </label>
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
    </div>
  </div>
);

// Problems Tab Component  
const ProblemsTab = ({
  problems, showProblemForm, setShowProblemForm, currentProblem, setCurrentProblem,
  handleSaveProblem, handleEditProblem, handleDeleteProblem, handleMoveProblem,
  handleAddExample, handleRemoveExample, handleAddTestCase, handleRemoveTestCase,
  handleAddHint, handleRemoveHint, editingProblemIndex
}) => (
  <div className="space-y-6">
    {!showProblemForm ? (
      <>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Contest Problems</h3>
          <button
            type="button"
            onClick={() => setShowProblemForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Problem
          </button>
        </div>

        {problems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No problems added yet</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Problem" to create your first problem</p>
          </div>
        ) : (
          <div className="space-y-3">
            {problems.map((problem, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
                      <h4 className="text-lg font-semibold text-gray-900">{problem.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {problem.difficulty}
                      </span>
                      <span className="text-sm text-gray-600">
                        {problem.points} points
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{problem.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{problem.testCases?.length || 0} test cases</span>
                      <span>{problem.examples?.length || 0} examples</span>
                      <span>Time: {problem.timeLimit}s</span>
                      <span>Memory: {problem.memoryLimit}MB</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveProblem(index, 'up')}
                      disabled={index === 0}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveProblem(index, 'down')}
                      disabled={index === problems.length - 1}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditProblem(index)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProblem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    ) : (
      <ProblemForm
        problem={currentProblem}
        setProblem={setCurrentProblem}
        onSave={handleSaveProblem}
        onCancel={() => {
          setShowProblemForm(false);
          setCurrentProblem({}); // Reset
        }}
        handleAddExample={handleAddExample}
        handleRemoveExample={handleRemoveExample}
        handleAddTestCase={handleAddTestCase}
        handleRemoveTestCase={handleRemoveTestCase}
        handleAddHint={handleAddHint}
        handleRemoveHint={handleRemoveHint}
        isEditing={editingProblemIndex !== null}
      />
    )}
  </div>
);

// Problem Form Component
const ProblemForm = ({ 
  problem, setProblem, onSave, onCancel, 
  handleAddExample, handleRemoveExample,
  handleAddTestCase, handleRemoveTestCase,
  handleAddHint, handleRemoveHint,
  isEditing
}) => (
  <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
    <div className="flex justify-between items-center">
      <h4 className="text-xl font-bold text-gray-900">
        {isEditing ? 'Edit Problem' : 'Add New Problem'}
      </h4>
      <button
        type="button"
        onClick={onCancel}
        className="text-gray-600 hover:text-gray-900"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Problem Title *</label>
        <input
          type="text"
          value={problem.title}
          onChange={(e) => setProblem({ ...problem, title: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          placeholder="e.g., Two Sum"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Problem Description *</label>
        <textarea
          value={problem.description}
          onChange={(e) => setProblem({ ...problem, description: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
          rows={6}
          placeholder="Describe the problem in detail..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty *</label>
        <select
          value={problem.difficulty}
          onChange={(e) => setProblem({ ...problem, difficulty: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Points</label>
        <input
          type="number"
          value={problem.points}
          onChange={(e) => setProblem({ ...problem, points: parseInt(e.target.value) || 100 })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          min="1"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Time Limit (seconds)</label>
        <input
          type="number"
          value={problem.timeLimit}
          onChange={(e) => setProblem({ ...problem, timeLimit: parseFloat(e.target.value) || 2 })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          step="0.1"
          min="0.1"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Memory Limit (MB)</label>
        <input
          type="number"
          value={problem.memoryLimit}
          onChange={(e) => setProblem({ ...problem, memoryLimit: parseInt(e.target.value) || 256 })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          min="1"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Input Format</label>
        <textarea
          value={problem.inputFormat}
          onChange={(e) => setProblem({ ...problem, inputFormat: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
          rows={2}
          placeholder="Describe the input format..."
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Output Format</label>
        <textarea
          value={problem.outputFormat}
          onChange={(e) => setProblem({ ...problem, outputFormat: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
          rows={2}
          placeholder="Describe the output format..."
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Constraints</label>
        <textarea
          value={problem.constraints}
          onChange={(e) => setProblem({ ...problem, constraints: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
          rows={2}
          placeholder="e.g., 1 <= n <= 10^5..."
        />
      </div>
    </div>

    {/* Examples */}
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-semibold text-gray-700">Examples</label>
        <button
          type="button"
          onClick={handleAddExample}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Example
        </button>
      </div>
      {problem.examples?.map((example, index) => (
        <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Example {index + 1}</span>
            <button
              type="button"
              onClick={() => handleRemoveExample(index)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={example.input}
              onChange={(e) => {
                const updated = [...problem.examples];
                updated[index].input = e.target.value;
                setProblem({ ...problem, examples: updated });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              placeholder="Input"
            />
            <input
              type="text"
              value={example.output}
              onChange={(e) => {
                const updated = [...problem.examples];
                updated[index].output = e.target.value;
                setProblem({ ...problem, examples: updated });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
              placeholder="Output"
            />
            <textarea
              value={example.explanation}
              onChange={(e) => {
                const updated = [...problem.examples];
                updated[index].explanation = e.target.value;
                setProblem({ ...problem, examples: updated });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm resize-none"
              rows={2}
              placeholder="Explanation (optional)"
            />
          </div>
        </div>
      ))}
    </div>

    {/* Test Cases */}
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-semibold text-gray-700">Test Cases *</label>
        <button
          type="button"
          onClick={handleAddTestCase}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Test Case
        </button>
      </div>
      {problem.testCases?.map((testCase, index) => (
        <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Test Case {index + 1}</span>
            <button
              type="button"
              onClick={() => handleRemoveTestCase(index)}
              className="text-red-600 hover:text-red-700"
              disabled={problem.testCases.length <= 1}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-2">
            <textarea
              value={testCase.input}
              onChange={(e) => {
                const updated = [...problem.testCases];
                updated[index].input = e.target.value;
                setProblem({ ...problem, testCases: updated });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm resize-none"
              rows={2}
              placeholder="Input *"
            />
            <textarea
              value={testCase.output}
              onChange={(e) => {
                const updated = [...problem.testCases];
                updated[index].output = e.target.value;
                setProblem({ ...problem, testCases: updated });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm resize-none"
              rows={2}
              placeholder="Expected Output *"
            />
            <div className="space-y-2">
              <input
                type="number"
                value={testCase.points}
                onChange={(e) => {
                  const updated = [...problem.testCases];
                  updated[index].points = parseInt(e.target.value) || 10;
                  setProblem({ ...problem, testCases: updated });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                placeholder="Points"
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={testCase.isHidden}
                  onChange={(e) => {
                    const updated = [...problem.testCases];
                    updated[index].isHidden = e.target.checked;
                    setProblem({ ...problem, testCases: updated });
                  }}
                  className="rounded"
                />
                Hidden
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Hints */}
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-semibold text-gray-700">Hints (Optional)</label>
        <button
          type="button"
          onClick={handleAddHint}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Hint
        </button>
      </div>
      {problem.hints?.map((hint, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={hint}
            onChange={(e) => {
              const updated = [...problem.hints];
              updated[index] = e.target.value;
              setProblem({ ...problem, hints: updated });
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
            placeholder={`Hint ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => handleRemoveHint(index)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>

    <div className="flex justify-end gap-3 pt-4 border-t">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-all"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {isEditing ? 'Update Problem' : 'Add Problem'}
      </button>
    </div>
  </div>
);

// Settings Tab Component
const SettingsTab = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Max Participants
        </label>
        <input
          type="number"
          value={formData.maxParticipants}
          onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          placeholder="Leave empty for unlimited"
          min="1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Maximum number of participants allowed to register
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Award className="w-4 h-4" />
          Prizes (Optional)
        </label>
        <input
          type="text"
          value={formData.prizes}
          onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          placeholder="e.g., $1000, $500, $250"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Contest Rules
        </label>
        <textarea
          value={formData.rules}
          onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
          rows={6}
          placeholder="Enter contest rules, guidelines, and any special instructions..."
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
          })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
          placeholder="e.g., algorithms, data structures, dynamic programming"
        />
      </div>
    </div>
  </div>
);

// Preview Tab Component
const PreviewTab = ({ formData, problems }) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{formData.title || 'Untitled Contest'}</h3>
      <p className="text-gray-700">{formData.description || 'No description provided'}</p>
      
      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg">
          <div className="text-sm text-gray-600">Difficulty</div>
          <div className="text-lg font-bold text-gray-900 capitalize">{formData.difficulty}</div>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <div className="text-sm text-gray-600">Problems</div>
          <div className="text-lg font-bold text-gray-900">{problems.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <div className="text-sm text-gray-600">Start Time</div>
          <div className="text-lg font-bold text-gray-900">
            {formData.startTime ? new Date(formData.startTime).toLocaleString() : 'Not set'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <div className="text-sm text-gray-600">Duration</div>
          <div className="text-lg font-bold text-gray-900">
            {formData.startTime && formData.endTime ? 
              `${Math.round((new Date(formData.endTime) - new Date(formData.startTime)) / 60000)} min` :
              'N/A'
            }
          </div>
        </div>
      </div>
    </div>

    {problems.length > 0 && (
      <div>
        <h4 className="text-xl font-bold text-gray-900 mb-4">Problems Preview</h4>
        <div className="space-y-3">
          {problems.map((problem, index) => (
            <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
                <h5 className="text-lg font-semibold text-gray-900">{problem.title}</h5>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {problem.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-600">{problem.description}</p>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span>💯 {problem.points} points</span>
                <span>⏱️ {problem.timeLimit}s</span>
                <span>💾 {problem.memoryLimit}MB</span>
                <span>✅ {problem.testCases?.length || 0} tests</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {formData.rules && (
      <div>
        <h4 className="text-xl font-bold text-gray-900 mb-3">Rules</h4>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-gray-700 whitespace-pre-wrap">{formData.rules}</p>
        </div>
      </div>
    )}
  </div>
);

export default CreateContestModal;
