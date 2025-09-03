// PROFESSIONAL CODING INTERVIEW - OPTIMIZED UI DESIGN
import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import GeminiService from '../services/GeminiService';
import { localExecutionService } from '../services/LocalExecutionService';
import { validateJudge0Setup, getJudge0Headers, getJudge0Urls, testJudge0Connection } from '../utils/judge0Config';

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
  // Resizable horizontal split for editor/console
  const [editorHeight, setEditorHeight] = useState(65); // percent height for editor
  const isDraggingY = useRef(false);

  useEffect(() => {
    const handleMouseMoveY = (e) => {
      if (!isDraggingY.current) return;
      const y = e.clientY;
      const container = document.getElementById('editor-console-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let percent = Math.max(20, Math.min(80, ((y - rect.top) / rect.height) * 100));
      setEditorHeight(percent);
    };
    const handleMouseUpY = () => {
      isDraggingY.current = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMouseMoveY);
    window.addEventListener('mouseup', handleMouseUpY);
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveY);
      window.removeEventListener('mouseup', handleMouseUpY);
    };
  }, []);
  // Resizable split state
  const [split, setSplit] = useState(50); // percent width for problem panel
  const isDragging = useRef(false);

  // Mouse event handlers for drag
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const x = e.clientX;
      const screenWidth = window.innerWidth;
      let percent = Math.max(20, Math.min(80, (x / screenWidth) * 100));
      setSplit(percent);
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  const location = useLocation();

  // Get selected topic from navigation state
  const selectedTopic = location.state?.subject || 'algorithms';

  // Topic hierarchy state
  const [selectedMainTopic, setSelectedMainTopic] = useState(null);
  const [showSubTopics, setShowSubTopics] = useState(false);
  const [configuredTopic, setConfiguredTopic] = useState(null);

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
      console.log('CompilerPage topic selection debug:', {
        selectedTopic,
        mainCategory,
        defaultSubtopic: getCodingDefaultSubtopic(selectedTopic)
      });

      if (mainCategory) {
        setSelectedMainTopic(mainCategory);
        setShowSubTopics(true);
        // Auto-select a default subtopic based on the main topic
        const defaultSubtopic = getCodingDefaultSubtopic(selectedTopic);
        if (defaultSubtopic) {
          setProblemConfig(prev => ({ ...prev, topic: defaultSubtopic }));
          setConfiguredTopic(defaultSubtopic);
          console.log('Set configuredTopic to:', defaultSubtopic, 'which displays as:', getTopicDisplayLabel(defaultSubtopic));
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

  // Get display label for a topic value
  const getTopicDisplayLabel = (topicValue) => {
    if (!topicValue) return '';

    // Search through all subtopics to find the matching label
    for (const [mainTopic, subtopics] of Object.entries(codingSubTopics)) {
      const foundSubtopic = subtopics.find(subtopic => subtopic.value === topicValue);
      if (foundSubtopic) {
        return foundSubtopic.label;
      }
    }

    // If not found in subtopics, check main topics
    const mainTopic = mainCodingTopics.find(topic => topic.value === topicValue);
    if (mainTopic) {
      return mainTopic.label;
    }

    // Return the original value if no match found
    return topicValue;
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

  const [code, setCode] = useState(languages[3].template); // Default to Python
  const [language, setLanguage] = useState(languages[3]);
  const [problemDetails, setProblemDetails] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true); // Start with loading to auto-generate problem
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showProblemPanel, setShowProblemPanel] = useState(true);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [testResults, setTestResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [consoleTab, setConsoleTab] = useState('output');
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const editorRef = useRef(null);

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

  // Reset request count every 5 minutes to allow fresh rate limiting
  useEffect(() => {
    const resetInterval = setInterval(() => {
      console.log('Resetting request count for rate limiting...');
      setRequestCount(0);
    }, 5 * 60 * 1000); // Reset every 5 minutes

    return () => clearInterval(resetInterval);
  }, []);

  // Dismiss all toasts when problem is displayed
  useEffect(() => {
    if (problemDetails && !loadingProblem) {
      toast.dismiss(); // Clear all toasts when problem interface appears
    }
  }, [problemDetails, loadingProblem]);

  // Auto-generate problem when component mounts
  useEffect(() => {
    // Generate a problem on initial load
    generateNewProblem();
  }, []); // Empty dependency array means this runs once on mount

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
      } else {
        setProblemDetails(response.problem);
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
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(newLanguage.template);
    setProblemConfig(prev => ({ ...prev, language: newLanguage.name }));
  };

  // Enhanced code execution with Judge0
  const executeCodeWithJudge0 = async (sourceCode, languageId, input = "", timeout = 5) => {
    const judge0Urls = getJudge0Urls();
    const headers = getJudge0Headers();

    try {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      const minInterval = 2000;

      if (timeSinceLastRequest < minInterval) {
        const waitTime = minInterval - timeSinceLastRequest;
        console.log(`Rate limiting: waiting ${waitTime}ms before next request...`);
        setOutput(`⏳ Rate limiting active... waiting ${Math.ceil(waitTime / 1000)} seconds before execution...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      setLastRequestTime(Date.now());
      setRequestCount(prev => prev + 1);

      if (requestCount > 10) {
        console.warn('High request count detected, adding extra delay...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      if (!sourceCode || !sourceCode.trim()) {
        throw new Error('Source code cannot be empty');
      }

      const safeBtoa = (str) => {
        try {
          return btoa(str || '');
        } catch (e) {
          console.warn('Failed to encode to base64:', str);
          return btoa(unescape(encodeURIComponent(str || '')));
        }
      };

      const submitWithRetry = async (payload, maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`Attempting submission (${attempt}/${maxRetries})...`);

            const response = await axios.post(
              judge0Urls.submit,
              payload,
              {
                headers,
                timeout: 10000
              }
            );
            return response;
          } catch (error) {
            if (error.response && error.response.status === 429) {
              console.log(`Rate limit hit (429) on attempt ${attempt}`);
              if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              } else {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
              }
            }
            throw error;
          }
        }
      };

      let submitResponse;
      try {
        const plainPayload = {
          source_code: sourceCode,
          language_id: languageId,
          stdin: input || "",
          cpu_time_limit: timeout,
          memory_limit: 128000,
        };
        console.log('Trying Judge0 submission with plain text...');
        submitResponse = await submitWithRetry(plainPayload);
      } catch (plainError) {
        console.log('Plain text failed, trying base64...', plainError.message);
        const base64Payload = {
          source_code: safeBtoa(sourceCode),
          language_id: languageId,
          stdin: safeBtoa(input || ""),
          cpu_time_limit: timeout,
          memory_limit: 128000,
        };
        submitResponse = await submitWithRetry(base64Payload);
      }

      const token = submitResponse.data.token;
      console.log('Judge0 submission successful, token:', token);
      console.log('Submit response:', submitResponse.data);

      if (!token) {
        throw new Error('No token received from Judge0');
      }

      let attempts = 0;
      const maxAttempts = 20;
      const pollInterval = 1000;

      const pollResult = async () => {
        attempts++;
        const resultResponse = await axios.get(
          judge0Urls.getResult(token),
          { headers, timeout: 5000 }
        );
        const result = resultResponse.data;
        if (result.status.id <= 2) {
          if (attempts >= maxAttempts) {
            throw new Error('Execution timeout - taking too long to process');
          }
          const delay = Math.min(pollInterval * Math.pow(1.5, attempts), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return await pollResult();
        }

        const safeAtob = (str) => {
          if (!str) return '';
          if (typeof str === 'string' && !str.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
            return str;
          }
          if (Array.isArray(str)) {
            return str.join('\n');
          }
          if (typeof str === 'object') {
            return JSON.stringify(str, null, 2);
          }
          try {
            return atob(str);
          } catch (e) {
            return str;
          }
        };

        const finalOutput = safeAtob(result.stdout);
        return {
          success: result.status.id === 3,
          output: finalOutput,
          error: safeAtob(result.stderr),
          status: result.status.description,
          statusId: result.status.id,
          time: result.time,
          memory: result.memory,
          compileOutput: safeAtob(result.compile_output)
        };
      };

      return await pollResult();
    } catch (error) {
      console.error('Judge0 execution error:', error);
      throw new Error(`Execution failed: ${error.message}`);
    }
  };

  const executeCodeHybrid = async (sourceCode, languageId, input = "") => {
    try {
      console.log('🎯 Attempting Judge0 execution...');
      const result = await executeCodeWithJudge0(sourceCode, languageId, input);
      result.executionMethod = 'judge0';
      return result;
    } catch (error) {
      console.log('⚠️ Judge0 failed:', error.message);
      if (error.message.includes('Rate limit exceeded') || error.message.includes('429')) {
        const languageName = language.name.toLowerCase();
        if (localExecutionService.isLanguageSupported(languageName)) {
          console.log('🔄 Falling back to local execution...');
          try {
            const localResult = await localExecutionService.executeCode(languageName, sourceCode, input);
            return {
              success: localResult.success,
              output: localResult.output,
              error: localResult.error,
              status: localResult.status,
              executionMethod: 'local',
              time: null,
              memory: null,
              compileOutput: null
            };
          } catch (localError) {
            throw new Error(`Both Judge0 and local execution failed. Judge0: ${error.message}, Local: ${localError.message}`);
          }
        } else {
          throw new Error(`Rate limit exceeded and local execution not available for ${language.label}. ${error.message}`);
        }
      } else {
        throw error;
      }
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    const judge0Status = validateJudge0Setup();
    if (!judge0Status.valid) {
      toast.error('Judge0 API key not configured');
      setOutput(judge0Status.message);
      return;
    }

    setIsRunning(true);
    setOutput('🚀 Submitting code to Judge0...\n⏳ Waiting for execution...');

    try {
      let testInput = "";
      let expectedOutput = "";
      let hasTestCase = false;

      if (problemDetails && problemDetails.testCases && problemDetails.testCases.length > 0) {
        const firstTestCase = problemDetails.testCases[0];
        testInput = firstTestCase.input || "";
        expectedOutput = firstTestCase.output || "";
        hasTestCase = true;
      }

      const result = await executeCodeHybrid(code, language.id, testInput);
      let outputText = '';

      if (result.success) {
        let isCorrect = false;
        if (hasTestCase && result.output) {
          const userOutput = result.output.trim();
          const expected = expectedOutput.trim();
          isCorrect = userOutput === expected;
        }

        if (hasTestCase) {
          if (isCorrect) {
            outputText = `🎉 CORRECT ANSWER!\n`;
            outputText += `${'='.repeat(40)}\n\n`;
            outputText += `✅ Your solution produces the correct output!\n\n`;
          } else {
            outputText = `❌ WRONG ANSWER\n`;
            outputText += `${'='.repeat(40)}\n\n`;
            outputText += `❌ Your solution produces incorrect output.\n\n`;
          }
          outputText += `🔍 OUTPUT COMPARISON:\n`;
          outputText += `${'-'.repeat(30)}\n`;
          outputText += `📥 Input:\n${testInput || '(no input)'}\n\n`;
          outputText += `✅ Expected Output:\n${expectedOutput}\n\n`;
          outputText += `📤 Your Output:\n${result.output || '(no output)'}\n`;
          outputText += `${'-'.repeat(30)}\n\n`;

          if (!isCorrect) {
            outputText += `💡 DEBUGGING TIPS:\n`;
            outputText += `${'-'.repeat(20)}\n`;
            outputText += `• Check for extra spaces or newlines\n`;
            outputText += `• Verify your algorithm logic\n`;
            outputText += `• Test with the provided examples\n`;
            outputText += `• Make sure output format matches exactly\n\n`;
          }
        } else {
          outputText = `✅ EXECUTION SUCCESSFUL\n`;
          outputText += `${'='.repeat(40)}\n\n`;
          outputText += `ℹ️ No test cases available for validation.\n`;
          outputText += `Code executed successfully, check output below.\n\n`;

          if (result.output && result.output.trim()) {
            outputText += `📤 PROGRAM OUTPUT:\n`;
            outputText += `${'-'.repeat(20)}\n`;
            outputText += `${result.output}\n`;
            outputText += `${'-'.repeat(20)}\n\n`;
          } else {
            outputText += `📤 PROGRAM OUTPUT: (no output)\n\n`;
          }
        }

        if (result.time || result.memory) {
          outputText += `📊 PERFORMANCE METRICS:\n`;
          outputText += `${'-'.repeat(20)}\n`;
          if (result.time) {
            outputText += `⏱️  Execution Time: ${result.time}s\n`;
          }
          if (result.memory) {
            outputText += `💾 Memory Used: ${result.memory} KB\n`;
          }
          outputText += `${'-'.repeat(20)}\n\n`;
        }
        outputText += `🔧 EXECUTION INFO:\n`;
        outputText += `${'-'.repeat(20)}\n`;
        if (result.executionMethod === 'local') {
          outputText += `🏠 Executed locally (Browser-based Python)\n`;
          outputText += `ℹ️  Judge0 was rate-limited, used local fallback\n`;
        } else {
          outputText += `☁️  Executed via Judge0 API\n`;
        }
        outputText += `${'-'.repeat(20)}`;
      } else {
        outputText = `❌ EXECUTION FAILED\n`;
        outputText += `${'='.repeat(40)}\n\n`;
        outputText += `📋 Status: ${result.status}\n\n`;
        if (result.compileOutput && result.compileOutput.trim()) {
          outputText += `🔧 COMPILATION ERROR:\n`;
          outputText += `${'-'.repeat(20)}\n`;
          outputText += `${result.compileOutput}\n`;
          outputText += `${'-'.repeat(20)}\n\n`;
        }
        if (result.error && result.error.trim()) {
          outputText += `🐛 RUNTIME ERROR:\n`;
          outputText += `${'-'.repeat(20)}\n`;
          outputText += `${result.error}\n`;
          outputText += `${'-'.repeat(20)}\n\n`;
        }
        if (result.output && result.output.trim()) {
          outputText += `📤 PARTIAL OUTPUT:\n`;
          outputText += `${'-'.repeat(20)}\n`;
          outputText += `${result.output}\n`;
          outputText += `${'-'.repeat(20)}`;
        }
      }
      setOutput(outputText);
    } catch (error) {
      console.error('Code execution error:', error);
      let errorMessage = '❌ Execution Error!\n\n';
      if (error.message.includes('Rate limit exceeded') || error.message.includes('429')) {
        errorMessage += '🚦 RATE LIMIT EXCEEDED\n';
        errorMessage += '═'.repeat(40) + '\n\n';
        errorMessage += 'You\'ve made too many requests to Judge0 in a short time.\n\n';
        errorMessage += '✅ What you can do:\n';
        errorMessage += '• Wait 30-60 seconds before trying again\n';
        errorMessage += '• Consider upgrading to Judge0 Pro for higher limits\n';
        errorMessage += '• Check the JUDGE0_SETUP.md for free alternatives\n\n';
        errorMessage += '💡 Tip: Free Judge0 CE has a limit of ~50 requests per day\n';
        errorMessage += 'and rate limiting to prevent abuse.\n\n';
      } else if (error.message.includes('atob') || error.message.includes('decode')) {
        errorMessage += 'Failed to decode response from Judge0. This might be due to:\n';
        errorMessage += '• Network connectivity issues\n';
        errorMessage += '• Invalid API response format\n';
        errorMessage += '• Judge0 service unavailable\n\n';
        errorMessage += 'Please check:\n';
        errorMessage += '1. Internet connection\n';
        errorMessage += '2. Judge0 API key configuration\n';
        errorMessage += '3. Code syntax\n\n';
      } else if (error.message.includes('timeout')) {
        errorMessage += 'Request timed out. This might be due to:\n';
        errorMessage += '• Code taking too long to execute\n';
        errorMessage += '• Network latency issues\n';
        errorMessage += '• Judge0 server overload\n\n';
      } else if (error.message.includes('token')) {
        errorMessage += 'Failed to get execution token from Judge0.\n';
        errorMessage += 'Please check your API key configuration.\n\n';
      } else {
        errorMessage += `${error.message}\n\n`;
        errorMessage += 'Please check:\n';
        errorMessage += '1. Internet connection\n';
        errorMessage += '2. Judge0 API key configuration\n';
        errorMessage += '3. Code syntax\n\n';
      }
      errorMessage += `Technical Details: ${error.message}`;
      setOutput(errorMessage);
      toast.error('Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(language.template);
    setOutput('');
    setTestResults(null);
  };

  const submitCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    if (!problemDetails || !problemDetails.testCases) {
      toast.error('No test cases available for this problem!');
      return;
    }

    const judge0Status = validateJudge0Setup();
    if (!judge0Status.valid) {
      toast.error('Judge0 API key not configured');
      setTestResults({
        passed: 0,
        total: 1,
        details: [{
          passed: false,
          input: 'Configuration Error',
          expected: '',
          actual: judge0Status.message,
          error: 'Please check JUDGE0_SETUP.md for setup instructions'
        }]
      });
      return;
    }

    setIsSubmitting(true);
    setTestResults({ passed: 0, total: 0, details: [] });

    try {
      toast.info('🧪 Running test cases...', { duration: 3000 });
      const testCases = problemDetails.testCases;
      const results = [];
      let passedCount = 0;
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        setTestResults({
          passed: passedCount,
          total: testCases.length,
          details: results,
          currentTest: i + 1
        });
        try {
          const result = await executeCodeHybrid(code, language.id, testCase.input);
          const actualOutput = result.output ? result.output.trim() : '';
          const expectedOutput = testCase.output.trim();
          const passed = actualOutput === expectedOutput;
          if (passed) passedCount++;
          results.push({
            testCase: i + 1,
            passed: passed,
            input: testCase.input,
            expected: expectedOutput,
            actual: actualOutput,
            executionTime: result.time,
            memory: result.memory,
            status: result.status,
            executionMethod: result.executionMethod,
            error: result.success ? null : (result.error || result.compileOutput)
          });
        } catch (error) {
          results.push({
            testCase: i + 1,
            passed: false,
            input: testCase.input,
            expected: testCase.output,
            actual: '',
            error: error.message,
            status: 'Execution Error'
          });
        }
        if (i < testCases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const finalResults = {
        passed: passedCount,
        total: testCases.length,
        details: results,
        accuracy: Math.round((passedCount / testCases.length) * 100)
      };

      setTestResults(finalResults);
      const newSubmission = {
        timestamp: new Date().toLocaleString(),
        status: passedCount === testCases.length ? 'Accepted' : 'Wrong Answer',
        passedTests: passedCount,
        totalTests: testCases.length,
        accuracy: finalResults.accuracy,
        language: language.label,
        executionTime: `${results.reduce((sum, r) => sum + (parseFloat(r.executionTime) || 0), 0).toFixed(3)}s`,
        memory: results.length > 0 && results[0].memory ? `${results[0].memory} KB` : 'N/A',
        code: code,
        problemTitle: problemDetails?.title || 'Unknown Problem'
      };

      setSubmissions(prev => [newSubmission, ...prev]);
      if (passedCount === testCases.length) {
        setActiveTab('submissions');
      }

      let consoleOutput = `🧪 TEST EXECUTION COMPLETED\n`;
      consoleOutput += `${'='.repeat(50)}\n\n`;
      consoleOutput += `📊 RESULTS SUMMARY:\n`;
      consoleOutput += `${'-'.repeat(25)}\n`;
      consoleOutput += `✅ Passed: ${passedCount}/${testCases.length} test cases\n`;
      consoleOutput += `📈 Accuracy: ${finalResults.accuracy}%\n`;
      consoleOutput += `⏱️  Total Execution Time: ${results.reduce((sum, r) => sum + (parseFloat(r.executionTime) || 0), 0).toFixed(3)}s\n\n`;

      if (passedCount === testCases.length) {
        consoleOutput += `🎉 CONGRATULATIONS! All test cases passed!\n`;
        consoleOutput += `Your solution is correct and ready for submission.\n\n`;
      } else {
        consoleOutput += `⚠️  ${testCases.length - passedCount} test case(s) failed.\n`;
        consoleOutput += `Review the expected output below to fix your solution.\n\n`;
      }

      consoleOutput += `📋 DETAILED RESULTS:\n`;
      consoleOutput += `${'-'.repeat(25)}\n`;
      results.forEach((result, index) => {
        consoleOutput += `Test ${index + 1}: ${result.passed ? '✅ PASS' : '❌ FAIL'}`;
        if (result.executionTime) {
          consoleOutput += ` (${result.executionTime}s)`;
        }
        consoleOutput += `\n`;
      });
      setOutput(consoleOutput);
      if (passedCount === testCases.length) {
        toast.success(`🎉 All ${testCases.length} test cases passed!`);
      } else {
        toast.warning(`${passedCount}/${testCases.length} test cases passed`);
      }
    } catch (error) {
      console.error('Submit code error:', error);
      let errorOutput = `❌ TEST EXECUTION FAILED\n`;
      errorOutput += `${'='.repeat(50)}\n\n`;
      errorOutput += `🚨 ERROR DETAILS:\n`;
      errorOutput += `${'-'.repeat(20)}\n`;
      errorOutput += `${error.message}\n\n`;
      errorOutput += `💡 TROUBLESHOOTING TIPS:\n`;
      errorOutput += `${'-'.repeat(20)}\n`;
      errorOutput += `• Check your internet connection\n`;
      errorOutput += `• Verify your code syntax\n`;
      errorOutput += `• Ensure Judge0 API is configured\n`;
      errorOutput += `• Try running a simple test first\n\n`;
      errorOutput += `🔧 If the problem persists, contact support.`;
      setOutput(errorOutput);
      toast.error('Failed to run test cases');
      setTestResults({
        passed: 0,
        total: problemDetails.testCases.length,
        details: [{
          passed: false,
          error: error.message,
          status: 'System Error'
        }]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // --- Perfect Adjust Bar & Responsive Console Patch ---
  // 1. Ensure the vertical adjust bar (between problem and editor) is styled and works smoothly
  // 2. Ensure the horizontal adjust bar (between editor and console) is styled and works smoothly
  // 3. When dragging the horizontal bar, the console and editor heights adjust responsively
  // 4. Use gradients, rounded corners, and shadows for a professional look

  // Vertical Adjust Bar Example:
  // <div
  //   style={{ left: `calc(${split}% - 6px)` }}
  //   className="absolute top-0 bottom-0 z-30 w-3 cursor-col-resize bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 shadow-lg hover:from-blue-700 hover:to-pink-700 transition-all duration-200 rounded-r-xl border-2 border-white"
  //   onMouseDown={() => {
  //     isDragging.current = true;
  //     document.body.style.cursor = 'col-resize';
  //   }}
  // />

  // Horizontal Adjust Bar Example:
  // <div
  //   style={{ top: `calc(${editorHeight}% - 6px)` }}
  //   className="absolute left-0 right-0 z-30 h-3 cursor-row-resize bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-lg hover:from-green-700 hover:to-purple-700 transition-all duration-200 rounded-b-xl border-2 border-white"
  //   onMouseDown={() => {
  //     isDraggingY.current = true;
  //     document.body.style.cursor = 'row-resize';
  //   }}
  // />

  // Editor and Console Responsive Heights:
  // <div className="flex-1 min-h-0">
  //   <div style={{ height: `${editorHeight}%` }} className="w-full rounded-lg shadow-lg border border-gray-800 overflow-hidden">
  //     {/* Editor Component */}
  //   </div>
  //   {/* Horizontal Adjust Bar (see above) */}
  //   <div
  //     style={{ top: `calc(${editorHeight}% - 6px)` }}
  //     className="absolute left-0 right-0 z-30 h-3 cursor-row-resize bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-lg hover:from-green-700 hover:to-purple-700 transition-all duration-200 rounded-b-xl border-2 border-white"
  //     onMouseDown={() => {
  //       isDraggingY.current = true;
  //       document.body.style.cursor = 'row-resize';
  //     }}
  //   />
  // </div>
  // <div style={{ height: `${100 - editorHeight}%` }} className="bg-gray-800 border-t border-gray-700 p-3 sticky bottom-0 z-10 shadow-lg overflow-auto rounded-b-xl">
  //   {/* Console Content */}
  // </div>

  if (!problemDetails && !loadingProblem) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="min-h-screen py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
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

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Configure Your Coding Challenge</h2>

              <div className="grid lg:grid-cols-3 gap-6">
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
                            setSelectedMainTopic(topic.value);
                            setShowSubTopics(true);
                          } else {
                            setProblemConfig(prev => ({ ...prev, topic: topic.value }));
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

                  {selectedMainTopic && !showSubTopics && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <span className="text-lg">📂</span>
                        <span className="font-medium">Category Selected: {mainCodingTopics.find(t => t.value === selectedMainTopic)?.label || selectedMainTopic}</span>
                      </div>
                    </div>
                  )}

                  {showSubTopics && configuredTopic && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <span className="text-lg">✅</span>
                        <span className="font-medium">Selected: {getTopicDisplayLabel(configuredTopic)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">Difficulty Level</label>
                    <div className="space-y-2">
                      {difficulties.map((diff) => (
                        <motion.button
                          key={diff.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setProblemConfig(prev => ({ ...prev, difficulty: diff.value }))}
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

                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">Programming Language</label>
                  <div className="space-y-2">
                    {languages.map((lang) => (
                      <motion.button
                        key={lang.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setProblemConfig(prev => ({ ...prev, language: lang.name }));
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

  // Loading Screen
  if (loadingProblem) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center z-50">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-lg mx-auto px-6"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6 font-mono text-green-400"
          >
            {'{}'}
          </motion.div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-8"
          >
            <div className="w-20 h-20 border-4 border-green-400 border-t-transparent rounded-full"></div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Compiling Challenge...
          </motion.h2>

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

  // Main Coding Interface
  return (
    <div className="h-screen bg-gray-900 flex flex-col max-h-screen overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 border-b border-gray-700 px-6 py-4 flex-shrink-0 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-white tracking-wide flex items-center gap-3">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-lg font-bold shadow">💻</span>
            AceMyInterview - Coding Challenge
          </h1>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProblemPanel(!showProblemPanel)}
              className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${showProblemPanel
                ? 'bg-green-700 hover:bg-green-800 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-gray-200'
                }`}
            >
              {showProblemPanel ? '📖 Hide Problem' : '📖 Show Problem'}
            </motion.button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Language:</span>
              <select
                value={language.id}
                onChange={(e) => {
                  const newLang = languages.find(l => l.id === parseInt(e.target.value));
                  if (newLang) {
                    setLanguage(newLang);
                    setCode(newLang.template);
                    toast.success(`Switched to ${newLang.label}`);
                  }
                }}
                className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 hover:bg-gray-600 transition-all duration-200"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.icon} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
                className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all duration-200 text-sm"
                title={`Switch to ${editorTheme === 'vs-dark' ? 'Light' : 'Dark'} theme`}
              >
                {editorTheme === 'vs-dark' ? '☀️' : '🌙'}
              </motion.button>

              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="bg-gray-700 text-white rounded-lg px-2 py-1 text-sm border border-gray-600 hover:bg-gray-600 transition-all duration-200"
                title="Font Size"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden w-full relative">
        <AnimatePresence>
          {showProblemPanel && (
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="min-w-0 border-r border-gray-200 overflow-hidden flex flex-col"
              style={{
                width: `${split}%`,
                boxShadow: '0 2px 16px 0 rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' // Soft white to light blue
              }}
            >
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === 'description'
                      ? 'text-blue-600 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                      }`}
                  >
                    📚 Description
                  </button>
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === 'submissions'
                      ? 'text-blue-600 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 border-transparent'
                      }`}
                  >
                    📊 Submissions
                    {submissions.length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                        {submissions.length}
                      </span>
                    )}
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateNewProblem}
                  disabled={loadingProblem}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-all duration-200 disabled:opacity-50"
                >
                  🔄 New
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-50 p-6" style={{ boxShadow: '0 1px 8px 0 rgba(0,0,0,0.04)' }}>
                {problemDetails && (
                  <div className="space-y-6">
                    {activeTab === 'description' && (
                      <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                          <div className="flex items-center space-x-3 mb-4">
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                              ⭐ MEDIUM
                            </span>
                            <span className="text-gray-500 text-sm">📚 Algorithms</span>
                            <span className="text-gray-500 text-sm">🏢 Top Companies</span>
                          </div>
                          <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {problemDetails.title}
                          </h1>
                          <div className="text-sm text-gray-600 flex items-center space-x-4">
                            <span>🎯 Problem ID: #{Math.floor(Math.random() * 1000) + 1}</span>
                            <span>👥 Solved by 2.5k+ developers</span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">📝</span>
                            Problem Description
                          </h2>
                          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                            <p className="text-gray-700 leading-relaxed">
                              {typeof problemDetails.description === 'object'
                                ? JSON.stringify(problemDetails.description, null, 2)
                                : (problemDetails.description || 'No description available')}
                            </p>
                          </div>
                        </div>

                        {problemDetails.testCases && problemDetails.testCases.length > 0 && (
                          <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                              <span className="mr-2">📋</span>
                              Examples & Test Cases
                            </h2>
                            {problemDetails.testCases.slice(0, 3).map((testCase, index) => (
                              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-3">
                                    Example {index + 1}
                                  </span>
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                      <span className="mr-1">📥</span> Input:
                                    </div>
                                    <div className="bg-gray-900 text-green-400 rounded-lg p-3 border">
                                      <code className="text-sm font-mono whitespace-pre-wrap">
                                        {typeof testCase.input === 'object'
                                          ? JSON.stringify(testCase.input, null, 2)
                                          : (testCase.input || 'No input')}
                                      </code>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                      <span className="mr-1">📤</span> Output:
                                    </div>
                                    <div className="bg-gray-900 text-blue-400 rounded-lg p-3 border">
                                      <code className="text-sm font-mono whitespace-pre-wrap">
                                        {typeof testCase.output === 'object'
                                          ? JSON.stringify(testCase.output, null, 2)
                                          : (testCase.output || 'No output')}
                                      </code>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="mr-2">⚡</span>
                            Constraints & Limits
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li className="flex items-center">
                                <span className="text-blue-500 mr-2">•</span>
                                Array length: 1 ≤ n ≤ 10⁴
                              </li>
                              <li className="flex items-center">
                                <span className="text-blue-500 mr-2">•</span>
                                Elements: -10⁹ ≤ nums[i] ≤ 10⁹
                              </li>
                            </ul>
                            <ul className="text-sm text-gray-700 space-y-2">
                              <li className="flex items-center">
                                <span className="text-green-500 mr-2">⏱️</span>
                                Time limit: 1 second
                              </li>
                              <li className="flex items-center">
                                <span className="text-purple-500 mr-2">💾</span>
                                Memory limit: 256 MB
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'submissions' && (
                      <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <span className="mr-2">📊</span>
                            Your Submissions
                          </h3>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {submissions.length === 0 ? (
                          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <div className="text-8xl mb-6">📋</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">No Submissions Yet</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                              Ready to test your coding skills? Click <strong>"Submit All Tests"</strong> to run your solution.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {submissions.map((submission, index) => (
                              <div
                                key={index}
                                className={`border-2 rounded-xl p-5 transition-all duration-300 ${submission.status === 'Accepted' ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' : 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
                                  }`}
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center space-x-4">
                                    <div className={`text-2xl ${submission.status === 'Accepted' ? '🎉' : '⚠️'
                                      }`}></div>
                                    <div>
                                      <div className={`font-bold text-base ${submission.status === 'Accepted' ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                        {submission.status}
                                        {submission.status === 'Accepted' && <span className="ml-2">🏆</span>}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        📅 {submission.timestamp}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${submission.status === 'Accepted' ? 'text-green-700' : 'text-red-700'
                                      }`}>
                                      {submission.passedTests}/{submission.totalTests}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      🐍 {submission.language} • ⚡ {submission.executionTime}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-gray-900 rounded-lg p-4 border">
                                  <div className="flex items-center justify-between mb-2">

                                    <span className="text-gray-400 text-xs font-medium">💻 CODE PREVIEW</span>
                                    <span className="text-gray-400 text-xs">{submission.code.length} chars</span>
                                  </div>
                                  <pre className="text-green-400 text-xs font-mono leading-relaxed overflow-hidden">
                                    {submission.code.length > 200
                                      ? submission.code.substring(0, 200) + '...'
                                      : submission.code
                                    }
                                  </pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vertical Resizer Bar */}
        {showProblemPanel && (
          <div
            style={{ left: `calc(${split}% - 6px)` }}
            className="absolute top-0 bottom-0 z-30 w-3 cursor-col-resize bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 shadow-lg hover:from-blue-700 hover:to-pink-700 transition-all duration-200 rounded-r-xl border-2 border-white"
            onMouseDown={() => {
              isDragging.current = true;
              document.body.style.cursor = 'col-resize';
            }}
          />
        )}
        
        {/* Code Editor & Output */}
        <motion.div
          layout
          className="flex-1 min-w-0 flex flex-col overflow-hidden"
          style={{
            width: showProblemPanel ? `calc(${100 - split}%)` : '100%',
            background: 'linear-gradient(135deg, #312e81 0%, #1e293b 100%)' // Indigo to dark slate
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div id="editor-console-container" className="flex-1 flex flex-col h-full w-full relative">
            <div style={{ height: `${editorHeight}%` }} className="w-full rounded-lg shadow-lg border border-gray-800 overflow-hidden">
              <Editor
                height="100%"
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
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  padding: { top: 10, bottom: 10 },
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            </div>
            
            {/* Horizontal Resizer Bar */}
            <div
              style={{ top: `calc(${editorHeight}% - 6px)` }}
              className="absolute left-0 right-0 z-30 h-3 cursor-row-resize bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-lg hover:from-green-700 hover:to-purple-700 transition-all duration-200 rounded-b-xl border-2 border-white"
              onMouseDown={() => {
                isDraggingY.current = true;
                document.body.style.cursor = 'row-resize';
              }}
            />

            <div style={{ height: `${100 - editorHeight}%` }} className="bg-gray-800 border-t border-gray-700 p-3 sticky bottom-0 z-10 shadow-lg overflow-auto rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={runCode}
                    disabled={isRunning}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <span>▶️</span>
                        <span>{problemDetails ? 'Test Sample' : 'Run Code'}</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitCode}
                    disabled={isSubmitting || !problemDetails}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <span>🧪</span>
                        <span>Submit All Tests</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetCode}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    🔄 Reset
                  </motion.button>
                </div>

                <div className="text-gray-400 text-sm">
                  {problemDetails
                    ? 'Press Ctrl+Enter to test sample • Ctrl+Shift+Enter to submit all tests'
                    : 'Press Ctrl+Enter to run • Ctrl+Shift+Enter to submit'
                  }
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border-t border-gray-700 p-4 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>📟</span> Console
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setConsoleTab('output')}
                      className={`px-3 py-1 text-xs rounded transition-all duration-200 ${consoleTab === 'output'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Output
                    </button>
                    <button
                      onClick={() => setConsoleTab('tests')}
                      className={`px-3 py-1 text-xs rounded transition-all duration-200 ${consoleTab === 'tests'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Test Results
                      {testResults && (
                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${testResults.passed === testResults.total ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                          {testResults.passed}/{testResults.total}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setConsoleTab('debug')}
                      className={`px-3 py-1 text-xs rounded transition-all duration-200 ${consoleTab === 'debug'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Debug
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOutput('')}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-all duration-200"
                  >
                    Clear
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const textarea = document.createElement('textarea');
                      textarea.value = output;
                      document.body.appendChild(textarea);
                      textarea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textarea);
                      toast.success('Output copied to clipboard!');
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-all duration-200"
                  >
                    Copy
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 bg-black rounded-lg border border-gray-700 overflow-hidden flex flex-col">
                {consoleTab === 'output' && (
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="text-blue-400 text-xs uppercase font-semibold mb-2 flex items-center gap-2">
                      <span>🖥️</span> Your Program Output:
                    </div>
                    <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                      {output ? output : (
                        <span className="text-gray-500 italic">
                          {problemDetails
                            ? '💡 Click "Test Sample" to validate your solution against the first test case...'
                            : '💡 Click "Run Code" to execute your program and see output here...'
                          }
                        </span>
                      )}
                    </pre>
                  </div>
                )}

                {consoleTab === 'tests' && (
                  <div className="flex-1 p-4 overflow-y-auto">
                    {testResults && testResults.details && testResults.details.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-yellow-400 text-xs uppercase font-semibold mb-3 flex items-center gap-2">
                          <span>🎯</span> Test Results ({testResults.passed}/{testResults.total} passed):
                        </div>
                        {testResults.details.map((result, index) => (
                          <div key={index} className={`p-3 rounded border-l-4 ${result.passed ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs text-gray-400">
                                Test Case {result.testCase}: {result.passed ? '✅ PASSED' : '❌ FAILED'}
                              </div>
                              {result.executionTime && (
                                <div className="text-xs text-gray-500">
                                  {result.executionTime}s
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-yellow-300">Expected:</span>
                                <pre className="text-yellow-100 mt-1 font-mono whitespace-pre-wrap bg-black/30 p-2 rounded">
                                  {typeof result.expected === 'object'
                                    ? JSON.stringify(result.expected, null, 2)
                                    : (result.expected || '(no output expected)')}
                                </pre>
                              </div>
                              <div>
                                <span className={result.passed ? 'text-green-300' : 'text-red-300'}>
                                  Your Output:
                                </span>
                                <pre className={`mt-1 font-mono whitespace-pre-wrap bg-black/30 p-2 rounded ${result.passed ? 'text-green-100' : 'text-red-100'
                                  }`}>
                                  {typeof result.actual === 'object'
                                    ? JSON.stringify(result.actual, null, 2)
                                    : (result.actual || '(no output)')}
                                </pre>
                              </div>
                            </div>

                            {result.error && (
                              <div className="mt-2 p-2 bg-red-800/30 rounded">
                                <span className="text-red-300 text-xs">Error:</span>
                                <pre className="text-red-100 text-xs mt-1 font-mono whitespace-pre-wrap">
                                  {result.error}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">🧪</div>
                        <div className="text-gray-400 text-sm">
                          No test results yet. Click "Submit All Tests" to see detailed test results here.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {consoleTab === 'debug' && (
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="text-purple-400 text-xs uppercase font-semibold mb-2 flex items-center gap-2">
                      <span>🐛</span> Debug Information:
                    </div>
                    <div className="space-y-2 text-xs text-gray-300">
                      <div>Language: <span className="text-blue-400">{language.label}</span></div>
                      <div>Language ID: <span className="text-blue-400">{language.id}</span></div>
                      <div>Editor Theme: <span className="text-blue-400">{editorTheme}</span></div>
                      <div>Font Size: <span className="text-blue-400">{fontSize}px</span></div>
                      <div>Problem Loaded: <span className="text-blue-400">{problemDetails ? 'Yes' : 'No'}</span></div>
                      {problemDetails && (
                        <>
                          <div>Test Cases: <span className="text-blue-400">{problemDetails.testCases?.length || 0}</span></div>
                          <div>Problem Title: <span className="text-blue-400">{problemDetails.title}</span></div>
                        </>
                      )}
                      <div>Total Submissions: <span className="text-blue-400">{submissions.length}</span></div>
                      <div className="pt-2 border-t border-gray-700">
                        <div className="text-yellow-400 mb-1">Keyboard Shortcuts:</div>
                        <div>Ctrl+Enter: Test Sample</div>
                        <div>Ctrl+Shift+Enter: Submit All Tests</div>
                        <div>Ctrl+/: Toggle Comment</div>
                        <div>Ctrl+Z: Undo</div>
                        <div>Ctrl+Y: Redo</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Detailed Submission Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`px-6 py-4 border-b ${selectedSubmission.status === 'Accepted'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl ${selectedSubmission.status === 'Accepted' ? '✅' : '❌'
                      }`}></span>
                    <div>
                      <h2 className={`text-xl font-bold ${selectedSubmission.status === 'Accepted' ? 'text-green-800' : 'text-red-800'
                        }`}>
                        {selectedSubmission.status}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedSubmission.problemTitle} • {selectedSubmission.timestamp}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className={`text-center p-4 rounded-lg ${selectedSubmission.status === 'Accepted' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    <div className="text-sm text-gray-600 uppercase tracking-wide">Test Results</div>
                    <div className="text-lg font-bold text-gray-900">
                      {selectedSubmission.passedTests}/{selectedSubmission.totalTests}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-100 rounded-lg">
                    <div className="text-sm text-gray-600 uppercase tracking-wide">Runtime</div>
                    <div className="text-lg font-bold text-gray-900">{selectedSubmission.executionTime}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-100 rounded-lg">
                    <div className="text-sm text-gray-600 uppercase tracking-wide">Memory</div>
                    <div className="text-lg font-bold text-gray-900">{selectedSubmission.memory}</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-100 rounded-lg">
                    <div className="text-sm text-gray-600 uppercase tracking-wide">Accuracy</div>
                    <div className="text-lg font-bold text-gray-900">{selectedSubmission.accuracy}%</div>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Submission Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Language:</span>
                      <span className="ml-2 font-medium">{selectedSubmission.language}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Submitted:</span>
                      <span className="ml-2 font-medium">{selectedSubmission.timestamp}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Problem:</span>
                      <span className="ml-2 font-medium">{selectedSubmission.problemTitle}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 font-medium ${selectedSubmission.status === 'Accepted' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {selectedSubmission.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Complete Code Solution</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSubmission.code);
                        toast.success('Code copied to clipboard!');
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-all duration-200"
                    >
                      📋 Copy Code
                    </motion.button>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                      {selectedSubmission.code}
                    </pre>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCode(selectedSubmission.code);
                      setSelectedSubmission(null);
                      toast.success('Code loaded into editor!');
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200"
                  >
                    📝 Load Code to Editor
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSubmission(null)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompilerPage;