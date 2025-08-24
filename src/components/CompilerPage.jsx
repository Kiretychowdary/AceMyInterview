// PROFESSIONAL CODING INTERVIEW - OPTIMIZED UI DESIGN
import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import GeminiService from '../services/GeminiService';
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
    const mainTopic = codingTopics.find(topic => topic.value === topicValue);
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
      // Rate limiting check
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      const minInterval = 2000; // Minimum 2 seconds between requests
      
      if (timeSinceLastRequest < minInterval) {
        const waitTime = minInterval - timeSinceLastRequest;
        console.log(`Rate limiting: waiting ${waitTime}ms before next request...`);
        setOutput(`⏳ Rate limiting active... waiting ${Math.ceil(waitTime/1000)} seconds before execution...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      // Update request tracking
      setLastRequestTime(Date.now());
      setRequestCount(prev => prev + 1);
      
      // Show warning if too many requests
      if (requestCount > 10) {
        console.warn('High request count detected, adding extra delay...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Validate inputs
      if (!sourceCode || !sourceCode.trim()) {
        throw new Error('Source code cannot be empty');
      }

      // Helper function to safely encode to base64
      const safeBtoa = (str) => {
        try {
          return btoa(str || '');
        } catch (e) {
          console.warn('Failed to encode to base64:', str);
          // Fallback: encode as UTF-8 bytes first, then base64
          return btoa(unescape(encodeURIComponent(str || '')));
        }
      };

      // Submit code for execution with rate limiting and retry logic
      // Helper function to handle 429 rate limit errors
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
            
            return response; // Success!
            
          } catch (error) {
            // Check if it's a 429 rate limit error
            if (error.response && error.response.status === 429) {
              console.log(`Rate limit hit (429) on attempt ${attempt}`);
              
              if (attempt < maxRetries) {
                // Calculate exponential backoff delay
                const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue; // Try again
              } else {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
              }
            }
            
            // For other errors, throw immediately
            throw error;
          }
        }
      };

      // Try both plain text and base64 approaches
      let submitResponse;

      try {
        // First try: Plain text (some Judge0 versions expect this)
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

        // Second try: Base64 encoded (official Judge0 CE format)
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

      // Poll for result with exponential backoff
      let attempts = 0;
      const maxAttempts = 20;
      const pollInterval = 1000; // Start with 1 second

      const pollResult = async () => {
        attempts++;

        const resultResponse = await axios.get(
          judge0Urls.getResult(token),
          { headers, timeout: 5000 }
        );

        const result = resultResponse.data;
        console.log('=== Full Judge0 Result ===');
        console.log(JSON.stringify(result, null, 2));
        console.log('=== Judge0 Result Analysis ===');
        console.log('Status ID:', result.status?.id);
        console.log('Status Description:', result.status?.description);
        console.log('Raw stdout:', result.stdout);
        console.log('Raw stdout type:', typeof result.stdout);
        console.log('Raw stderr:', result.stderr);
        console.log('Raw compile_output:', result.compile_output);

        // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=Time Limit Exceeded, etc.
        if (result.status.id <= 2) {
          // Still processing
          if (attempts >= maxAttempts) {
            throw new Error('Execution timeout - taking too long to process');
          }

          // Wait with exponential backoff
          const delay = Math.min(pollInterval * Math.pow(1.5, attempts), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return await pollResult();
        }

        // Execution completed
        // Helper function to safely decode base64
        const safeAtob = (str) => {
          if (!str) return '';
          
          // If it's already a string and not base64 encoded, return as is
          if (typeof str === 'string' && !str.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
            console.log('Returning non-base64 string as is:', str.substring(0, 50) + '...');
            return str;
          }
          
          // If it's an array, convert to string
          if (Array.isArray(str)) {
            console.log('Converting array to string:', str);
            return str.join('\n');
          }
          
          // If it's an object, stringify it
          if (typeof str === 'object') {
            console.log('Converting object to string:', str);
            return JSON.stringify(str, null, 2);
          }
          
          try {
            const decoded = atob(str);
            console.log('Successfully decoded base64:', str.substring(0, 50) + '... -> ' + decoded.substring(0, 50) + '...');
            return decoded;
          } catch (e) {
            console.warn('Failed to decode base64:', str.substring(0, 100) + '...');
            console.warn('Using original string instead');
            return str; // Return original string if decode fails
          }
        };

        console.log('Raw Judge0 response fields:', {
          stdout: result.stdout ? result.stdout.substring(0, 100) + '...' : 'null',
          stderr: result.stderr ? result.stderr.substring(0, 100) + '...' : 'null',
          compile_output: result.compile_output ? result.compile_output.substring(0, 100) + '...' : 'null'
        });

        const finalOutput = safeAtob(result.stdout);
        console.log('Final processed output:', finalOutput);
        console.log('Final output type:', typeof finalOutput);
        console.log('Final output length:', finalOutput ? finalOutput.length : 0);

        return {
          success: result.status.id === 3, // 3 = Accepted
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

  // Enhanced run code with test case validation
  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    // Check if Judge0 is properly configured
    const judge0Status = validateJudge0Setup();
    if (!judge0Status.valid) {
      toast.error('Judge0 API key not configured');
      setOutput(judge0Status.message);
      return;
    }

    setIsRunning(true);
    setOutput('🚀 Submitting code to Judge0...\n⏳ Waiting for execution...');

    try {
      // If problem is loaded, run with first test case for validation
      let testInput = "";
      let expectedOutput = "";
      let hasTestCase = false;

      if (problemDetails && problemDetails.testCases && problemDetails.testCases.length > 0) {
        const firstTestCase = problemDetails.testCases[0];
        testInput = firstTestCase.input || "";
        expectedOutput = firstTestCase.output || "";
        hasTestCase = true;
      }

      const result = await executeCodeWithJudge0(code, language.id, testInput);

      let outputText = '';

      if (result.success) {
        // Check if answer is correct when test case is available
        let isCorrect = false;
        if (hasTestCase && result.output) {
          const userOutput = result.output.trim();
          const expected = expectedOutput.trim();
          isCorrect = userOutput === expected;
        }

        if (hasTestCase) {
          // Show result validation
          if (isCorrect) {
            outputText = `🎉 CORRECT ANSWER!\n`;
            outputText += `${'='.repeat(40)}\n\n`;
            outputText += `✅ Your solution produces the correct output!\n\n`;
          } else {
            outputText = `❌ WRONG ANSWER\n`;
            outputText += `${'='.repeat(40)}\n\n`;
            outputText += `❌ Your solution produces incorrect output.\n\n`;
          }

          // Show comparison
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
          // No test case available, show basic execution
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
          outputText += `${'-'.repeat(20)}`;
        }
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

  // Reset code
  const resetCode = () => {
    setCode(language.template);
    setOutput('');
    setTestResults(null);
  };

  // Submit and test code against all test cases
  const submitCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    if (!problemDetails || !problemDetails.testCases) {
      toast.error('No test cases available for this problem!');
      return;
    }

    // Check if Judge0 is properly configured
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

      // Execute each test case
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];

        // Update progress
        setTestResults({
          passed: passedCount,
          total: testCases.length,
          details: results,
          currentTest: i + 1
        });

        try {
          const result = await executeCodeWithJudge0(code, language.id, testCase.input);

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

        // Small delay between test cases to avoid rate limiting
        if (i < testCases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Final results
      const finalResults = {
        passed: passedCount,
        total: testCases.length,
        details: results,
        accuracy: Math.round((passedCount / testCases.length) * 100)
      };

      setTestResults(finalResults);

      // Add submission to history
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

      // Switch to submissions tab if all tests passed
      if (passedCount === testCases.length) {
        setActiveTab('submissions');
      }

      // Update console output with test summary
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

      // Show completion message
      if (passedCount === testCases.length) {
        toast.success(`🎉 All ${testCases.length} test cases passed!`);
      } else {
        toast.warning(`${passedCount}/${testCases.length} test cases passed`);
      }

    } catch (error) {
      console.error('Submit code error:', error);
      
      // Update console with error information
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

                  {/* Selected Main Category Display */}
                  {selectedMainTopic && !showSubTopics && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <span className="text-lg">📂</span>
                        <span className="font-medium">Category Selected: {codingTopics.find(t => t.value === selectedMainTopic)?.label || selectedMainTopic}</span>
                      </div>
                    </div>
                  )}

                  {/* Selected Topic Display */}
                  {showSubTopics && configuredTopic && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <span className="text-lg">✅</span>
                        <span className="font-medium">Selected: {getTopicDisplayLabel(configuredTopic)}</span>
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
  return (
    <div className="h-screen bg-gray-900 flex flex-col max-h-screen overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">💻 Coding Interview</h1>
            
            {/* Problem Info */}
            {problemDetails && (
              <div className="flex items-center space-x-3 text-sm">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                  Medium
                </span>
                <span className="text-gray-300">
                  {problemDetails.title?.substring(0, 30)}...
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Problem Panel Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProblemPanel(!showProblemPanel)}
              className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                showProblemPanel 
                  ? 'bg-green-700 hover:bg-green-800 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-200'
              }`}
            >
              {showProblemPanel ? '📖 Hide Problem' : '📖 Show Problem'}
            </motion.button>

            {/* Language Selector Dropdown */}
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

            {/* Editor Controls */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
                className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all duration-200 text-sm"
                title={`Switch to ${editorTheme === 'vs-dark' ? 'Light' : 'Dark'} theme`}
              >
                {editorTheme === 'vs-dark' ? '☀️' : '🌙'}
              </motion.button>

              {/* Font Size */}
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

      {/* Main Content - Optimized Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LeetCode-Style Problem Panel */}
        <AnimatePresence>
          {showProblemPanel && (
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-2/5 bg-white border-r border-gray-200 overflow-hidden flex flex-col"
            >
              {/* Problem Header with Tabs */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={() => setActiveTab('description')}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === 'description' 
                        ? 'text-blue-600 border-blue-500' 
                        : 'text-gray-500 hover:text-gray-700 border-transparent'
                    }`}
                  >
                    Description
                  </button>
                  <button 
                    onClick={() => setActiveTab('editorial')}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === 'editorial' 
                        ? 'text-blue-600 border-blue-500' 
                        : 'text-gray-500 hover:text-gray-700 border-transparent'
                    }`}
                  >
                    Editorial
                  </button>
                  <button 
                    onClick={() => setActiveTab('solutions')}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === 'solutions' 
                        ? 'text-blue-600 border-blue-500' 
                        : 'text-gray-500 hover:text-gray-700 border-transparent'
                    }`}
                  >
                    Solutions
                  </button>
                  <button 
                    onClick={() => setActiveTab('submissions')}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === 'submissions' 
                        ? 'text-blue-600 border-blue-500' 
                        : 'text-gray-500 hover:text-gray-700 border-transparent'
                    }`}
                  >
                    Submissions
                    {submissions.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
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

              {/* Problem Content */}
              <div className="flex-1 overflow-y-auto">
                {problemDetails && (
                  <div className="p-4 space-y-6">
                    {/* Tab Content */}
                    {activeTab === 'description' && (
                      <>
                        {/* Problem Title with Metadata */}
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                              Medium
                            </span>
                            <span className="text-gray-500 text-sm cursor-pointer hover:text-gray-700">📚 Topics</span>
                            <span className="text-gray-500 text-sm cursor-pointer hover:text-gray-700">🏢 Companies</span>
                            <span className="text-gray-500 text-sm cursor-pointer hover:text-gray-700">💡 Hint</span>
                          </div>
                          <h1 className="text-xl font-semibold text-gray-900 leading-tight">
                            {problemDetails.title}
                          </h1>
                        </div>

                        {/* Problem Description */}
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed text-base">
                            {typeof problemDetails.description === 'object' 
                              ? JSON.stringify(problemDetails.description, null, 2) 
                              : (problemDetails.description || 'No description available')}
                          </p>
                        </div>

                        {/* Examples Section */}
                        <div className="space-y-4">
                          {problemDetails.testCases && problemDetails.testCases.length > 0 && (
                            <>
                              {problemDetails.testCases.slice(0, 3).map((testCase, index) => (
                                <div key={index} className="space-y-2">
                                  <h3 className="text-sm font-semibold text-gray-900">
                                    Example {index + 1}:
                                  </h3>
                                  
                                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="space-y-3">
                                      <div>
                                        <div className="text-sm font-medium text-gray-900 mb-1">Input:</div>
                                        <div className="bg-white border border-gray-200 rounded p-2">
                                          <code className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                                            {(testCase.input && typeof testCase.input === 'string') 
                                              ? testCase.input.replace(/\\n/g, '\n') 
                                              : (typeof testCase.input === 'object' 
                                                  ? JSON.stringify(testCase.input, null, 2) 
                                                  : (testCase.input || 'No input'))}
                                          </code>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <div className="text-sm font-medium text-gray-900 mb-1">Output:</div>
                                        <div className="bg-white border border-gray-200 rounded p-2">
                                          <code className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                                            {(testCase.output && typeof testCase.output === 'string') 
                                              ? testCase.output.replace(/\\n/g, '\n') 
                                              : (typeof testCase.output === 'object' 
                                                  ? JSON.stringify(testCase.output, null, 2) 
                                                  : (testCase.output || 'No output'))}
                                          </code>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>

                        {/* Constraints */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">Constraints:</h3>
                          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <li>1 ≤ array length ≤ 10<sup>4</sup></li>
                            <li>-10<sup>9</sup> ≤ array elements ≤ 10<sup>9</sup></li>
                            <li>Time limit: 1 second</li>
                            <li>Memory limit: 256 MB</li>
                          </ul>
                        </div>

                        {/* Input/Output Format */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Input Format:</h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-gray-700 font-mono leading-relaxed whitespace-pre-line">
                                {typeof problemDetails.inputFormat === 'object' 
                                  ? JSON.stringify(problemDetails.inputFormat, null, 2) 
                                  : (problemDetails.inputFormat || 'No input format specified')}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Output Format:</h3>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-sm text-gray-700 font-mono leading-relaxed whitespace-pre-line">
                                {typeof problemDetails.outputFormat === 'object' 
                                  ? JSON.stringify(problemDetails.outputFormat, null, 2) 
                                  : (problemDetails.outputFormat || 'No output format specified')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === 'editorial' && (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Editorial Coming Soon</h3>
                        <p className="text-gray-600">
                          Detailed explanation and optimal solution approach will be available here.
                        </p>
                      </div>
                    )}

                    {activeTab === 'solutions' && (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">💡</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Solutions</h3>
                        <p className="text-gray-600">
                          Solutions from other users will be displayed here once available.
                        </p>
                      </div>
                    )}

                    {activeTab === 'submissions' && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Your Submissions</h3>
                          <span className="text-sm text-gray-600">
                            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {submissions.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
                            <p className="text-gray-600 mb-4">
                              Click "Submit All Tests" to test your solution and see results here.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {submissions.map((submission, index) => (
                              <motion.div 
                                key={index} 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedSubmission(submission)}
                                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                  submission.status === 'Accepted' 
                                    ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                                    : 'border-red-200 bg-red-50 hover:bg-red-100'
                                }`}
                              >
                                {/* Submission Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <span className={`text-lg ${
                                      submission.status === 'Accepted' ? '✅' : '❌'
                                    }`}></span>
                                    <div>
                                      <div className={`font-semibold text-sm ${
                                        submission.status === 'Accepted' ? 'text-green-800' : 'text-red-800'
                                      }`}>
                                        {submission.status}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {submission.timestamp}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                      {submission.passedTests}/{submission.totalTests} passed
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {submission.language} • {submission.executionTime}
                                    </div>
                                  </div>
                                </div>

                                {/* Test Results Summary */}
                                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                  <div className="text-center">
                                    <div className="text-xs text-gray-600 uppercase tracking-wide">Runtime</div>
                                    <div className="font-medium">{submission.executionTime}</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xs text-gray-600 uppercase tracking-wide">Memory</div>
                                    <div className="font-medium">{submission.memory}</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xs text-gray-600 uppercase tracking-wide">Accuracy</div>
                                    <div className="font-medium">{submission.accuracy}%</div>
                                  </div>
                                </div>

                                {/* Code Preview */}
                                <div className="pt-3 border-t border-gray-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs text-gray-600">Code Preview:</div>
                                    <div className="text-xs text-blue-600 font-medium">
                                      Click to view full details →
                                    </div>
                                  </div>
                                  <div className="bg-gray-900 rounded p-3 max-h-20 overflow-hidden">
                                    <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
                                      {submission.code.length > 150 
                                        ? submission.code.substring(0, 150) + '...' 
                                        : submission.code
                                      }
                                    </pre>
                                  </div>
                                </div>
                              </motion.div>
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

        {/* Code Editor & Output - Fixed Height */}
        <motion.div
          layout
          className="flex-1 flex flex-col overflow-hidden"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Editor - Main Area */}
          <div className="flex-1 min-h-0">
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

          {/* Controls - Compact */}
          <div className="bg-gray-800 border-t border-gray-700 p-3">
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

          {/* Enhanced Console with Tabs */}
          <div className="bg-gray-900 border-t border-gray-700 p-4 h-80 overflow-hidden flex flex-col">
            {/* Console Header with Tabs */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>📟</span> Console
                </h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setConsoleTab('output')}
                    className={`px-3 py-1 text-xs rounded transition-all duration-200 ${
                      consoleTab === 'output' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Output
                  </button>
                  <button
                    onClick={() => setConsoleTab('tests')}
                    className={`px-3 py-1 text-xs rounded transition-all duration-200 ${
                      consoleTab === 'tests' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Test Results
                    {testResults && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                        testResults.passed === testResults.total ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {testResults.passed}/{testResults.total}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setConsoleTab('debug')}
                    className={`px-3 py-1 text-xs rounded transition-all duration-200 ${
                      consoleTab === 'debug' 
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
            
            {/* Tab Content */}
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
                        <div key={index} className={`p-3 rounded border-l-4 ${
                          result.passed ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
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
                              <pre className={`mt-1 font-mono whitespace-pre-wrap bg-black/30 p-2 rounded ${
                                result.passed ? 'text-green-100' : 'text-red-100'
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
              {/* Modal Header */}
              <div className={`px-6 py-4 border-b ${
                selectedSubmission.status === 'Accepted' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl ${
                      selectedSubmission.status === 'Accepted' ? '✅' : '❌'
                    }`}></span>
                    <div>
                      <h2 className={`text-xl font-bold ${
                        selectedSubmission.status === 'Accepted' ? 'text-green-800' : 'text-red-800'
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

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Test Results Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className={`text-center p-4 rounded-lg ${
                    selectedSubmission.status === 'Accepted' ? 'bg-green-100' : 'bg-red-100'
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

                {/* Language and Submission Info */}
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
                      <span className={`ml-2 font-medium ${
                        selectedSubmission.status === 'Accepted' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedSubmission.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Full Code Display */}
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

                {/* Action Buttons */}
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
