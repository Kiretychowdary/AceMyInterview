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
        { input: '', output: '', explanation: '', isHidden: false },
        { input: '', output: '', explanation: '', isHidden: false }
      ],
      difficulty: 'medium',
      points: 100,
      testCases: [] // Will be converted from sampleTests
    };
  }

  useEffect(() => {
    if (contest) {
      setFormData({
        title: contest.title || '',
        startTime: toInputDateTime(contest.startTime),
        endTime: toInputDateTime(contest.endTime),
        duration: contest.duration || '',
        description: contest.description || ''
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
      startTime: '',
      endTime: '',
      duration: '',
      description: ''
    });
    setProblems([]);
    setCurrentStep(1);
    setCurrentProblem(getEmptyProblem());
  };

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const diffMinutes = Math.round((end - start) / 60000);
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
    return '';
  };

  const handleAddSampleTest = () => {
    setCurrentProblem({
      ...currentProblem,
      sampleTests: [...currentProblem.sampleTests, { input: '', output: '', explanation: '', isHidden: false }]
    });
  };

  const handleRemoveSampleTest = (index) => {
    if (currentProblem.sampleTests.length <= 1) {
      toast.error('At least one sample test is required');
      return;
    }
    setCurrentProblem({
      ...currentProblem,
      sampleTests: currentProblem.sampleTests.filter((_, i) => i !== index)
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

    const validTests = currentProblem.sampleTests.every(t => t.input && t.output);
    if (!validTests) {
      toast.error('All sample tests must have input and output');
      return;
    }

    // Convert sampleTests to testCases for backend
    const problemToSave = {
      ...currentProblem,
      testCases: currentProblem.sampleTests.map(test => ({
        input: test.input,
        output: test.output,
        isHidden: test.isHidden || false,
        points: 10
      })),
      examples: currentProblem.sampleTests.filter(test => !test.isHidden).map(test => ({
        input: test.input,
        output: test.output,
        explanation: test.explanation
      }))
    };

    if (editingProblemIndex !== null) {
      const updated = [...problems];
      updated[editingProblemIndex] = problemToSave;
      setProblems(updated);
      toast.success('Problem updated successfully');
    } else {
      setProblems([...problems, problemToSave]);
      toast.success('Problem added successfully');
    }

    setCurrentProblem(getEmptyProblem());
    setEditingProblemIndex(null);
    setCurrentStep(2); // Go back to problem list
  };

  const handleEditProblem = (index) => {
    const problem = problems[index];
    // Reconstruct sampleTests from testCases or examples
    const sampleTests = problem.testCases?.map(tc => ({
      input: tc.input,
      output: tc.output,
      explanation: problem.examples?.find(ex => ex.input === tc.input)?.explanation || '',
      isHidden: tc.isHidden || false
    })) || problem.sampleTests || [
      { input: '', output: '', explanation: '', isHidden: false }
    ];
    
    setCurrentProblem({
      ...problem,
      sampleTests
    });
    setEditingProblemIndex(index);
    setCurrentStep(3);
  };

  const handleDeleteProblem = (index) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      setProblems(problems.filter((_, i) => i !== index));
      toast.success('Problem deleted');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Contest name is required');
      setCurrentStep(1);
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Start time and end time are required');
      setCurrentStep(1);
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (end <= start) {
      toast.error('End time must be after start time');
      setCurrentStep(1);
      return;
    }

    if (problems.length === 0) {
      toast.error('At least one problem is required');
      setCurrentStep(2);
      return;
    }

    const contestData = {
      title: formData.title,
      description: formData.description,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration: Math.floor((end - start) / 60000), // duration in minutes
      registrationDeadline: new Date(start.getTime() - 5 * 60000).toISOString(), // 5 minutes before
      problems: problems,
      difficulty: 'mixed',
      createdBy: 'admin',
      isPublished: false,
      status: 'draft'
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
          className="bg-white rounded-xl shadow-lg max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col my-8"
        >
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {contest ? 'Edit Contest' : 'Create New Contest'}
              </h2>
              <p className="text-blue-100 mt-0.5 text-sm">
                {currentStep === 1 && 'Section 1: Contest Details'}
                {currentStep === 2 && 'Section 2: Add Problems'}
                {currentStep === 3 && `${editingProblemIndex !== null ? 'Edit' : 'Add'} Problem`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-lg w-8 h-8 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
            <div className="flex items-center justify-center gap-3">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Contest Details</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Add Problems</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* SECTION 1: Contest Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Contest Name *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      placeholder="e.g., Weekly Coding Challenge #1"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Start Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        End Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Duration (Auto-calculated)
                    </label>
                    <input
                      type="text"
                      value={calculateDuration()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                      readOnly
                      placeholder="Select start and end time to calculate"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
                      rows={4}
                      placeholder="Describe the contest..."
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: Problems List */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Contest Problems</h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {problems.length} problem{problems.length !== 1 ? 's' : ''} added
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentProblem(getEmptyProblem());
                        setEditingProblemIndex(null);
                        setCurrentStep(3);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Problem
                    </button>
                  </div>

                  {problems.length === 0 ? (
                    <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-4xl mb-3">📝</div>
                      <p className="text-sm text-gray-600 font-medium">No problems added yet</p>
                      <p className="text-xs text-gray-500 mt-1">Click "Add Problem" to create your first problem</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {problems.map((problem, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-base font-semibold text-blue-600">#{index + 1}</span>
                                <h4 className="text-base font-semibold text-gray-900">{problem.title}</h4>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {problem.difficulty}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-2 line-clamp-2 text-xs">{problem.description}</p>
                              <div className="flex gap-3 text-xs text-gray-500">
                                <span>📊 {problem.points} points</span>
                                <span className="text-green-600">
                                  👁️ {problem.testCases?.filter(t => !t.isHidden).length || problem.examples?.length || 0} visible
                                </span>
                                <span className="text-purple-600">
                                  🔒 {problem.testCases?.filter(t => t.isHidden).length || 0} hidden
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditProblem(index)}
                                className="px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-xs transition-all"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProblem(index)}
                                className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: Add/Edit Problem */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-blue-900">
                      {editingProblemIndex !== null ? `Editing Problem #${editingProblemIndex + 1}` : 'Adding New Problem'}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Problem Title *
                    </label>
                    <input
                      type="text"
                      value={currentProblem.title}
                      onChange={(e) => setCurrentProblem({ ...currentProblem, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      placeholder="e.g., Two Sum"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Problem Description *
                    </label>
                    <textarea
                      value={currentProblem.description}
                      onChange={(e) => setCurrentProblem({ ...currentProblem, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                      rows={6}
                      placeholder="Describe the problem in detail..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Constraints *
                    </label>
                    <textarea
                      value={currentProblem.constraints}
                      onChange={(e) => setCurrentProblem({ ...currentProblem, constraints: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                      rows={3}
                      placeholder="e.g., 1 <= n <= 10^5&#10;-10^9 <= arr[i] <= 10^9"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Input Format *
                      </label>
                      <textarea
                        value={currentProblem.inputFormat}
                        onChange={(e) => setCurrentProblem({ ...currentProblem, inputFormat: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                        rows={3}
                        placeholder="Describe the input format..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Output Format *
                      </label>
                      <textarea
                        value={currentProblem.outputFormat}
                        onChange={(e) => setCurrentProblem({ ...currentProblem, outputFormat: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                        rows={3}
                        placeholder="Describe the output format..."
                      />
                    </div>
                  </div>

                  {/* Sample Tests */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Sample Tests *
                      </label>
                      <button
                        type="button"
                        onClick={handleAddSampleTest}
                        className="text-blue-600 hover:text-blue-700 font-medium text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Sample Test
                      </button>
                    </div>

                    {currentProblem.sampleTests?.map((test, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-semibold text-gray-900">Sample Test {index + 1}</h4>
                          {currentProblem.sampleTests.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSampleTest(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Input {index + 1} *
                            </label>
                            <textarea
                              value={test.input}
                              onChange={(e) => {
                                const updated = [...currentProblem.sampleTests];
                                updated[index].input = e.target.value;
                                setCurrentProblem({ ...currentProblem, sampleTests: updated });
                              }}
                              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-xs resize-none"
                              rows={2}
                              placeholder="Enter the input..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Output {index + 1} *
                            </label>
                            <textarea
                              value={test.output}
                              onChange={(e) => {
                                const updated = [...currentProblem.sampleTests];
                                updated[index].output = e.target.value;
                                setCurrentProblem({ ...currentProblem, sampleTests: updated });
                              }}
                              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-xs resize-none"
                              rows={2}
                              placeholder="Enter the expected output..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Explanation (Optional)
                            </label>
                            <textarea
                              value={test.explanation}
                              onChange={(e) => {
                                const updated = [...currentProblem.sampleTests];
                                updated[index].explanation = e.target.value;
                                setCurrentProblem({ ...currentProblem, sampleTests: updated });
                              }}
                              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-xs resize-none"
                              rows={2}
                              placeholder="Explain the sample test..."
                            />
                          </div>

                          {/* Hidden Test Case Toggle */}
                          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <input
                              type="checkbox"
                              id={`hidden-${index}`}
                              checked={test.isHidden || false}
                              onChange={(e) => {
                                const updated = [...currentProblem.sampleTests];
                                updated[index].isHidden = e.target.checked;
                                setCurrentProblem({ ...currentProblem, sampleTests: updated });
                              }}
                              className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor={`hidden-${index}`} className="flex-1 cursor-pointer">
                              <div className="font-medium text-gray-900 text-xs">
                                {test.isHidden ? '🔒 Hidden Test Case' : '👁️ Visible Test Case'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {test.isHidden 
                                  ? 'Hidden from users, used for evaluation' 
                                  : 'Shown to users as sample test'}
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Difficulty
                      </label>
                      <select
                        value={currentProblem.difficulty}
                        onChange={(e) => setCurrentProblem({ ...currentProblem, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Points
                      </label>
                      <input
                        type="number"
                        value={currentProblem.points}
                        onChange={(e) => setCurrentProblem({ ...currentProblem, points: parseInt(e.target.value) || 100 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentProblem(getEmptyProblem());
                        setEditingProblemIndex(null);
                        setCurrentStep(2);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 text-sm hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProblem}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingProblemIndex !== null ? 'Update Problem' : 'Add Problem'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Preview */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Contest Preview</h3>
                    <p className="text-gray-600 text-xs">Review your contest before creating</p>
                  </div>

                  {/* Contest Details Preview */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-base font-semibold text-blue-900 mb-2">{formData.title}</h4>
                    <p className="text-gray-700 mb-3 text-sm">{formData.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white rounded-lg p-2 border border-blue-100">
                        <span className="text-gray-600 font-medium text-xs">Start Time:</span>
                        <div className="text-gray-800 font-medium text-xs mt-0.5">
                          {formData.startTime ? new Date(formData.startTime).toLocaleString() : 'Not set'}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-blue-100">
                        <span className="text-gray-600 font-medium text-xs">End Time:</span>
                        <div className="text-gray-800 font-medium text-xs mt-0.5">
                          {formData.endTime ? new Date(formData.endTime).toLocaleString() : 'Not set'}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-blue-100">
                        <span className="text-gray-600 font-medium text-xs">Duration:</span>
                        <div className="text-gray-800 font-medium text-xs mt-0.5">{calculateDuration() || 'N/A'}</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-blue-100">
                        <span className="text-gray-600 font-medium text-xs">Total Problems:</span>
                        <div className="text-blue-600 font-semibold text-sm mt-0.5">{problems.length}</div>
                      </div>
                    </div>
                  </div>

                  {/* Problems Preview */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Problems ({problems.length})</h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {problems.map((problem, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-800">{index + 1}.</span>
                                <h5 className="text-sm font-semibold text-gray-900">{problem.title}</h5>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {problem.difficulty?.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-gray-600 text-xs line-clamp-2 mb-1">{problem.description}</p>
                              <div className="flex gap-3 text-xs text-gray-500">
                                <span>📝 {problem.testCases?.length || 0} test cases</span>
                                <span>⭐ {problem.points} points</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="bg-blue-50 px-6 py-3 border-t border-blue-100 flex justify-between items-center">
              <div>
                {currentStep > 1 && currentStep < 4 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 text-sm hover:bg-gray-100 transition-all"
                  >
                    ← Previous
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all"
                  >
                    Next: Add Problems →
                  </button>
                )}
                {currentStep === 2 && (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 text-sm hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={problems.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Preview Contest →
                    </button>
                    <button
                      type="submit"
                      disabled={problems.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      Create Contest
                    </button>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 text-sm hover:bg-gray-100 transition-all"
                    >
                      ← Back to Edit
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Create Contest
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateContestModal;
