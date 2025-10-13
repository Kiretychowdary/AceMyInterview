// PROFESSIONAL CODING INTERVIEW - OPTIMIZED UI DESIGN
import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import GeminiService from '../services/GeminiService';
import { validateJudge0Setup } from '../utils/judge0Config';
import judge0Client from '../services/judge0Client';
import { markRoundComplete } from '../config/roundsConfig';
import { useAuth } from './AuthContext';
import RoundBreakScreen from './RoundBreakScreen';
import { testJudge0Connection, printConnectionReport } from '../utils/judge0Diagnostics';

const languages = [
  {
    id: 50,
    name: "c",
    label: "C",
    icon: "🔧",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    template: `#include <stdio.h>

int main() {
    // Your solution here
    printf("Hello, World!\\n");
    return 0;
}`
  },
  {
    id: 54,
    name: "cpp",
    label: "C++",
    icon: "⚡",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Your solution here
    cout << "Hello, World!" << endl;
    return 0;
}`
  },
  {
    id: 62,
    name: "java",
    label: "Java",
    icon: "☕",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    template: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your solution here
        System.out.println("Hello, World!");
        sc.close();
    }
}`
  },
  {
    id: 71,
    name: "python",
    label: "Python",
    icon: "🐍",
    color: "bg-green-100 text-green-800 border-green-300",
    template: `# Your solution here
def solve():
    # Implement your solution
    print("Hello, World!")

if __name__ == "__main__":
    solve()
`
  },
];

const topics = [
  { value: 'algorithms', label: 'Algorithms', icon: '🧠', color: 'blue' },
  { value: 'data-structures', label: 'Data Structures', icon: '📊', color: 'blue' },
  { value: 'dynamic-programming', label: 'Dynamic Programming', icon: '🔄', color: 'blue' },
  { value: 'strings', label: 'String Manipulation', icon: '📝', color: 'blue' },
  { value: 'arrays', label: 'Arrays & Lists', icon: '📋', color: 'blue' },
];

// Topic hierarchy system for coding problems
const mainCodingTopics = [
  { value: 'algorithms', label: 'Algorithms & Logic', icon: '🧠', color: 'blue' },
  { value: 'data-structures', label: 'Data Structures', icon: '📊', color: 'green' },
  { value: 'system-design', label: 'System Design', icon: '🏗️', color: 'purple' },
  { value: 'web-development', label: 'Web Development', icon: '🌐', color: 'orange' },
  { value: 'database', label: 'Database & SQL', icon: '🗄️', color: 'indigo' },
  { value: 'mathematics', label: 'Mathematical Programming', icon: '📐', color: 'red' }
];

// Subtopics for each main coding category
const codingSubTopics = {
  'algorithms': [
    { value: 'sorting', label: 'Sorting Algorithms', icon: '🔄' },
    { value: 'searching', label: 'Searching Algorithms', icon: '🔍' },
    { value: 'graph-algorithms', label: 'Graph Algorithms', icon: '🕸️' },
    { value: 'greedy', label: 'Greedy Algorithms', icon: '🎯' },
    { value: 'divide-conquer', label: 'Divide & Conquer', icon: '⚡' },
    { value: 'backtracking', label: 'Backtracking', icon: '🔙' },
    { value: 'dynamic-programming', label: 'Dynamic Programming', icon: '💡' },
    { value: 'bit-manipulation', label: 'Bit Manipulation', icon: '🔢' }
  ],
  'data-structures': [
    { value: 'arrays', label: 'Arrays & Lists', icon: '📋' },
    { value: 'linked-lists', label: 'Linked Lists', icon: '🔗' },
    { value: 'stacks-queues', label: 'Stacks & Queues', icon: '📚' },
    { value: 'trees', label: 'Trees & Binary Trees', icon: '🌳' },
    { value: 'heaps', label: 'Heaps & Priority Queues', icon: '⛰️' },
    { value: 'hash-tables', label: 'Hash Tables & Maps', icon: '🗂️' },
    { value: 'graphs', label: 'Graphs & Networks', icon: '🕸️' },
    { value: 'tries', label: 'Tries & Prefix Trees', icon: '🌲' }
  ],
  'system-design': [
    { value: 'scalability', label: 'System Scalability', icon: '📈' },
    { value: 'load-balancing', label: 'Load Balancing', icon: '⚖️' },
    { value: 'caching', label: 'Caching Strategies', icon: '💾' },
    { value: 'microservices', label: 'Microservices Design', icon: '🔧' },
    { value: 'api-design', label: 'API Design', icon: '🔌' },
    { value: 'distributed-systems', label: 'Distributed Systems', icon: '🌐' }
  ],
  'web-development': [
    { value: 'javascript', label: 'JavaScript Challenges', icon: '⚡' },
    { value: 'react', label: 'React Problems', icon: '⚛️' },
    { value: 'nodejs', label: 'Node.js Backend', icon: '🟢' },
    { value: 'dom-manipulation', label: 'DOM Manipulation', icon: '🎨' },
    { value: 'async-programming', label: 'Async Programming', icon: '🔄' },
    { value: 'web-apis', label: 'Web APIs', icon: '🔌' }
  ],
  'database': [
    { value: 'sql-queries', label: 'SQL Query Problems', icon: '🔍' },
    { value: 'database-design', label: 'Database Design', icon: '🏗️' },
    { value: 'optimization', label: 'Query Optimization', icon: '⚡' },
    { value: 'transactions', label: 'Transactions & ACID', icon: '🔒' },
    { value: 'nosql', label: 'NoSQL Databases', icon: '📊' }
  ],
  'mathematics': [
    { value: 'number-theory', label: 'Number Theory', icon: '🔢' },
    { value: 'combinatorics', label: 'Combinatorics', icon: '🎲' },
    { value: 'probability', label: 'Probability', icon: '📈' },
    { value: 'geometry', label: 'Computational Geometry', icon: '📐' },
    { value: 'matrix', label: 'Matrix Operations', icon: '⬜' }
  ]
};

