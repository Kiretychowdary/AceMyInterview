// PROFESSIONAL CODING INTERVIEW - OPTIMIZED UI DESIGN
import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import GeminiService from '../services/GeminiService';
import { validateJudge0Setup, getJudge0Headers, getJudge0Urls } from '../utils/judge0Config';

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
  
  const [code, setCode] = useState(languages[3].template); // Default to Python
  const [language, setLanguage] = useState(languages[3]);
  const [problemDetails, setProblemDetails] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showProblemPanel, setShowProblemPanel] = useState(true);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [testResults, setTestResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      interval = setInterval(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadingProblem, loadingMessages.length]);

  // Generate new problem
  const generateNewProblem = async () => {
    setLoadingProblem(true);
    setProblemDetails(null);
    
    try {
      // Show motivational quote while loading
      const motivationalQuote = GeminiService.getMotivationalQuote();
      toast.info(motivationalQuote, { 
        duration: 8000,  // Longer duration to read the quote
        position: "top-center",
        style: {
          backgroundColor: '#f8f9fa',
          color: '#2c3e50',
          fontSize: '14px',
          textAlign: 'center',
          padding: '12px',
          borderRadius: '8px',
          maxWidth: '500px'
        }
      });

      // Secondary loading message
      setTimeout(() => {
        toast.info('🤖 AI is crafting a unique coding challenge for you...', { 
          duration: 5000,
          position: "bottom-right"
        });
      }, 2000);
      
      const response = await GeminiService.getCodingProblem(
        problemConfig.topic,
        problemConfig.difficulty,
        problemConfig.language
      );
      
      if (response.success && response.problem) {
        setProblemDetails(response.problem);
        toast.success(`✅ AI coding challenge ready!`);
      } else {
        setProblemDetails(response.problem);
        toast.warn('⚠️ Using sample problem - AI service unavailable');
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
    setProblemConfig({ ...problemConfig, language: newLanguage.name });
  };

  // Run code
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
    setOutput('Running code...');
    
    try {
      const judge0Urls = getJudge0Urls();
      const headers = getJudge0Headers();
      
      const response = await axios.post(
        judge0Urls.submit,
        {
          source_code: btoa(code),
          language_id: language.id,
          stdin: btoa(""),
        },
        { headers }
      );

      const token = response.data.token;

      // Poll for result
      const checkResult = async () => {
        const result = await axios.get(
          judge0Urls.getResult(token),
          { headers }
        );

        if (result.data.status.id <= 2) {
          setTimeout(checkResult, 1000);
        } else {
          const output = result.data.stdout
            ? atob(result.data.stdout)
            : result.data.stderr
            ? atob(result.data.stderr)
            : "No output";
          setOutput(output);
          setIsRunning(false);
        }
      };

      setTimeout(checkResult, 1000);
    } catch (error) {
      setOutput('Error: Unable to run code. Please check your internet connection.');
      setIsRunning(false);
      toast.error('Failed to execute code');
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
      
      const judge0Urls = getJudge0Urls();
      const headers = getJudge0Headers();

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        try {
          const response = await axios.post(
            judge0Urls.submit,
            {
              source_code: btoa(code),
              language_id: language.id,
              stdin: btoa(testCase.input || ""),
            },
            { headers }
          );

          const token = response.data.token;

          // Poll for result
          const result = await pollForResult(token);
          
          const actualOutput = result.stdout 
            ? atob(result.stdout).trim() 
            : result.stderr 
            ? atob(result.stderr).trim()
            : "";

          const expectedOutput = testCase.output.trim();
          const passed = actualOutput === expectedOutput;
          
          if (passed) passedCount++;

          results.push({
            testCase: i + 1,
            input: testCase.input || "No input",
            expected: expectedOutput,
            actual: actualOutput,
            passed: passed,
            error: result.stderr ? atob(result.stderr) : null
          });

        } catch (error) {
          results.push({
            testCase: i + 1,
            input: testCase.input || "No input",
            expected: testCase.output,
            actual: "Error executing code",
            passed: false,
            error: error.message
          });
        }
      }

      setTestResults({
        passed: passedCount,
        total: testCases.length,
        details: results
      });

      if (passedCount === testCases.length) {
        toast.success(`🎉 All ${passedCount}/${testCases.length} test cases passed! Great job!`);
      } else {
        toast.error(`❌ ${passedCount}/${testCases.length} test cases passed. Keep trying!`);
      }

    } catch (error) {
      console.error("Submit error:", error);
      toast.error('Failed to submit code for testing');
      setTestResults({
        passed: 0,
        total: 0,
        details: [],
        error: error.message
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
                            setProblemConfig({ ...problemConfig, topic: topic.value });
                            setConfiguredTopic(topic.value);
                          }
                        }}
                        className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                          (!showSubTopics && selectedMainTopic === topic.value) ||
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
                          className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                            problemConfig.difficulty === diff.value
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
                        className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                          problemConfig.language === lang.name
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
                className={`w-full mt-8 py-3 px-6 font-bold rounded-xl shadow-lg transition-all duration-300 text-lg ${
                  showSubTopics && configuredTopic && !loadingProblem
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
      {/* Header - Compact */}
      <div className="bg-gray-800 border-b border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">💻 Coding Interview</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Language:</span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border-2 ${language.color}`}>
                {language.icon} {language.label}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
              className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all duration-200"
            >
              {editorTheme === 'vs-dark' ? '☀️' : '🌙'}
            </motion.button>

            {/* Font Size */}
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-blue-700 text-white rounded-lg px-2 py-1 text-sm border border-blue-600"
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
            </select>

            {/* Language Switcher */}
            <select
              value={language.id}
              onChange={(e) => {
                const newLang = languages.find(l => l.id === parseInt(e.target.value));
                handleLanguageChange(newLang);
              }}
              className="bg-blue-700 text-white rounded-lg px-2 py-1 text-sm border border-blue-600"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.label}
                </option>
              ))}
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProblemPanel(!showProblemPanel)}
              className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span>{showProblemPanel ? '👈' : '👉'}</span>
              <span>{showProblemPanel ? 'Hide Problem' : 'Show Problem'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content - Optimized Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem Panel */}
        <AnimatePresence>
          {showProblemPanel && (
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-2/5 bg-white border-r border-gray-300 overflow-y-auto shadow-lg"
            >
              <div className="p-4">
                {problemDetails && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">{problemDetails.title}</h2>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={generateNewProblem}
                        disabled={loadingProblem}
                        className="px-3 py-2 bg-blue-700 text-white rounded-lg shadow-sm hover:bg-blue-800 transition-all duration-200 disabled:opacity-50 text-sm"
                      >
                        🔄 New Problem
                      </motion.button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">{problemDetails.description}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Input Format</h3>
                        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-700">
                          <p className="text-gray-700 text-sm">{problemDetails.inputFormat}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Output Format</h3>
                        <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                          <p className="text-gray-700 text-sm">{problemDetails.outputFormat}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Examples</h3>
                        <div className="bg-gray-900 p-3 rounded-lg">
                          <pre className="text-green-400 text-xs whitespace-pre-wrap font-mono">
                            {typeof problemDetails.examples === 'string' 
                              ? problemDetails.examples 
                              : JSON.stringify(problemDetails.examples, null, 2)
                            }
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Constraints</h3>
                        <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                          <p className="text-gray-700 text-sm">{problemDetails.constraints}</p>
                        </div>
                      </div>

                      {/* Test Results */}
                      {testResults && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Test Results</h3>
                          <div className={`p-4 rounded-lg border-l-4 ${
                            testResults.passed === testResults.total 
                              ? 'bg-green-50 border-green-500' 
                              : 'bg-red-50 border-red-500'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold text-gray-800">
                                {testResults.passed}/{testResults.total} Test Cases Passed
                              </span>
                              <span className={`text-sm font-medium ${
                                testResults.passed === testResults.total ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {testResults.passed === testResults.total ? '✅ Success' : '❌ Failed'}
                              </span>
                            </div>
                            
                            {testResults.details && testResults.details.length > 0 && (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {testResults.details.map((result, index) => (
                                  <div key={index} className={`p-2 rounded text-xs ${
                                    result.passed ? 'bg-green-100' : 'bg-red-100'
                                  }`}>
                                    <div className="font-medium mb-1">
                                      Test Case {result.testCase}: {result.passed ? '✅ Passed' : '❌ Failed'}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="font-medium">Input:</span> {
                                          typeof result.input === 'string' 
                                            ? result.input 
                                            : JSON.stringify(result.input)
                                        }
                                      </div>
                                      <div>
                                        <span className="font-medium">Expected:</span> {
                                          typeof result.expected === 'string' 
                                            ? result.expected 
                                            : JSON.stringify(result.expected)
                                        }
                                      </div>
                                      <div className="col-span-2">
                                        <span className="font-medium">Your Output:</span> {
                                          typeof result.actual === 'string' 
                                            ? result.actual 
                                            : JSON.stringify(result.actual)
                                        }
                                      </div>
                                      {result.error && (
                                        <div className="col-span-2 text-red-600">
                                          <span className="font-medium">Error:</span> {
                                            typeof result.error === 'string' 
                                              ? result.error 
                                              : JSON.stringify(result.error)
                                          }
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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
                      <span>Run Code</span>
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
                      <span>Submit & Test</span>
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
                Press Ctrl+Enter to run • Ctrl+Shift+Enter to submit
              </div>
            </div>
          </div>

          {/* Output Panel - Compact */}
          <div className="bg-gray-900 border-t border-gray-700 p-3 h-32 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">Output</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOutput('')}
                className="px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white text-xs rounded transition-all duration-200"
              >
                Clear
              </motion.button>
            </div>
            <div className="bg-black rounded-lg p-3 h-20 overflow-y-auto">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {output || 'Click "Run Code" to see output...'}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CompilerPage;
