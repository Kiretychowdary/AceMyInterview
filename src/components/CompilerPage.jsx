// PROFESSIONAL CODING COMPILER - ENTERPRISE-GRADE DEVELOPMENT ENVIRONMENT
import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import JUDGE0_BASE_URL from '../config/judge0Config';
import judge0Client from '../services/judge0Client';

// Persist submissions by POSTing to our backend API which enforces Supabase auth
// server-side and writes canonical records into MongoDB. Frontend should not
// write to Supabase directly — Supabase is used only for authentication.
const createSubmission = async (payload = {}) => {
  try {
    // POST to backend route: backend/routing uses requireSupabaseAuth middleware
    // so the frontend should include the Supabase session (via browser cookies
    // or authorization header managed by the Supabase client) when present.
    const res = await axios.post('/api/submissions', payload);
    return res.data;
  } catch (err) {
    // rethrow or return a minimal error shape; callers treat failure as non-fatal
    throw err;
  }
};
import { markRoundComplete } from '../config/roundsConfig';
import RoundBreakScreen from './RoundBreakScreen';

function CompilerPage(props) {
  const {
    user,
    trackKey,
    isFullInterview,
    currentRoundIndex,
    allRounds,
    totalRounds,
    selectedTopic,
    timer,
    problemData // New prop for reusable problem data
  } = props;

  const location = useLocation();
  const navigate = useNavigate();
  
  // Ensure all props and state are safely initialized
  // Provide a sensible default language list if host doesn't pass one in props
  const defaultLanguages = [
    { id: 71, name: 'python', label: 'Python 3', template: `# Python 3 starter\nif __name__ == '__main__':\n    pass\n` },
    { id: 63, name: 'javascript', label: 'JavaScript (Node)', template: `// JavaScript (Node) starter\nconsole.log('Hello World');\n` },
    { id: 62, name: 'java', label: 'Java', template: `// Java starter\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello World\");\n  }\n}\n` },
    { id: 54, name: 'cpp', label: 'C++ (GCC)', template: `// C++ starter\n#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  ios::sync_with_stdio(false); cin.tie(nullptr);\n  return 0;\n}\n` },
    { id: 50, name: 'c', label: 'C (GCC)', template: `/* C starter */\n#include <stdio.h>\nint main(){\n  return 0;\n}\n` }
  ];

  const languages = Array.isArray(props.languages) && props.languages.length ? props.languages : defaultLanguages;
  const defaultLanguage = languages.find(l => l.name === 'python') || languages[0] || null;
  const [language, setLanguage] = useState(defaultLanguage);
  const [fontSize, setFontSize] = useState(16);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [output, setOutput] = useState('');
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [problemConfig, setProblemConfig] = useState({
    topic: 'algorithms',
    difficulty: 'easy',
    language: defaultLanguage ? defaultLanguage.name : ''
  });
  const [problemDetails, setProblemDetails] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProblemPanel, setShowProblemPanel] = useState(true);
  const [showSubTopics, setShowSubTopics] = useState(false);
  const [leftWidth, setLeftWidth] = useState(40);
  const [editorHeight, setEditorHeight] = useState(60);
  const [dragging, setDragging] = useState(false);
  const [vDragging, setVDragging] = useState(false);
  const [judge0Status, setJudge0Status] = useState({ connected: null, testing: false });
  const [messageIndex, setMessageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showBreakScreen, setShowBreakScreen] = useState(false);
  const [activeTab, setActiveTab] = useState('Description');
  const [activeOutputTab, setActiveOutputTab] = useState('custom'); // Output tab: 'custom' or 'tests'
  const [selectedMainTopic, setSelectedMainTopic] = useState('algorithms');
  const [configuredTopic, setConfiguredTopic] = useState(problemConfig.topic);
  const [customInput, setCustomInput] = useState(''); // Custom input for Execute Code
  const loadingMessages = [
    'Initializing UI...',
    'Preparing test harness...',
    'Wiring runner...',
    'Finalizing challenge...'
  ];
  const PREF_KEY = 'acemi_prefs_v1';
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [darkMode, setDarkMode] = useState(editorTheme === 'vs-dark' || prefersDark);

  // RAF ref used to throttle drag updates and avoid jank
  const rafRef = useRef(null);

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const editorRef = useRef(null);
  const splitRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const verticalSplitRef = useRef(null);

  useEffect(() => { setDarkMode(editorTheme === 'vs-dark'); }, [editorTheme]);

  useEffect(() => {
    if (judge0Status.connected === true) toast.success('✅ Judge0 is connected!', { autoClose: 3000 });
    else if (judge0Status.connected === false) toast.error('❌ Judge0 connection failed.', { autoClose: 5000 });
  }, [judge0Status.connected]);

  useEffect(() => { setProblemConfig((prev) => ({ ...prev, topic: selectedTopic })); }, [selectedTopic]);

  useEffect(() => {
    if (selectedTopic && selectedTopic !== 'algorithms') {
      const topicToMainCategoryMap = {
        'Software Developer': 'algorithms',
        'DSA': 'data-structures',
        'OOPS': 'algorithms',
        'System Design': 'system-design',
        'Cybersecurity': 'algorithms',
        'Network Security': 'algorithms',
        'Ethical Hacking': 'algorithms',
        'Cryptography': 'algorithms',
        'Data Analyst': 'mathematics',
        'Product Manager': 'system-design',
        'HR Interview': 'algorithms',
        'Project Coordinator': 'system-design',
        'System Admin': 'algorithms'
      };
      const mainCategory = topicToMainCategoryMap[selectedTopic];
      if (mainCategory) {
        setSelectedMainTopic(mainCategory);
        setShowSubTopics(true);
        const defaultSubtopic = getCodingDefaultSubtopic(selectedTopic);
        if (defaultSubtopic) { setProblemConfig({ ...problemConfig, topic: defaultSubtopic }); setConfiguredTopic(defaultSubtopic); }
      }
    }
  }, [selectedTopic]);

  const getCodingDefaultSubtopic = (topic) => {
    const defaultMap = {
      'Software Developer': 'sorting',
      'Network Security': 'searching',
      'Ethical Hacking': 'backtracking',
      'Cryptography': 'bit-manipulation',
      'Data Analyst': 'number-theory',
      'Product Manager': 'api-design',
      'HR Interview': 'sorting',
      'Project Coordinator': 'microservices',
      'System Admin': 'greedy'
    };
    return defaultMap[topic] || null;
  };

  useEffect(() => { if (problemDetails && !loadingProblem) toast.dismiss(); }, [problemDetails, loadingProblem]);

  useEffect(() => { if (problemData) { setProblemDetails(problemData); setLoadingProblem(false); } }, [problemData]);

  const normalizeTestCases = (raw) => { if (!Array.isArray(raw)) return []; return raw.map(tc => ({ input: tc.input ?? tc.stdin ?? tc.in ?? '', output: tc.output ?? tc.expected ?? tc.out ?? '', explanation: tc.explanation ?? tc.hint ?? null, hidden: !!tc.hidden })); };

  const currentTestCasesNormalized = normalizeTestCases(problemData?.testCases || problemDetails?.testCases);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (e.shiftKey) { e.preventDefault(); handleCodeSubmit(); }
        else { e.preventDefault(); runCode(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [code, language, problemDetails, problemData]);

  useEffect(() => { setCode(language && language.template ? language.template : ''); setProblemConfig((prev) => ({ ...prev, language: language ? language.name : '' })); }, [language]);

  // Handler for language select change
  const handleLanguageChange = (lang) => {
    if (!lang) return;
    setLanguage(lang);
  };

  const validateJudge0Setup = () => { if (!JUDGE0_BASE_URL) return { valid: false, message: 'Judge0 base URL is not configured.' }; return { valid: true }; };

  const runCode = async () => {
    if (!code.trim()) { toast.error('Please write some code first!'); return; }
    if (!JUDGE0_BASE_URL) { toast.error('Judge0 not configured'); setOutput('Judge0 base URL is missing.'); return; }
    setIsRunning(true); setOutput('Running code...');
    try {
      const res = await judge0Client.runOnce({ code, languageId: language.id, stdin: customInput });
      if (res.compile_output) setOutput(res.compile_output);
      else if (res.stderr) setOutput(res.stderr);
      else setOutput(res.stdout || 'No output');
      // Persist single-run submission (best-effort, non-blocking)
      (async () => {
        try {
          const contestId = location.state?.contestId || props.contestId || null;
          await createSubmission({
            contestId,
            problemIndex: props.problemIndex ?? 0,
            userId: user?.uid || user?.id || null,
            username: user?.displayName || user?.name || user?.email || 'anonymous',
            languageId: language?.id || null,
            code: code || '',
            verdict: res.status?.description || (res.stdout ? 'Executed' : 'Unknown'),
            status: res.status?.description || 'finished',
            time: res.time ?? res.time_used ?? null,
            memory: res.memory ?? res.memory_used ?? null,
            code_length: code ? code.length : 0,
            result: res
          });
        } catch (err) {
          // non-fatal
          console.debug('createSubmission failed (runCode):', err?.message || err);
        }
      })();
    } catch (e) { setOutput('Error: ' + e.message); toast.error('Failed to execute code'); }
    finally { setIsRunning(false); }
  };

  const resetCode = () => { setCode(language?.template || ''); setOutput(''); setTestResults(null); };

  // Run only sample (visible) test cases
  const runSampleTests = async () => {
    if (!code.trim()) { toast.error('Please write some code first!'); return; }
    const rawTestCases = problemData?.testCases || problemDetails?.testCases;
    if (!rawTestCases) { toast.error('No test cases available for this problem!'); return; }
    
    const allTestCases = normalizeTestCases(rawTestCases);
    // Filter only visible (non-hidden) test cases
    const sampleTestCases = allTestCases.filter(tc => !tc.hidden);
    
    if (sampleTestCases.length === 0) {
      toast.error('No sample test cases available!');
      return;
    }
    
    const judge0Status = validateJudge0Setup();
    if (!judge0Status.valid) { 
      toast.error('Judge0 not configured'); 
      setTestResults({ passed:0,total:0,details:[{input:'',expected:'',actual:judge0Status.message,passed:false,error:'Configuration'}]}); 
      return; 
    }
    
    setIsSubmitting(true); 
    setTestResults({ passed:0,total:0,details:[] });
    
    try {
      toast.info('🧪 Running sample test cases...', { autoClose:1500 });
      const batch = await judge0Client.runBatch({ code, languageId: language.id, testCases: sampleTestCases });
      setTestResults(batch);
      setActiveOutputTab('tests'); // Auto-switch to Test Results tab
      
      if (batch.passed === batch.total) {
        toast.success(`🎉 All ${batch.passed}/${batch.total} sample test cases passed!`);
      } else { 
        toast.error(`❌ ${batch.passed}/${batch.total} sample test cases passed. Keep trying!`); 
      }
    } catch (e) { 
      toast.error('Failed to run sample tests: ' + e.message); 
      setTestResults({ passed:0,total:0,details:[],error:e.message }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleCodeSubmit = async () => {
    if (!code.trim()) { toast.error('Please write some code first!'); return; }
    const rawTestCases = problemData?.testCases || problemDetails?.testCases;
    if (!rawTestCases) { toast.error('No test cases available for this problem!'); return; }
    const testCases = normalizeTestCases(rawTestCases);
    const judge0Status = validateJudge0Setup();
    if (!judge0Status.valid) { toast.error('Judge0 not configured'); setTestResults({ passed:0,total:0,details:[{input:'',expected:'',actual:judge0Status.message,passed:false,error:'Configuration'}]}); return; }
    setIsSubmitting(true); setTestResults({ passed:0,total:0,details:[] });
    try {
      toast.info('🧪 Running test cases...', { autoClose:1500 });
      const batch = await judge0Client.runBatch({ code, languageId: language.id, testCases });
      setTestResults(batch);
      setActiveOutputTab('tests'); // Auto-switch to Test Results tab
      if (batch.passed === batch.total) {
        toast.success(`🎉 All ${batch.passed}/${batch.total} test cases passed! Great job!`);
        const roundId = location.state?.roundId; if (roundId) try { markRoundComplete(user?.uid || 'anonymous', roundId); } catch {}
        if (isFullInterview && currentRoundIndex < allRounds.length - 1) setTimeout(() => setShowBreakScreen(true), 3000);
      } else { toast.error(`❌ ${batch.passed}/${batch.total} test cases passed. Keep trying!`); }
      // Persist aggregated submission result (best-effort, non-blocking)
      (async () => {
        try {
          const contestId = location.state?.contestId || props.contestId || null;
          const problemId = problemData?._id || problemData?.id || problemDetails?._id || problemDetails?.id || null;
          const verdict = batch.passed === batch.total ? 'Accepted' : (batch.passed > 0 ? 'Partial' : 'Failed');
          await createSubmission({
            contestId,
            problemId,
            userId: user?.uid || user?.id || null,
            username: user?.displayName || user?.name || user?.email || 'anonymous',
            languageId: language?.id || null,
            language: language?.name || 'python',
            code: code || '',
            verdict,
            status: 'finished',
            time: batch.metrics?.avgTime ?? null,
            memory: batch.metrics?.maxMemory ?? null,
            code_length: code ? code.length : 0,
            testResults: batch.details || [],
            result: batch
          });
        } catch (err) {
          console.debug('createSubmission failed (handleCodeSubmit):', err?.message || err);
        }
      })();
    } catch (e) { toast.error('Failed to run tests: ' + e.message); setTestResults({ passed:0,total:0,details:[],error:e.message }); }
    finally { setIsSubmitting(false); }
  };

  const startDrag = (e) => { e.preventDefault(); setDragging(true); };
  const startVerticalDrag = (e) => { e.preventDefault(); setVDragging(true); };

  useEffect(() => {
    const handleMove = (e) => {
      if (!dragging || !splitRef.current) return; if (isMobile) return;
      const rect = splitRef.current.getBoundingClientRect(); const x = e.clientX || (e.touches && e.touches[0].clientX); if (!x) return;
      const compute = () => { let pct = ((x - rect.left) / rect.width) * 100; pct = Math.max(25, Math.min(85, pct)); setLeftWidth(pct); rafRef.current = null; };
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(compute);
    };
    const stop = () => { setDragging(false); if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
    window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', stop); window.addEventListener('touchmove', handleMove); window.addEventListener('touchend', stop);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', stop); window.removeEventListener('touchmove', handleMove); window.removeEventListener('touchend', stop); if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [dragging, isMobile]);

  useEffect(() => {
    const handleVMove = (e) => {
      if (!vDragging || !verticalSplitRef.current) return; if (isMobile) return;
      const container = verticalSplitRef.current.getBoundingClientRect(); const y = e.clientY || (e.touches && e.touches[0].clientY); if (!y) return;
      const compute = () => { const top = container.top; const height = container.height; let pct = ((y - top) / height) * 100; pct = Math.max(45, Math.min(85, pct)); setEditorHeight(pct); rafRef.current = null; };
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(compute);
    };
    const stop = () => { setVDragging(false); if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
    window.addEventListener('mousemove', handleVMove); window.addEventListener('mouseup', stop); window.addEventListener('touchmove', handleVMove); window.addEventListener('touchend', stop);
    return () => { window.removeEventListener('mousemove', handleVMove); window.removeEventListener('mouseup', stop); window.removeEventListener('touchmove', handleVMove); window.removeEventListener('touchend', stop); if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [vDragging, isMobile]);

  const ProblemPanel = (
    <div className={`${!isMobile ? 'h-full overflow-hidden flex flex-col border-r border-blue-200 bg-white' : 'w-full bg-white border-b border-blue-200 flex flex-col'} ${!showProblemPanel && isMobile ? 'hidden' : ''}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 p-1 rounded-md">◀</button>
          <div className="text-sm font-semibold text-gray-800">Daily Question</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-600">{selectedTopic || problemConfig.topic}</div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <ul className="flex items-center gap-4">
          <li><button onClick={() => setActiveTab('Description')} className={`text-sm font-medium pb-1 ${activeTab === 'Description' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600'}`}>Description</button></li>
          {/* Editorial and Solutions tabs hidden as requested */}
          {/* <li><button onClick={() => setActiveTab('Editorial')} className={`text-sm pb-1 ${activeTab === 'Editorial' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600'}`}>Editorial</button></li> */}
          {/* <li><button onClick={() => setActiveTab('Solutions')} className={`text-sm pb-1 ${activeTab === 'Solutions' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600'}`}>Solutions</button></li> */}
          <li><button onClick={() => setActiveTab('Submissions')} className={`text-sm pb-1 ${activeTab === 'Submissions' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600'}`}>Submissions</button></li>
        </ul>
        <div className="flex items-center gap-2">
          <button onClick={() => setLeftWidth(leftWidth < 40 ? 55 : 35)} className="hidden md:inline-block text-[11px] px-2 py-1 rounded bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition">{leftWidth < 40 ? 'Widen' : 'Narrow'}</button>
          {isMobile && (
            <button onClick={() => setShowProblemPanel(p => !p)} className="md:hidden text-[11px] px-2 py-1 rounded bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition">
              {showProblemPanel ? 'Hide' : 'Show'}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm leading-relaxed custom-scroll">
        {(problemDetails || problemData) && activeTab === 'Description' ? (() => {
          const currentProblem = problemData || problemDetails;
          return (
            <div>
              {currentProblem.__meta?.error && (
                <div className="mb-3 p-3 rounded border border-amber-200 bg-amber-50 text-amber-800">
                  <div className="text-sm">
                    <strong>Problem metadata:</strong> {currentProblem.__meta.error}
                    <div className="text-xs text-amber-700 mt-1">This problem contains metadata.</div>
                  </div>
                </div>
              )}
              <h3 className="text-base font-bold text-gray-800 mb-2">{currentProblem.title}</h3>
              <div className="text-gray-600 whitespace-pre-wrap mb-4">{currentProblem.description}</div>
              {currentProblem.constraints && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">Constraints</h4>
                  <div className="text-xs font-mono whitespace-pre-wrap bg-blue-50/60 rounded p-3 text-gray-700">{currentProblem.constraints}</div>
                </div>
              )}
              {currentProblem.explanation && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">Explanation</h4>
                  <pre className="text-xs font-mono whitespace-pre-wrap bg-blue-50/60 rounded p-3 text-gray-700">{currentProblem.explanation}</pre>
                </div>
              )}

              {currentProblem.testCases && currentProblem.testCases.filter(tc => !tc.hidden).length > 0 && (
                <div className="mb-2">
                  <h4 className={`text-xs font-semibold mb-1 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Sample Test Cases</h4>
                  {currentProblem.testCases.filter(tc => !tc.hidden).slice(0, 3).map((tc, i) => (
                    <div key={i} className="p-3 rounded border bg-gray-50 border-gray-200 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-800">Sample Test Case {i + 1}</div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="bg-white p-2 rounded border">
                          <div className="font-medium text-blue-700 mb-1">Input:</div>
                          <div className="font-mono text-gray-800 whitespace-pre-wrap">{tc.input !== undefined ? (typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input)) : '—'}</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="font-medium text-green-700 mb-1">Output:</div>
                          <div className="font-mono text-gray-800 whitespace-pre-wrap">{tc.output !== undefined ? (typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output)) : '—'}</div>
                        </div>
                        {tc.explanation && (
                          <div className="bg-blue-50 p-2 rounded border border-blue-200">
                            <div className="font-medium text-blue-800 mb-1">Explanation:</div>
                            <div className="text-gray-700 whitespace-pre-wrap">{tc.explanation}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentProblem.testCases && currentProblem.testCases.filter(tc => tc.hidden).length > 0 && (
                <div>
                  <h4 className={`text-xs font-semibold mb-1 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>Hidden Test Cases</h4>
                  <div className="text-xs text-gray-600">
                    {currentProblem.testCases.filter(tc => tc.hidden).length} additional test cases will be run but not shown.
                  </div>
                </div>
              )}
            </div>
          );
        })() : null}

        {activeTab === 'Editorial' && (
          <div className="p-4 text-sm text-gray-600">Editorial content is not available for this dynamic problem. You can attach editorial notes via the problemData prop.</div>
        )}
        {activeTab === 'Solutions' && (
          <div className="p-4 text-sm text-gray-600">Solutions view - paste sample solutions or explanations in the problemData.explanation field to display here.</div>
        )}
        {activeTab === 'Submissions' && (
          <SubmissionsPanel contestId={location.state?.contestId || props.contestId || null} />
        )}
      </div>
    </div>
  );

  // Simplified loading screen (white + blue) — generation removed.
  if (loadingProblem && !problemData) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <h2 className="text-2xl font-semibold text-blue-700">Loading problem...</h2>
          <p className="text-sm text-blue-500 mt-2">Please wait while the problem is loaded from the provided source.</p>
        </div>
      </div>
    );
  }

  // Main Coding Interface - OPTIMIZED HEIGHT
  const rootClasses = 'fixed inset-0 z-[100] w-full h-screen overflow-hidden max-w-[100vw] flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100';

  // Show break screen between rounds
  if (showBreakScreen) {
    const currentRound = allRounds[currentRoundIndex];
    const nextRound = allRounds[currentRoundIndex + 1];
    
    return (
      <RoundBreakScreen
        currentRound={currentRound}
        nextRound={nextRound}
        currentRoundIndex={currentRoundIndex}
        totalRounds={totalRounds}
        onContinue={handleContinueToNextRound}
        trackKey={trackKey}
      />
    );
  }

  return (
    <div className={rootClasses}>
      {/* Full Interview Progress Header */}
      {isFullInterview && (
        <div className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <div className="font-bold">Round {currentRoundIndex + 1} of {totalRounds}</div>
              <div className="text-blue-100 text-xs">{allRounds[currentRoundIndex]?.label}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Full Interview Mode</div>
            <div className="text-xs text-blue-200">{totalRounds - currentRoundIndex - 1} rounds remaining</div>
          </div>
        </div>
      )}
      
     

      {/* Split Workspace (responsive) */}
      <div ref={splitRef} className={`flex-1 w-full ${isMobile ? 'flex flex-col' : 'flex relative'} overflow-hidden`}>
        {/* Problem Panel - sticky, scrollable, card style */}
        {!isMobile && (
          <div
            ref={leftRef}
            style={{ width: `${leftWidth}%`, minWidth: '340px', background: '#f8fafc', borderRight: '1px solid #e0e7ef' }}
            className="flex-shrink-0 h-full overflow-y-auto sticky top-0 shadow-lg"
          >
            <div className="p-6">
              {ProblemPanel}
            </div>
          </div>
        )}
        {isMobile && ProblemPanel}

        {/* Divider (desktop only) */}
        {!isMobile && (
          <div
            onMouseDown={startDrag}
            onTouchStart={startDrag}
            className="w-2 cursor-col-resize bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200 hover:from-blue-300 hover:via-blue-400 hover:to-blue-300 transition relative group"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 bg-blue-600 mix-blend-multiply transition" />
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-5 h-16 rounded-full bg-white/70 border border-blue-300 shadow flex items-center justify-center text-[10px] text-blue-600 font-medium">⇔</div>
          </div>
        )}

        {/* Right: Editor & Output */}
        <div ref={rightRef} className="flex-1 flex flex-col min-w-0 bg-white" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}> 
          {/* Language & Actions Bar */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-blue-100 bg-blue-50/60">
            <div className="flex items-center gap-3">
              <select
                value={language ? language.id : ''}
                onChange={(e) => {
                  const lang = languages.find(l => l.id === Number(e.target.value));
                  if (lang) handleLanguageChange(lang);
                }}
                className="text-sm border border-blue-200 rounded-lg px-3 py-1.5 bg-white text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={!language}
              >
                {!language && <option value="">No language available</option>}
                {languages.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="text-sm border border-blue-200 rounded-lg px-2 py-1 bg-white text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {[14, 16, 18, 20].map(sz => <option key={sz} value={sz}>{sz}px</option>)}
              </select>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="text-sm border border-blue-200 rounded-lg px-2 py-1 bg-white text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {['vs-dark','light','hc-black'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetCode} className="px-3 py-1.5 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition font-medium">Reset</motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={runSampleTests} 
                disabled={isSubmitting || (!problemDetails && !problemData)} 
                className="px-4 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow"
              >
                {isSubmitting ? 'Running...' : 'Run Sample Tests'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCodeSubmit}
                disabled={isSubmitting || (!problemDetails && !problemData)}
                className="px-4 py-1.5 text-sm bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow"
              >
                {isSubmitting ? 'Running Tests...' : 'Run All Tests'}
              </motion.button>
              {/* Problem generation removed — host should supply `problemData` */}
            </div>
          </div>

           
          <div ref={verticalSplitRef} className="flex-1 flex flex-col min-h-0 select-none">
            
            <div style={{ height: isMobile ? 'auto' : `calc(${editorHeight}% - 3px)` }} className={`${isMobile ? 'h-auto' : 'relative'} min-h-[180px] border-b border-blue-100`}>
              <Editor
                height={isMobile ? '50vh' : '100%'}
                language={language ? language.name : 'plaintext'}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme={editorTheme}
                options={{
                  fontSize: fontSize,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  glyphMargin: false,
                  folding: true,
                  padding: { top: 8 }
                }}
                onMount={(editor) => { editorRef.current = editor; }}
              />
              {!isMobile && (
                <div className="absolute top-1 left-2 text-[10px] text-blue-400 bg-white/70 px-1 rounded shadow-sm">Editor</div>
              )}
            </div>
            {/* Horizontal Divider (Desktop) */}
            {!isMobile && (
              <div
                onMouseDown={startVerticalDrag}
                onTouchStart={startVerticalDrag}
                className={`h-2 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 cursor-row-resize relative group ${vDragging ? 'from-blue-300 via-blue-400 to-blue-300' : ''}`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-40 bg-blue-600 mix-blend-multiply transition" />
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-20 h-4 rounded-full bg-white/70 border border-blue-300 shadow flex items-center justify-center text-[10px] text-blue-600 font-medium">⇕</div>
              </div>
            )}
            {/* Output & Tests (remaining space) - REDESIGNED */}
            <div style={{ height: isMobile ? 'auto' : `calc(${100 - editorHeight}% - 3px)` }} className="flex-1 min-h-[300px] flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 border-t-2 border-blue-300">
              
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 p-3 bg-white border-b-2 border-blue-200 shadow-sm">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveOutputTab('custom')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    activeOutputTab === 'custom'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>💻</span>
                    <span>Custom Input/Output</span>
                  </span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveOutputTab('tests')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all relative ${
                    activeOutputTab === 'tests'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🧪</span>
                    <span>Test Results</span>
                    {testResults && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        testResults.passed === testResults.total 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {testResults.passed}/{testResults.total}
                      </span>
                    )}
                  </span>
                </motion.button>
              </div>

              {/* Custom Input/Output Tab */}
              {activeOutputTab === 'custom' && (
                <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
                  
                  {/* Custom Input Section - Larger */}
                  <div className="flex flex-col h-1/2 min-h-[180px]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                        <span>📝</span> Custom Input
                      </h3>
                      <div className="flex gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05 }} 
                          whileTap={{ scale: 0.95 }} 
                          onClick={runCode} 
                          disabled={isRunning}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition font-bold shadow-lg"
                        >
                          {isRunning ? '⏳ Executing...' : '▶ Execute Code'}
                        </motion.button>
                        {currentTestCasesNormalized && currentTestCasesNormalized.length > 0 && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={() => {
                              const firstTestInput = currentTestCasesNormalized[0]?.input || '';
                              setCustomInput(typeof firstTestInput === 'string' ? firstTestInput : JSON.stringify(firstTestInput));
                              toast.info('Loaded first test case input');
                            }} 
                            className="px-3 py-2 bg-green-50 border-2 border-green-400 hover:bg-green-600 hover:text-white text-green-700 text-sm rounded-lg transition font-semibold"
                          >
                            Use Sample
                          </motion.button>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.05 }} 
                          whileTap={{ scale: 0.95 }} 
                          onClick={() => setCustomInput('')} 
                          className="px-3 py-2 bg-red-50 border-2 border-red-300 hover:bg-red-600 hover:text-white text-red-600 text-sm rounded-lg transition font-semibold"
                        >
                          Clear
                        </motion.button>
                      </div>
                    </div>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter input values here (one per line or space-separated)&#10;Example:&#10;2 3&#10;or&#10;5&#10;10"
                      className="flex-1 p-4 border-2 border-blue-300 rounded-xl font-mono text-base resize-none focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white shadow-inner"
                      style={{fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace'}}
                    />
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <span>💡</span>
                      <span>Click "Execute Code" to run with this custom input. Use "Run Sample Tests" or "Run All Tests" for test cases.</span>
                    </p>
                  </div>

                  {/* Program Output Section - Larger */}
                  <div className="flex flex-col h-1/2 min-h-[180px]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                        <span>📤</span> Program Output
                      </h3>
                      <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => setOutput('')} 
                        className="px-3 py-2 bg-red-50 border-2 border-red-300 hover:bg-red-600 hover:text-white text-red-600 text-sm rounded-lg transition font-semibold"
                      >
                        Clear Output
                      </motion.button>
                    </div>
                    <div className="flex-1 bg-gray-900 rounded-xl p-4 overflow-y-auto border-2 border-gray-700 shadow-inner">
                      <pre className="text-base font-mono text-green-400 whitespace-pre-wrap" style={{fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace'}}>
                        {output || '// Run code to see output...\n// Your program output will appear here'}
                      </pre>
                    </div>
                  </div>

                </div>
              )}

              {/* Test Results Tab */}
              {activeOutputTab === 'tests' && (
                <div className="flex-1 overflow-y-auto p-4">
                  {testResults ? (
                    <div className="space-y-4">
                      
                      {/* Test Summary Header */}
                      <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl p-4 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold mb-1">🧪 Test Execution Results</h3>
                            <p className="text-blue-50 text-sm">Code tested against {testResults.total} test case(s)</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${testResults.passed === testResults.total ? 'text-green-200' : 'text-red-200'}`}>
                              {testResults.passed}/{testResults.total}
                            </div>
                            <div className="text-sm text-blue-50">Tests Passed</div>
                          </div>
                        </div>
                        {testResults.metrics && (
                          <div className="flex gap-4 mt-3 pt-3 border-t border-blue-300">
                            <div className="bg-white/20 px-3 py-2 rounded-lg">
                              <div className="text-xs text-blue-50">Avg Time</div>
                              <div className="font-bold">{Number(testResults.metrics.avgTime).toFixed(3)}s</div>
                            </div>
                            <div className="bg-white/20 px-3 py-2 rounded-lg">
                              <div className="text-xs text-blue-50">Max Memory</div>
                              <div className="font-bold">{testResults.metrics.maxMemory} KB</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sample Test Cases - visible ones */}
                      {testResults.details?.filter((r, idx) => {
                        const testCase = currentTestCasesNormalized?.[idx];
                        return !testCase?.hidden;
                      }).length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                            <span>✅</span> Sample Test Cases
                          </h4>
                          <div className="space-y-3">
                            {testResults.details?.map((r, idx) => {
                              const testCase = currentTestCasesNormalized?.[idx];
                              if (testCase?.hidden) return null;
                              return (
                                <div key={idx} className="bg-white p-4 rounded-xl border-2 border-blue-200 shadow-md">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="text-base font-bold text-blue-800">Test Case {idx + 1}</div>
                                    <div className={`text-sm px-3 py-1.5 rounded-full font-bold ${r.passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                      {r.passed ? '✓ PASS' : '✗ FAIL'}
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-300 shadow-sm">
                                      <div className="font-bold text-blue-700 mb-2">📥 Input:</div>
                                      <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap bg-white p-2 rounded border border-blue-200">
                                        {r.input !== undefined ? (typeof r.input === 'string' ? r.input : JSON.stringify(r.input)) : '—'}
                                      </div>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-300 shadow-sm">
                                      <div className="font-bold text-blue-700 mb-2">✓ Expected:</div>
                                      <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap bg-white p-2 rounded border border-blue-200">
                                        {r.expected !== undefined ? (typeof r.expected === 'string' ? r.expected : JSON.stringify(r.expected)) : '—'}
                                      </div>
                                    </div>
                                    <div className={`p-3 rounded-lg border-2 shadow-sm ${r.passed ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                                      <div className={`font-bold mb-2 ${r.passed ? 'text-green-700' : 'text-red-700'}`}>📤 Actual Output:</div>
                                      <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap bg-white p-2 rounded border border-gray-300">
                                        {r.actual !== undefined ? (typeof r.actual === 'string' ? r.actual : JSON.stringify(r.actual)) : '—'}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-300">
                                        <span className="font-bold text-blue-700">⏱ Time:</span> <span className="text-gray-700">{r.time || '—'}s</span>
                                      </div>
                                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-300">
                                        <span className="font-bold text-blue-700">💾 Memory:</span> <span className="text-gray-700">{r.memory || '—'} KB</span>
                                      </div>
                                    </div>
                                    {testCase?.explanation && (
                                      <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-300">
                                        <div className="font-bold text-blue-800 mb-2">💡 Explanation:</div>
                                        <div className="text-gray-700 text-sm whitespace-pre-wrap">{testCase.explanation}</div>
                                      </div>
                                    )}
                                    {r.classification && (
                                      <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300 font-semibold text-xs">
                                        {r.classification}
                                      </div>
                                    )}
                                    {r.compile_output && (
                                      <div className="text-amber-800 bg-amber-50 border-2 border-amber-300 rounded-lg p-3">
                                        <span className="font-bold">⚠ Compile Output:</span> {r.compile_output}
                                      </div>
                                    )}
                                    {r.stderr && !r.compile_output && (
                                      <div className="text-red-800 bg-red-50 border-2 border-red-300 rounded-lg p-3">
                                        <span className="font-bold">❌ Stderr:</span> {r.stderr}
                                      </div>
                                    )}
                                    {r.error && (
                                      <div className="text-red-800 bg-red-50 border-2 border-red-300 rounded-lg p-3">
                                        <span className="font-bold">🚨 Error:</span> {r.error}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Hidden Test Cases - show pass/fail but not details */}
                      {testResults.details?.filter((r, idx) => {
                        const testCase = currentTestCasesNormalized?.[idx];
                        return testCase?.hidden;
                      }).length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                            <span>🔒</span> Hidden Test Cases
                          </h4>
                          <div className="space-y-3">
                            {testResults.details?.map((r, idx) => {
                              const testCase = currentTestCasesNormalized?.[idx];
                              if (!testCase?.hidden) return null;
                              return (
                                <div key={idx} className="bg-white p-4 rounded-xl border-2 border-blue-200 shadow-md">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="text-base font-bold text-blue-800">Hidden Test {idx + 1 - (testResults.details?.filter((_, i) => i < idx && !currentTestCasesNormalized?.[i]?.hidden).length || 0)}</div>
                                    <div className={`text-sm px-3 py-1.5 rounded-full font-bold ${r.passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                      {r.passed ? '✓ PASS' : '✗ FAIL'}
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-300">
                                      <div className="font-bold text-blue-700 mb-2">🔒 Input:</div>
                                      <div className="italic text-gray-600">Hidden for evaluation</div>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-300">
                                      <div className="font-bold text-blue-700 mb-2">🔒 Expected:</div>
                                      <div className="italic text-gray-600">Hidden for evaluation</div>
                                    </div>
                                    <div className={`p-3 rounded-lg border-2 shadow-sm ${r.passed ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                                      <div className={`font-bold mb-2 ${r.passed ? 'text-green-700' : 'text-red-700'}`}>📤 Actual Output:</div>
                                      <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap bg-white p-2 rounded border border-gray-300">
                                        {r.actual !== undefined ? (typeof r.actual === 'string' ? r.actual : JSON.stringify(r.actual)) : '—'}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-300">
                                        <span className="font-bold text-blue-700">⏱ Time:</span> <span className="text-gray-700">{r.time || '—'}s</span>
                                      </div>
                                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-300">
                                        <span className="font-bold text-blue-700">💾 Memory:</span> <span className="text-gray-700">{r.memory || '—'} KB</span>
                                      </div>
                                    </div>
                                    {r.classification && (
                                      <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300 font-semibold text-xs">
                                        {r.classification}
                                      </div>
                                    )}
                                    {r.compile_output && (
                                      <div className="text-amber-800 bg-amber-50 border-2 border-amber-300 rounded-lg p-3">
                                        <span className="font-bold">⚠ Compile Output:</span> {r.compile_output}
                                      </div>
                                    )}
                                    {r.stderr && !r.compile_output && (
                                      <div className="text-red-800 bg-red-50 border-2 border-red-300 rounded-lg p-3">
                                        <span className="font-bold">❌ Stderr:</span> {r.stderr}
                                      </div>
                                    )}
                                    {r.error && (
                                      <div className="text-red-800 bg-red-50 border-2 border-red-300 rounded-lg p-3">
                                        <span className="font-bold">🚨 Error:</span> {r.error}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20">
                      <div className="text-6xl mb-4">🧪</div>
                      <h3 className="text-xl font-bold text-gray-600 mb-2">No Test Results Yet</h3>
                      <p className="text-gray-500 text-center max-w-md">
                        Click "Run Sample Tests" or "Run All Tests" to execute your code against test cases
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompilerPage;