const difficulties = [
  { value: 'easy', label: 'Easy', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { value: 'medium', label: 'Medium', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { value: 'hard', label: 'Hard', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
];

function CompilerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get selected topic from navigation state
  const selectedTopic = location.state?.subject || 'algorithms';

  // Full interview mode tracking
  const isFullInterview = location.state?.isFullInterview || false;
  const allRounds = location.state?.allRounds || [];
  const currentRoundIndex = location.state?.currentRoundIndex || 0;
  const trackKey = location.state?.trackKey || null;
  const totalRounds = location.state?.totalRounds || 0;

  // Topic hierarchy state
  const [selectedMainTopic, setSelectedMainTopic] = useState(null);
  const [showSubTopics, setShowSubTopics] = useState(false);
  const [configuredTopic, setConfiguredTopic] = useState(null);
  const [showBreakScreen, setShowBreakScreen] = useState(false);
  
  // Judge0 connection state
  const [judge0Status, setJudge0Status] = useState({ connected: null, testing: false });

  // Auto-configure based on selected topic from navigation
  useEffect(() => {
    if (selectedTopic && selectedTopic !== 'algorithms') {
      // Map selected topic to main categories
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
        // Auto-select a default subtopic based on the main topic
        const defaultSubtopic = getCodingDefaultSubtopic(selectedTopic);
        if (defaultSubtopic) {
          setProblemConfig({ ...problemConfig, topic: defaultSubtopic });
          setConfiguredTopic(defaultSubtopic);
        }
      }
    }
  }, [selectedTopic]);

  // Get default coding subtopic based on selected main topic
  const getCodingDefaultSubtopic = (topic) => {
    const defaultMap = {
      'Software Developer': 'sorting',
      'DSA': 'arrays',
      'OOPS': 'algorithms',
      'System Design': 'scalability',
      'Cybersecurity': 'bit-manipulation',
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

  // Map topics to API format
  const mapTopicToAPI = (topic) => {
    const topicMap = {
      'Software Developer': 'algorithms',
      'DSA': 'data-structures',
      'OOPS': 'algorithms',
      'System Design': 'system-design',
      'Cybersecurity': 'algorithms',
      'Network Security': 'algorithms',
      'Ethical Hacking': 'algorithms',
      'Cryptography': 'algorithms',
      'Data Analyst': 'arrays',
      'Product Manager': 'algorithms',
      'HR Interview': 'algorithms',
      'Project Coordinator': 'algorithms',
      'System Admin': 'algorithms'
    };
    return topicMap[topic] || topic.toLowerCase().replace(/\s+/g, '-');
  };

  const apiTopic = mapTopicToAPI(selectedTopic);

  // Get current topics for display (main or sub)
  const getCurrentCodingTopics = () => {
    if (selectedMainTopic && showSubTopics) {
      return codingSubTopics[selectedMainTopic] || [];
    }
    return mainCodingTopics;
  };

  // Editor preference persistence
  const PREF_KEY = 'ami_editor_prefs_v1';
  const loadPrefs = () => {
    try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch { return {}; }
  };
  const initialPrefs = loadPrefs();
  const defaultLang = languages.find(l => l.name === (initialPrefs.languageName)) || languages[3];
  const [code, setCode] = useState(defaultLang.template); // Default to Python (or stored)
  const [language, setLanguage] = useState(defaultLang);
  const [problemDetails, setProblemDetails] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showProblemPanel, setShowProblemPanel] = useState(true);
  const [editorTheme, setEditorTheme] = useState(initialPrefs.theme || 'vs-dark');
  const [fontSize, setFontSize] = useState(initialPrefs.fontSize || 14);
  const [testResults, setTestResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef(null);
  const splitRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [leftWidth, setLeftWidth] = useState(55); // percentage (wider default to use more horizontal space)
  // Responsive breakpoint handling (mobile vs desktop)
  const [isMobile, setIsMobile] = useState(false);
  // Vertical split between editor and console/test area (percentage of available right panel height)
  const [editorHeight, setEditorHeight] = useState(65); // % of vertical space for editor
  const [vDragging, setVDragging] = useState(false);
  const verticalSplitRef = useRef(null);
  // Start in full screen by default so users get maximum workspace immediately
  const [isFullScreen, setIsFullScreen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      // Use 1024px (Tailwind's lg breakpoint ~1024) as switch to mobile stacked layout
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Escape key exits full screen
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
      if ((e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f'))) {
        e.preventDefault();
        setIsFullScreen(f => !f);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullScreen]);

  // Lock body scroll when in full screen
  useEffect(() => {
    if (isFullScreen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isFullScreen]);

  // Sync full screen with presence of editor (problemDetails)
  // If a problem is loaded -> force full screen ON; if not -> allow normal layout & user toggle
  useEffect(() => {
    const shouldFull = !!problemDetails;
    if (shouldFull !== isFullScreen) setIsFullScreen(shouldFull);
  }, [problemDetails]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        if (event.shiftKey) {
          submitCode();
        } else {
          runCode();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [code, isRunning, isSubmitting]);

  // Problem generation configuration - use selected topic as default
  const [problemConfig, setProblemConfig] = useState({
    topic: apiTopic,
    difficulty: 'medium',
    language: 'python'
  });

  // Loading message cycling state
  const [messageIndex, setMessageIndex] = useState(0);
  const loadingMessages = [
    "⚡ Parsing algorithms...",
    "🔍 Scanning data structures...",
    "🧠 Building logic puzzles...",
    "🚀 Optimizing complexity...",
    "💻 Generating test cases...",
    "🎯 Finalizing your challenge..."
  ];

  // Cycle through loading messages every 2 seconds during loading
  useEffect(() => {
    let interval;
    if (loadingProblem) {
      // Reset message index when loading starts
      setMessageIndex(0);
      interval = setInterval(() => {
        setMessageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % loadingMessages.length;
          return nextIndex;
        });
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadingProblem]);

  // Dismiss all toasts when problem is displayed
  useEffect(() => {
    if (problemDetails && !loadingProblem) {
      toast.dismiss(); // Clear all toasts when problem interface appears
    }
  }, [problemDetails, loadingProblem]);

  // Generate new problem
  const generateNewProblem = async () => {
    setLoadingProblem(true);
    setProblemDetails(null);

    try {

      const response = await GeminiService.getCodingProblem(
        problemConfig.topic,
        problemConfig.difficulty,
        problemConfig.language
      );

      if (response.success && response.problem) {
        setProblemDetails(response.problem);

        // No success toast - keep interface clean when problem appears
      } else {
        setProblemDetails(response.problem);

        // No toasts when content appears - keep interface clean
      }
    } catch (error) {
      console.error("Failed to generate problem:", error);
      toast.error(`❌ Failed to generate problem: ${error.message}`);
      setProblemDetails({
        error: "Unable to generate AI problem. Please try again later.",
        title: "Error",
        description: "The AI service is currently unavailable. Please check your connection and try again."
      });
    } finally {
      setLoadingProblem(false);
    }
  };

  // Handle language change
  // Persist preferences when changed
  useEffect(() => {
    const prefs = { languageName: language.name, fontSize, theme: editorTheme };
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch {}
  }, [language, fontSize, editorTheme]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(newLanguage.template);
    setProblemConfig({ ...problemConfig, language: newLanguage.name });
  };

  // Run code
  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }
    const judge0Status = validateJudge0Setup();
    if (!judge0Status.valid) {
      toast.error('Judge0 not configured');
      setOutput(judge0Status.message);
      return;
    }
    setIsRunning(true);
    setOutput('Running code...');
    try {
      const res = await judge0Client.runOnce({ code, languageId: language.id, stdin: '' });
      if (res.compile_output) {
        setOutput(res.compile_output);
      } else if (res.stderr) {
        setOutput(res.stderr);
      } else {
        setOutput(res.stdout || 'No output');
      }
    } catch (e) {
      setOutput('Error: ' + e.message);
      toast.error('Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  // Reset code
  const resetCode = () => {
    setCode(language.template);
    setOutput('');
    setTestResults(null);
  };

  // Submit and test code
  const submitCode = async () => {
    if (!code.trim()) { toast.error('Please write some code first!'); return; }
    if (!problemDetails || !problemDetails.testCases) { toast.error('No test cases available for this problem!'); return; }
    const judge0Status = validateJudge0Setup();
    if (!judge0Status.valid) {
      toast.error('Judge0 not configured');
      setTestResults({ passed:0,total:0,details:[{input:'',expected:'',actual:judge0Status.message,passed:false,error:'Configuration'}]});
      return;
    }
    setIsSubmitting(true);
    setTestResults({ passed:0,total:0,details:[] });
    try {
      toast.info('🧪 Running test cases...', { autoClose:1500 });
      const batch = await judge0Client.runBatch({ code, languageId: language.id, testCases: problemDetails.testCases });
      setTestResults(batch);
      if (batch.passed === batch.total) {
        toast.success(`🎉 All ${batch.passed}/${batch.total} test cases passed! Great job!`);
        // Persist round completion if we navigated here from a round
        const roundId = location.state?.roundId;
        if (roundId) {
          try { markRoundComplete(user?.uid || 'anonymous', roundId); } catch {}
        }
        
        // If this is part of a full interview, proceed to next round after a delay
        if (isFullInterview && currentRoundIndex < allRounds.length - 1) {
          setTimeout(() => {
            setShowBreakScreen(true);
          }, 3000); // Show success for 3 seconds before break
        }
      } else {
        toast.error(`❌ ${batch.passed}/${batch.total} test cases passed. Keep trying!`);
      }
    } catch (e) {
      toast.error('Failed to run tests: ' + e.message);
      setTestResults({ passed:0,total:0,details:[],error:e.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const testJudge0Setup = async () => {
    setJudge0Status({ connected: null, testing: true });
    toast.info('🔍 Testing Judge0 connection...', { autoClose: 2000 });
    
    try {
      const results = await testJudge0Connection();
      const success = printConnectionReport(results);
      
      setJudge0Status({ connected: success, testing: false });
      
      if (success) {
        toast.success('✅ Judge0 is connected and working!', { autoClose: 3000 });
      } else {
        toast.error(
          `❌ Judge0 connection failed:\n${results.errors.join('\n')}`,
          { autoClose: 5000 }
        );
      }
    } catch (error) {
      setJudge0Status({ connected: false, testing: false });
      toast.error(`❌ Connection test failed: ${error.message}`, { autoClose: 5000 });
    }
  };

  const handleContinueToNextRound = () => {
    const nextRoundIndex = currentRoundIndex + 1;
    const nextRound = allRounds[nextRoundIndex];
    
    if (!nextRound) {
      navigate('/interview-preparation');
      return;
    }
    
    const modeRoute = (mode) => {
      if (mode === 'MCQ') return '/mcq-interview';
      if (mode === 'CODING' || mode === 'Coding Compiler') return '/compiler';
      if (mode === 'PERSON' || mode === 'Person-to-Person') return '/face-to-face-interview';
      return '/interview-preparation';
    };
    
    console.log('🔄 Navigating to next round:', { nextRound, nextRoundIndex, trackKey });
    
    navigate(modeRoute(nextRound.mode), {
      state: {
        roundId: nextRound.id,
        subject: selectedTopic, // Keep using same topic
        trackKey,
        allRounds,
        currentRoundIndex: nextRoundIndex,
        isFullInterview: true,
        totalRounds
      }
    });
  };

  // Helper function to poll for result
  const pollForResult = async (token) => {
    const judge0Urls = getJudge0Urls();
    const headers = getJudge0Headers();

    return new Promise((resolve, reject) => {
      const checkResult = async () => {
        try {
          const result = await axios.get(
            judge0Urls.getResult(token),
            { headers }
          );

          if (result.data.status.id <= 2) {
            setTimeout(checkResult, 1000);
          } else {
            resolve(result.data);
          }
        } catch (error) {
          reject(error);
        }
      };

      checkResult();
    });
  };

  const startDrag = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const startVerticalDrag = (e) => {
    e.preventDefault();
    setVDragging(true);
  };
  useEffect(() => {
    const handleMove = (e) => {
      if (!dragging || !splitRef.current) return;
      if (isMobile) return; // disable horizontal drag on mobile stacked layout
      const rect = splitRef.current.getBoundingClientRect();
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      if (!x) return;
      let pct = ((x - rect.left) / rect.width) * 100;
      // Allow a bit more expansion to utilize extra whitespace (up to 80%)
      pct = Math.max(25, Math.min(85, pct));
      setLeftWidth(pct);
    };
    const stop = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', stop);
    };
  }, [dragging, isMobile]);

  // Vertical drag between editor and output
  useEffect(() => {
    const handleVMove = (e) => {
      if (!vDragging || !verticalSplitRef.current) return;
      if (isMobile) return; // stacked layout disables vertical resize
      const container = verticalSplitRef.current.getBoundingClientRect();
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      if (!y) return;
      const top = container.top;
      const height = container.height;
      let pct = ((y - top) / height) * 100;
      // Clamp to keep console visible & editor usable
      pct = Math.max(45, Math.min(85, pct));
      setEditorHeight(pct);
    };
    const stop = () => setVDragging(false);
    window.addEventListener('mousemove', handleVMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', handleVMove);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', handleVMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', handleVMove);
      window.removeEventListener('touchend', stop);
    };
  }, [vDragging, isMobile]);

  // Problem panel extracted for reuse (desktop & mobile)
  const ProblemPanel = (
    <div className={`${!isMobile ? 'h-full overflow-hidden flex flex-col border-r border-blue-200 bg-white' : 'w-full bg-white border-b border-blue-200 flex flex-col'} ${!showProblemPanel && isMobile ? 'hidden' : ''}`}>
      <div className={`flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-blue-50/70 ${isMobile ? '' : ''}`}>
        <h2 className="text-sm font-semibold text-blue-700">Problem</h2>
        <div className="flex items-center gap-2">
          {/* Widen/Narrow button hidden on mobile */}
          <button onClick={() => setLeftWidth(leftWidth < 40 ? 55 : 35)} className="text-[11px] px-2 py-1 rounded bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition hidden md:inline-block">{leftWidth < 40 ? 'Widen' : 'Narrow'}</button>
          {isMobile && (
            <button onClick={() => setShowProblemPanel(p => !p)} className="md:hidden text-[11px] px-2 py-1 rounded bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition">
              {showProblemPanel ? 'Hide' : 'Show'}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm leading-relaxed custom-scroll">
        {problemDetails ? (
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-2">{problemDetails.title}</h3>
            <div className="text-gray-600 whitespace-pre-wrap mb-4">{problemDetails.description}</div>
            {(() => {
              const raw = problemDetails.examples;
              let list = [];
              if (Array.isArray(raw)) list = raw; // could be strings or objects
              else if (typeof raw === 'string') {
                list = raw.split(/\n\s*\n|Example \d+:/i).map(s => s.trim()).filter(Boolean);
              } else if (raw && typeof raw === 'object') {
                // If it's already an object with numbered keys or example objects
                const keys = Object.keys(raw).sort();
                list = keys.map(k => raw[k]);
              }
              if (list.length === 0) return null;
              return (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">Examples</h4>
                  <div className="space-y-2">
                    {list.map((ex, idx) => {
                      const isObj = ex && typeof ex === 'object' && !Array.isArray(ex);
                      return (
                        <div key={idx} className="border border-blue-100 rounded-lg p-3 bg-blue-50/50">
                          <div className="text-[11px] text-gray-500 mb-1">Example {idx + 1}</div>
                          {isObj ? (
                            <div className="space-y-1 text-[11px] font-mono text-gray-800">
                              {'input' in ex && (
                                <div><span className="font-semibold text-gray-600">Input:</span> <pre className="inline whitespace-pre-wrap">{typeof ex.input === 'string' ? ex.input : JSON.stringify(ex.input)}</pre></div>
                              )}
                              {'output' in ex && (
                                <div><span className="font-semibold text-gray-600">Output:</span> <pre className="inline whitespace-pre-wrap">{typeof ex.output === 'string' ? ex.output : JSON.stringify(ex.output)}</pre></div>
                              )}
                              {'expected' in ex && !('output' in ex) && (
                                <div><span className="font-semibold text-gray-600">Expected:</span> <pre className="inline whitespace-pre-wrap">{typeof ex.expected === 'string' ? ex.expected : JSON.stringify(ex.expected)}</pre></div>
                              )}
                              {'explanation' in ex && (
                                <div><span className="font-semibold text-gray-600">Explanation:</span> <pre className="inline whitespace-pre-wrap">{typeof ex.explanation === 'string' ? ex.explanation : JSON.stringify(ex.explanation)}</pre></div>
                              )}
                            </div>
                          ) : (
                            <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap">{ex}</pre>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            {problemDetails.constraints && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">Constraints</h4>
                <pre className="text-xs font-mono whitespace-pre-wrap bg-blue-50/60 rounded p-3 text-gray-700">{problemDetails.constraints}</pre>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-sm italic">Loading problem or select a topic...</div>
        )}
      </div>
    </div>
  );

  // Configuration Screen (when no problem is loaded)
  if (!problemDetails && !loadingProblem) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="min-h-screen py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-full mb-6 shadow-lg"
              >
                <span className="text-2xl text-white">💻</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-gray-900 mb-3"
              >
                AI Coding Interview
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto mb-4"
              >
                Solve AI-generated coding problems in your favorite programming language
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-lg font-semibold"
              >
                💻 Selected Topic: {selectedTopic}
              </motion.div>
            </div>

            {/* Configuration Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Configure Your Coding Challenge</h2>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Topic Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-lg font-semibold text-gray-700">
                      {showSubTopics ? 'Specific Topic' : 'Problem Category'}
                    </label>
                    {showSubTopics && (
                      <button
                        onClick={() => {
                          setShowSubTopics(false);
                          setSelectedMainTopic(null);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        ← Back to Categories
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {getCurrentCodingTopics().map((topic) => (
                      <motion.button
                        key={topic.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (!showSubTopics) {
                            // Main topic selected - show subtopics
                            setSelectedMainTopic(topic.value);
                            setShowSubTopics(true);
                          } else {
                            // Subtopic selected - set as problem topic
                            setProblemConfig({ ...problemConfig, topic: topic.value });
                            setConfiguredTopic(topic.value);
                          }
                        }}
                        className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${(!showSubTopics && selectedMainTopic === topic.value) ||
                            (showSubTopics && problemConfig.topic === topic.value)
                            ? 'border-blue-700 bg-blue-50 text-blue-900 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{topic.icon}</span>
                          <div>
                            <div className="font-medium">{topic.label}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Selected Topic Display */}
                  {showSubTopics && configuredTopic && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <span className="text-lg">✅</span>
                        <span className="font-medium">Selected: {configuredTopic}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Difficulty & Language */}
                <div className="space-y-4">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">Difficulty Level</label>
                    <div className="space-y-2">
                      {difficulties.map((diff) => (
                        <motion.button
                          key={diff.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setProblemConfig({ ...problemConfig, difficulty: diff.value })}
                          className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${problemConfig.difficulty === diff.value
                              ? 'border-blue-700 bg-blue-50 text-blue-900 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                            }`}
                        >
                          <span className="font-medium">{diff.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">Programming Language</label>
                  <div className="space-y-2">
                    {languages.map((lang) => (
                      <motion.button
                        key={lang.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setProblemConfig({ ...problemConfig, language: lang.name });
                          setLanguage(lang);
                        }}
                        className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${problemConfig.language === lang.name
                            ? 'border-blue-700 bg-blue-50 text-blue-900 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{lang.icon}</span>
                          <div className="font-medium">{lang.label}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: showSubTopics && configuredTopic ? 1.02 : 1 }}
                whileTap={{ scale: showSubTopics && configuredTopic ? 0.98 : 1 }}
                onClick={generateNewProblem}
                disabled={loadingProblem || !showSubTopics || !configuredTopic}
                className={`w-full mt-8 py-3 px-6 font-bold rounded-xl shadow-lg transition-all duration-300 text-lg ${showSubTopics && configuredTopic && !loadingProblem
                    ? 'bg-blue-700 text-white hover:bg-blue-800 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {loadingProblem ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generating Challenge...</span>
                  </div>
                ) : !showSubTopics ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span>📁</span>
                    <span>Select a Category First</span>
                  </div>
                ) : !configuredTopic ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🎯</span>
                    <span>Select a Topic First</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🚀</span>
                    <span>Generate AI Coding Challenge</span>
                  </div>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // 🌟 SPECTACULAR CODING PROBLEM LOADING SCREEN
  if (loadingProblem) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center z-50">
        {/* Animated Code Background */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 left-20 text-green-400 font-mono text-sm animate-pulse">
            {'function generateProblem() {'}
          </div>
          <div className="absolute top-32 left-32 text-blue-400 font-mono text-sm animate-pulse animation-delay-2000">
            {'  return ai.createChallenge();'}
          </div>
          <div className="absolute top-44 left-24 text-yellow-400 font-mono text-sm animate-pulse animation-delay-4000">
            {'}'}
          </div>
          <div className="absolute bottom-40 right-20 text-purple-400 font-mono text-sm animate-pulse">
            {'console.log("Ready to code!");'}
          </div>
        </div>

        {/* Main Loading Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-lg mx-auto px-6"
        >
          {/* Code Brackets Animation */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6 font-mono text-green-400"
          >
            {'{ }'}
          </motion.div>

          {/* Rotating Gear */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-8"
          >
            <div className="w-20 h-20 border-4 border-green-400 border-t-transparent rounded-full"></div>
          </motion.div>

          {/* Loading Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Compiling Challenge...
          </motion.h2>

          {/* Dynamic Coding Messages */}
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-xl text-green-300 mb-8 font-mono"
            >
              {loadingMessages[messageIndex]}
            </motion.div>
          </AnimatePresence>

          {/* Code Block Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gray-800 p-4 rounded-lg border border-green-400 mb-8 font-mono text-sm text-left"
          >
            <div className="text-green-400">// AI Algorithm Generator</div>
            <div className="text-blue-400">const challenge = await ai.create({'{'}
              <div className="ml-4 text-yellow-400">
                difficulty: "{problemConfig.difficulty}",<br />
                topic: "{problemConfig.topic}",<br />
                type: "algorithm"
              </div>
              {'});'}
            </div>
          </motion.div>

          {/* Progress Binary */}
          <div className="flex justify-center space-x-1 mb-8 font-mono text-green-400">
            {[0, 1, 0, 1, 1, 0, 1, 0].map((bit, index) => (
              <motion.span
                key={index}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className="text-2xl"
              >
                {bit}
              </motion.span>
            ))}
          </div>

          {/* Encouraging Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-lg text-gray-300 leading-relaxed"
          >
            🌟 <strong>Preparing {problemConfig.topic} Challenge</strong><br />
            Get ready to solve real-world coding problems<br />
            that will enhance your programming skills!
          </motion.p>

          {/* Terminal Loading Bar */}
          <motion.div
            className="mt-8 mx-auto max-w-md bg-black p-3 rounded font-mono text-green-400 text-sm"
          >
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "easeInOut" }}
                className="h-4 bg-green-400 rounded text-center text-black text-xs leading-4"
              >
                <span className="opacity-90">AI_GENERATING_PROBLEM...</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main Coding Interface - OPTIMIZED HEIGHT
  const rootClasses = isFullScreen
    ? 'fixed inset-0 z-[100] w-screen h-screen overflow-hidden bg-white flex flex-col'
    : 'h-screen w-full max-w-[100vw] overflow-hidden overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col';

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
      
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">C</div>
          <div>
            <h1 className="text-lg font-semibold text-blue-700">Coding Practice</h1>
            <p className="text-[11px] text-gray-500 -mt-1">{selectedTopic}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {/* Judge0 Status Indicator */}
          {judge0Status.connected !== null && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium ${
              judge0Status.connected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <span>{judge0Status.connected ? '✅' : '❌'}</span>
              <span>Judge0</span>
            </div>
          )}
          
          <button
            onClick={testJudge0Setup}
            disabled={judge0Status.testing}
            className="px-3 py-1.5 rounded-lg border border-blue-300 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition text-[11px] font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Test Judge0 Connection"
          >
            {judge0Status.testing ? '🔄 Testing...' : '🔌 Test Judge0'}
          </button>
          
          <span className="hidden sm:inline">Ctrl+Enter: Run • Ctrl+Shift+Enter: Test</span>
          {dragging && <span className="text-blue-600 font-medium">Adjusting Layout...</span>}
          {!problemDetails && (
            <button
              onClick={() => setIsFullScreen(f => !f)}
              className="ml-3 px-3 py-1.5 rounded-lg border border-blue-300 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition text-[11px] font-medium shadow-sm"
              title={isFullScreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen (F11 / Ctrl+Shift+F)'}
            >
              {isFullScreen ? 'Exit Full' : 'Full Screen'}
            </button>
          )}
        </div>
      </div>

      {/* Split Workspace (responsive) */}
      <div ref={splitRef} className={`flex-1 ${isMobile ? 'flex flex-col' : 'flex relative'} overflow-hidden`}>
        {/* Problem Panel */}
        {!isMobile && (
          <div
            ref={leftRef}
            style={{ width: `${leftWidth}%`, minWidth: '320px' }}
            className="flex-shrink-0"
          >
            {ProblemPanel}
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
        <div ref={rightRef} className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Language & Actions Bar */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-blue-100 bg-blue-50/60">
            <div className="flex items-center gap-3">
              <select
                value={language.id}
                onChange={(e) => {
                  const lang = languages.find(l => l.id === Number(e.target.value));
                  if (lang) handleLanguageChange(lang);
                }}
                className="text-sm border border-blue-200 rounded-lg px-3 py-1.5 bg-white text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
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
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={runCode} disabled={isRunning} className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow">{isRunning ? 'Running...' : 'Run'}</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={submitCode} disabled={isSubmitting || !problemDetails} className="px-4 py-1.5 text-sm bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow">{isSubmitting ? 'Testing...' : 'Test'}</motion.button>
            </div>
          </div>

          {/* Editor + Output/Test vertical resizable area */}
          <div ref={verticalSplitRef} className="flex-1 flex flex-col min-h-0 select-none">
            {/* Editor Section */}
            <div style={{ height: isMobile ? 'auto' : `calc(${editorHeight}% - 3px)` }} className={`${isMobile ? 'h-auto' : 'relative'} min-h-[180px] border-b border-blue-100`}>
              <Editor
                height={isMobile ? '50vh' : '100%'}
                language={language.name}
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
            {/* Output & Tests (remaining space) */}
            <div style={{ height: isMobile ? 'auto' : `calc(${100 - editorHeight}% - 3px)` }} className="flex-1 min-h-[120px] flex flex-col bg-blue-50 border-t border-blue-200">
              {/* Output */}
              <div className="p-3 pb-0 flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-blue-700">Output</h3>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setOutput('')} className="px-2 py-1 bg-white border border-blue-300 hover:bg-blue-600 hover:text-white text-blue-600 text-[11px] rounded transition">Clear</motion.button>
                </div>
                <div className="bg-white rounded-lg p-2 flex-1 overflow-y-auto border border-blue-100">
                  <pre className="text-[12px] font-mono text-gray-800 whitespace-pre-wrap">{output || 'Run code to see output...'}</pre>
                </div>
              </div>
              {/* Test Results */}
              {testResults && (
                <div className="bg-white border-t border-blue-200 p-3 flex flex-col max-h-[45%] overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xs font-semibold text-blue-700">Test Results</h3>
                      {testResults.metrics && (
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <span className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Avg Time: {Number(testResults.metrics.avgTime).toFixed(3)}s</span>
                          <span className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Max Memory: {testResults.metrics.maxMemory} KB</span>
                        </div>
                      )}
                    </div>
                    <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${testResults.passed === testResults.total ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{testResults.passed}/{testResults.total}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {testResults.details?.map((r, i) => {
                      return (
                        <div key={i} className={`p-2 rounded border ${r.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-[11px] font-medium">Case {i + 1}</div>
                            <div className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${r.passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{r.passed ? 'PASS' : 'FAIL'}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="col-span-2"><span className="font-medium">Input:</span> {r.input !== undefined ? (typeof r.input === 'string' ? r.input : JSON.stringify(r.input)) : '—'}</div>
                            <div><span className="font-medium">Expected:</span> {r.expected !== undefined ? (typeof r.expected === 'string' ? r.expected : JSON.stringify(r.expected)) : '—'}</div>
                            <div><span className="font-medium">Actual:</span> {r.actual !== undefined ? (typeof r.actual === 'string' ? r.actual : JSON.stringify(r.actual)) : '—'}</div>
                            <div><span className="font-medium">Time:</span> {r.time || '—'}s</div>
                            <div><span className="font-medium">Memory:</span> {r.memory || '—'} KB</div>
                            {r.classification && (
                              <div className="col-span-2 text-[10px] inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{r.classification}</div>
                            )}
                            {r.compile_output && (
                              <div className="col-span-2 text-amber-700 bg-amber-50 border border-amber-200 rounded p-1"><span className="font-medium">Compile:</span> {r.compile_output}</div>
                            )}
                            {r.stderr && !r.compile_output && (
                              <div className="col-span-2 text-red-700 bg-red-50 border border-red-200 rounded p-1"><span className="font-medium">Stderr:</span> {r.stderr}</div>
                            )}
                            {r.error && (
                              <div className="col-span-2 text-red-700 bg-red-50 border border-red-200 rounded p-1"><span className="font-medium">Error:</span> {r.error}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
