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
import judge0Client from '../services/judge0Client';
import CreateContestModal from '../components/CreateContestModalNew';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contests');
  const [draftProblems, setDraftProblems] = useState([]);
  // const [showCreateModal, setShowCreateModal] = useState(false);
  // const [editingContest, setEditingContest] = useState(null);
  // Add Problem Form Component
  const SharedAddProblemForm = ({ problem, onSave, onCancel }) => {
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

    // Optional reference solution so admins can validate testcases
    const [referenceSolution, setReferenceSolution] = useState({ code: problem?.referenceSolution?.code || '', languageId: problem?.referenceSolution?.languageId || 63 });
    const [testRun, setTestRun] = useState({ running: false, results: null });

    const handleSubmit = async (e) => {
      e.preventDefault();

      // If on final step and a reference solution is provided, run tests first
      if (currentStep === 4 && referenceSolution.code) {
        // If we don't have results yet or the result set doesn't match test cases, run them
        if (!testRun.results || testRun.results.total !== formData.testCases.length) {
          await runTests(formData.testCases);
          // after running, check results
          if (testRun.results && testRun.results.passed !== testRun.results.total) {
            toast.warn('Some test cases failed. Review results before saving the problem.');
            return; // require admin to re-run or fix
          }
        }
      }

      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // attach referenceSolution when saving
        const payload = { ...formData };
        if (referenceSolution.code) payload.referenceSolution = referenceSolution;
        onSave(payload);
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

    // Run tests using judge0Client and the provided reference solution
    const runTests = async (testCases = []) => {
      if (!referenceSolution.code) {
        toast.error('Provide a reference solution to run tests');
        return;
      }

      try {
        setTestRun({ running: true, results: null });
        // Map test cases to the shape judge0Client expects
        const batchInput = testCases.map(tc => ({ input: tc.input ?? '', output: tc.output ?? '' }));
        const res = await judge0Client.runBatch({ code: referenceSolution.code, languageId: referenceSolution.languageId, testCases: batchInput });
        setTestRun({ running: false, results: res });
        return res;
      } catch (err) {
        console.error('runTests error', err);
        setTestRun({ running: false, results: { passed: 0, total: testCases.length, details: [], error: err.message } });
        toast.error('Failed to run tests: ' + (err.message || err));
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addExample}
                      className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
                    >
                      + Add Example
                    </button>
                  </div>
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

                {/* Reference Solution area */}
                <div className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Reference Solution (optional)</h4>
                      <p className="text-xs text-gray-500">Provide a reference implementation to validate sample/hidden test cases.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={referenceSolution.languageId}
                        onChange={(e) => setReferenceSolution({ ...referenceSolution, languageId: Number(e.target.value) })}
                        className="px-2 py-1 text-sm border rounded"
                      >
                        <option value={63}>JavaScript (Node.js)</option>
                        <option value={71}>Python 3</option>
                        <option value={54}>C++ (GCC)</option>
                      </select>
                      <button
                        type="button"
                        onClick={async () => {
                          // run samples
                          const sampleTCs = formData.examples.map(ex => ({ input: ex.input, output: ex.output }));
                          if (!referenceSolution.code) return toast.error('Add reference solution code to test');
                          await runTests(sampleTCs);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Test Samples
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={referenceSolution.code}
                    onChange={(e) => setReferenceSolution({ ...referenceSolution, code: e.target.value })}
                    className="w-full font-mono text-sm h-36 p-3 border rounded focus:outline-none"
                    placeholder="Paste a reference solution here (used for validating test cases)"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Test Cases Configuration */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 mb-4 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">�'�</span>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">Test Cases Configuration</h4>
                      <p className="text-sm text-gray-600">
                        Add test cases and mark them as <span className="font-semibold text-blue-700">Visible</span> (shown to participants) 
                        or <span className="font-semibold text-blue-600">Hidden</span> (used for final evaluation only)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Test Cases *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addTestCase}
                      className="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
                    >
                      + Add Test Case
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!referenceSolution.code) return toast.error('Provide a reference solution to run tests');
                        await runTests(formData.testCases);
                      }}
                      className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      ▶� Run All Test Cases
                    </button>
                  </div>
                </div>
              
                {formData.testCases.map((testCase, index) => (
                  <div 
                    key={index} 
                    className={`rounded-lg p-4 mb-3 border-2 ${
                      testCase.isHidden 
                        ? 'bg-blue-100 border-blue-300' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${
                          testCase.isHidden ? 'text-blue-700' : 'text-blue-600'
                        }`}>
                          Test Case {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleTestCaseVisibility(index)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            testCase.isHidden
                              ? 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
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

                {/* Test results summary (if available) */}
                {testRun.results && (
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold">Test Run Results</div>
                      <div className="text-sm text-gray-600">Passed: {testRun.results.passed} / {testRun.results.total}</div>
                    </div>
                    <div className="space-y-2">
                      {testRun.results.details && testRun.results.details.map((d, i) => (
                        <div key={i} className={`p-2 rounded ${d.passed ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border`}>
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">Test {i + 1}: {d.passed ? 'Passed' : 'Failed'}</div>
                            <div className="text-xs text-gray-600">time: {d.time ?? '-'}s • mem: {d.memory ?? '-'} KB</div>
                          </div>
                          <div className="text-xs text-gray-700 mt-1">Expected: <pre className="whitespace-pre-wrap font-mono text-xs">{String(d.expected)}</pre></div>
                          <div className="text-xs text-gray-700 mt-1">Actual: <pre className="whitespace-pre-wrap font-mono text-xs">{String(d.actual)}</pre></div>
                          {d.compile_output && <div className="text-xs text-orange-700 mt-1">Compile: <pre className="whitespace-pre-wrap font-mono text-xs">{String(d.compile_output)}</pre></div>}
                          {d.stderr && <div className="text-xs text-red-700 mt-1">Stderr: <pre className="whitespace-pre-wrap font-mono text-xs">{String(d.stderr)}</pre></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mt-4">
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
    }
  
    // Main Admin dashboard UI: provide contest list, create/edit, and analytics
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingContest, setEditingContest] = useState(null);
    const [statistics, setStatistics] = useState({ byDifficulty: {}, totalProblems: 0, avgProblemsPerContest: 0 });

    const fetchContests = async () => {
      setLoading(true);
      try {
        const list = await getAllContests();
        // Filter out any demo/sample contests so admin sees only real contests
        const raw = Array.isArray(list) ? list : (list?.contests || []);
        const isDemo = (c) => {
          const id = String(c?.id || c?._id || '').toLowerCase();
          const title = String(c?.title || '').toLowerCase();
          const creator = String(c?.createdBy || c?.creator || '').toLowerCase();
          if (!id && !title) return false;
          if (id.includes('demo') || id.includes('sample') || title.includes('demo') || title.includes('sample')) return true;
          if (creator.includes('demo') || creator.includes('sample')) return true;
          return false;
        };
        setContests(raw.filter(c => !isDemo(c)));
      } catch (err) {
        console.error('fetchContests error', err);
        toast.error('Failed to load contests');
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const s = await getContestStatistics();
        setStatistics(s || statistics);
      } catch (err) {
        console.warn('fetchStats error', err);
      }
    };

    useEffect(() => {
      fetchContests();
      fetchStats();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreate = () => {
      setEditingContest(null);
      setShowCreateModal(true);
    };

    const handleEdit = (contest) => {
      setEditingContest(contest);
      setShowCreateModal(true);
    };

    const handleSaveContest = async (contestData) => {
      try {
        if (editingContest && editingContest.id) {
          await updateContest(editingContest.id, contestData);
          toast.success('Contest updated');
        } else {
          // attach drafted problems when creating a new contest
          if (draftProblems && draftProblems.length > 0) contestData.problems = draftProblems;
          await createContest(contestData);
          toast.success('Contest created');
        }
        setShowCreateModal(false);
        setEditingContest(null);
        fetchContests();
        fetchStats();
      } catch (err) {
        // Provide more actionable error output in the UI when the server returns details
        console.error('save contest error', err);
        // If the api client attached the response body, show that to the admin (helps diagnose 409 duplicate id)
        const bodyText = err && (err.body || err.message || JSON.stringify(err));
        if (err && err.status === 409) {
          console.warn('Conflict when creating contest:', bodyText);
          toast.error(bodyText || 'Conflict: contest could not be created (duplicate id or constraint)');
        } else {
          toast.error(bodyText || 'Failed to save contest');
        }
      }
    };

    const handleDelete = async (contest) => {
      try {
        const ok = window.confirm(`Delete contest "${contest.title}"? This cannot be undone.`);
        if (!ok) return;
        await deleteContest(contest.id || contest._id || contest);
        toast.success('Contest deleted');
        fetchContests();
        fetchStats();
      } catch (err) {
        console.error('delete contest error', err);
        if (err && err.status === 401) {
          toast.error('Unauthorized: please log in as an admin to delete contests');
        } else {
          toast.error('Failed to delete contest');
        }
      }
    };

    const handleManageQuestions = (contest) => {
      // Open the contest in edit mode - the new modal handles all problem management
      handleEdit(contest);
    };

    // Download contest participants with scores and solved questions
    const handleDownloadReport = async (contestId, format = 'csv') => {
      try {
        const contest = contests.find(c => (c.id || c._id) === contestId);
        if (!contest) {
          toast.error('Contest not found');
          return;
        }

        // Fetch contest with full participant data from backend
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE}/api/contests/${contestId}`);
        const data = await response.json();
        
        const participants = data.data?.participants || [];
        const problems = data.data?.problems || contest.problems || [];

        if (format === 'json') {
          const json = JSON.stringify({ contest: data.data, participants }, null, 2);
          const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${(contest.title || 'contest').replace(/[^a-z0-9-_]/gi, '_')}_participants.json`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          toast.success('JSON report downloaded');
          return;
        }

        // Build CSV with participants data
        const header = [
          'Contest Title',
          'User Email',
          'Display Name',
          'Registration Date',
          'Total Score',
          'Problems Solved',
          'Submission Count'
        ];

        const rows = participants.map(p => [
          contest.title || '',
          p.email || '',
          p.displayName || p.email?.split('@')[0] || 'Anonymous',
          p.registeredAt ? new Date(p.registeredAt).toLocaleString() : '',
          p.score || 0,
          (p.submissions || []).filter(s => s.passed).length,
          (p.submissions || []).length
        ]);

        // Add summary row
        const totalParticipants = participants.length;
        const totalSubmissions = participants.reduce((sum, p) => sum + (p.submissions?.length || 0), 0);
        const averageScore = participants.length > 0 
          ? (participants.reduce((sum, p) => sum + (p.score || 0), 0) / participants.length).toFixed(2)
          : 0;

        rows.push(['', '', '', '', '', '', '']);
        rows.push(['SUMMARY', '', '', '', '', '', '']);
        rows.push(['Total Participants', totalParticipants, '', '', '', '', '']);
        rows.push(['Average Score', averageScore, '', '', '', '', '']);
        rows.push(['Total Submissions', totalSubmissions, '', '', '', '', '']);

        const csvLines = [
          header.join(','),
          ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ];
        
        const csv = csvLines.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(contest.title || 'contest').replace(/[^a-z0-9-_]/gi, '_')}_participants.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success('CSV report downloaded');
      } catch (error) {
        console.error('Error downloading report:', error);
        toast.error('Failed to download report');
      }
    };

    // filtering helpers
    const activeList = contests.filter(c => c.status === 'active' || (c.startTime && new Date(c.startTime) <= new Date() && (!c.endTime || new Date(c.endTime) > new Date())));
    const upcomingList = contests.filter(c => c.status === 'upcoming' || (c.startTime && new Date(c.startTime) > new Date()));
    const pastList = contests.filter(c => c.status === 'ended' || (c.endTime && new Date(c.endTime) <= new Date()));

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-blue-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage contests, problems and reports</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={openCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-all hover:shadow-md">+ Create Contest</button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <button className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'contests' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`} onClick={() => setActiveTab('contests')}>Contests</button>
              <button className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
            </div>
          </div>

        {activeTab === 'analytics' ? (
          <AnalyticsTab contests={contests} statistics={statistics} />
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Ongoing / Active</h2>
              {loading ? <div className="text-blue-600">Loading...</div> : (
                activeList.length === 0 ? <div className="bg-white rounded-lg p-6 text-center border-2 border-blue-100"><p className="text-gray-500">No active contests</p></div> : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {activeList.map(c => (
                      <ContestCard key={c.id || c._id || c.title} contest={c} onEdit={() => handleEdit(c)} onDelete={() => handleDelete(c)} onManageQuestions={() => handleManageQuestions(c)} />
                    ))}
                  </div>
                )
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Upcoming</h2>
              {upcomingList.length === 0 ? <div className="bg-white rounded-lg p-6 text-center border-2 border-blue-100"><p className="text-gray-500">No upcoming contests</p></div> : (
                <div className="grid md:grid-cols-2 gap-4">
                  {upcomingList.map(c => (
                    <ContestCard key={c.id || c._id || c.title} contest={c} onEdit={() => handleEdit(c)} onDelete={() => handleDelete(c)} onManageQuestions={() => handleManageQuestions(c)} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Past Contests</h2>
              {pastList.length === 0 ? <div className="bg-white rounded-lg p-6 text-center border-2 border-blue-100"><p className="text-gray-500">No past contests</p></div> : (
                <div className="grid md:grid-cols-2 gap-4">
                  {pastList.map(c => (
                    <ContestCard key={c.id || c._id || c.title} contest={c} onEdit={() => handleEdit(c)} onDelete={() => handleDelete(c)} onManageQuestions={() => handleManageQuestions(c)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <CreateContestModal
          show={showCreateModal}
          contest={editingContest}
          onClose={() => { setShowCreateModal(false); setEditingContest(null); }}
          onSave={handleSaveContest}
          problems={draftProblems}
        />
        </div>
      </div>
    );
  };
  
  const ContestCard = ({ contest, onEdit, onDelete, onManageQuestions }) => {
  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: 'bg-blue-50 text-blue-700 border-blue-200',
      Medium: 'bg-blue-100 text-blue-800 border-blue-300',
      Hard: 'bg-blue-200 text-blue-900 border-blue-400',
      Expert: 'bg-blue-300 text-blue-900 border-blue-500'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-300',
      active: 'bg-blue-50 text-blue-700 border-blue-200',
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
            <span className="text-xs px-2 py-1 rounded-lg font-semibold bg-blue-100 text-blue-800 border border-blue-300">
              {contest.problems?.length || 0} Problems
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <span>??</span>
          <span>Start: {new Date(contest.startTime).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>??</span>
          <span>Duration: {contest.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>??</span>
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
          onClick={() => handleDownloadReport(contest.id, 'csv')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold text-sm"
        >
          📥 CSV
        </motion.button>
        <motion.button
          onClick={() => handleDownloadReport(contest.id, 'json')}
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
          className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm"
        >
          ✏️ Edit
        </motion.button>
        <motion.button
          onClick={onDelete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm"
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

        <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Problem Statistics</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Problems</div>
              <div className="text-3xl font-bold text-blue-700">{statistics.totalProblems}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Avg Problems/Contest</div>
              <div className="text-3xl font-bold text-blue-700">{statistics.avgProblemsPerContest}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

