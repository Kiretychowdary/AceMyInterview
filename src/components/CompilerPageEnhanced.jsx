import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, Download, Upload, Share2, 
  Settings, Maximize2, Minimize2, Copy, Check,
  BookOpen, Code2, TestTube, Trophy, Clock,
  Zap, Target, Star, Activity, ChevronLeft, ChevronRight
} from 'lucide-react';

// Enhanced languages with more options
const languages = [
  {
    id: 71,
    name: "python",
    label: "Python 3",
    icon: "🐍",
    version: "3.11.0",
    color: "from-green-400 to-blue-500",
    template: `def solution():
    """
    Write your solution here
    Time Complexity: O(?)
    Space Complexity: O(?)
    """
    # Your code here
    pass

if __name__ == "__main__":
    result = solution()
    print(result)`
  },
  {
    id: 54,
    name: "cpp",
    label: "C++",
    icon: "⚡",
    version: "17",
    color: "from-blue-400 to-purple-500",
    template: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    // Write your solution here
    // Time Complexity: O(?)
    // Space Complexity: O(?)
    void solve() {
        cout << "Hello World!" << endl;
    }
};

int main() {
    Solution sol;
    sol.solve();
    return 0;
}`
  },
  {
    id: 62,
    name: "java",
    label: "Java",
    icon: "☕",
    version: "11",
    color: "from-orange-400 to-red-500",
    template: `import java.util.*;

class Solution {
    /**
     * Write your solution here
     * Time Complexity: O(?)
     * Space Complexity: O(?)
     */
    public void solve() {
        System.out.println("Hello World!");
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        sol.solve();
    }
}`
  },
  {
    id: 63,
    name: "javascript",
    label: "JavaScript",
    icon: "🟨",
    version: "Node.js",
    color: "from-yellow-400 to-orange-500",
    template: `/**
 * Write your solution here
 * Time Complexity: O(?)
 * Space Complexity: O(?)
 */
function solution() {
    // Your code here
    console.log("Hello World!");
}

solution();`
  }
];

const themes = [
  { value: 'vs-dark', label: 'Dark Pro', icon: '🌙' },
  { value: 'light', label: 'Light Pro', icon: '☀️' },
  { value: 'hc-black', label: 'High Contrast', icon: '🔲' },
];

const difficulties = [
  { value: 'easy', label: 'Easy', color: 'text-green-500', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
  { value: 'hard', label: 'Hard', color: 'text-red-500', bgColor: 'bg-red-100', borderColor: 'border-red-300' }
];

function CompilerPageEnhanced() {
  // Enhanced state management
  const [code, setCode] = useState(languages[0].template);
  const [language, setLanguage] = useState(languages[0]);
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [activeTab, setActiveTab] = useState('problem');
  const [consoleTabs, setConsoleTabs] = useState('output');
  const [submissions, setSubmissions] = useState([]);
  const [problemDetails, setProblemDetails] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [codeStats, setCodeStats] = useState({ lines: 0, chars: 0 });
  
  // Layout state - Three panel system
  const [leftPanelWidth, setLeftPanelWidth] = useState(35); // Question description
  const [editorHeight, setEditorHeight] = useState(60); // Editor vs console split
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  
  const editorRef = useRef(null);
  const timerRef = useRef(null);

  // Mock problem data
  useEffect(() => {
    setProblemDetails({
      id: 1,
      title: "Two Sum",
      difficulty: "easy",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        }
      ],
      constraints: [
        "2 ≤ nums.length ≤ 10⁴",
        "-10⁹ ≤ nums[i] ≤ 10⁹",
        "-10⁹ ≤ target ≤ 10⁹"
      ],
      testCases: [
        { input: "[2,7,11,15]\n9", output: "[0,1]" },
        { input: "[3,2,4]\n6", output: "[1,2]" }
      ]
    });
  }, []);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            if (e.shiftKey) {
              handleSubmit();
            } else {
              handleRun();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'r':
            e.preventDefault();
            handleReset();
            break;
          case 'f':
            e.preventDefault();
            setIsFullscreen(!isFullscreen);
            break;
          case '=':
            e.preventDefault();
            setFontSize(prev => Math.min(24, prev + 2));
            break;
          case '-':
            e.preventDefault();
            setFontSize(prev => Math.max(10, prev - 2));
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Code statistics
  useEffect(() => {
    const lines = code.split('\n').length;
    const chars = code.length;
    setCodeStats({ lines, chars });
  }, [code]);

  // Enhanced handlers
  const handleRun = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setIsRunning(true);
    const startTime = Date.now();
    setExecutionTime(0);
    
    timerRef.current = setInterval(() => {
      setExecutionTime(Date.now() - startTime);
    }, 100);

    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOutput(`✅ Code executed successfully!
Time: ${((Date.now() - startTime) / 1000).toFixed(2)}s
Memory: ${Math.floor(Math.random() * 50 + 10)}MB

Output:
Hello World!`);
      
      setMemoryUsage(Math.floor(Math.random() * 50 + 10));
      toast.success('Code executed successfully!');
    } catch (error) {
      setOutput(`❌ Execution failed: ${error.message}`);
      toast.error('Execution failed');
    } finally {
      clearInterval(timerRef.current);
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problemDetails?.testCases) {
      toast.error('No test cases available!');
      return;
    }

    setIsRunning(true);
    const results = [];
    let passed = 0;

    for (let i = 0; i < problemDetails.testCases.length; i++) {
      const testCase = problemDetails.testCases[i];
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isPassed = Math.random() > 0.3; // 70% pass rate for demo
      if (isPassed) passed++;
      
      results.push({
        id: i + 1,
        passed: isPassed,
        input: testCase.input,
        expected: testCase.output,
        actual: isPassed ? testCase.output : "Wrong output",
        time: `${(Math.random() * 100).toFixed(0)}ms`
      });
    }

    setTestResults({
      passed,
      total: problemDetails.testCases.length,
      results,
      accuracy: Math.round((passed / problemDetails.testCases.length) * 100)
    });

    const submission = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      status: passed === problemDetails.testCases.length ? 'Accepted' : 'Wrong Answer',
      language: language.label,
      runtime: `${(Math.random() * 100).toFixed(0)}ms`,
      memory: `${Math.floor(Math.random() * 20 + 10)}MB`,
      code
    };

    setSubmissions(prev => [submission, ...prev]);
    setConsoleTabs('tests');
    setIsRunning(false);
    
    if (passed === problemDetails.testCases.length) {
      toast.success('🎉 All test cases passed!');
    } else {
      toast.warning(`${passed}/${problemDetails.testCases.length} test cases passed`);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(newLang.template);
  };

  const handleReset = () => {
    setCode(language.template);
    setOutput('');
    setTestResults(null);
    toast.info('Code reset to template');
  };

  const handleSave = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution.${language.name}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code saved successfully!');
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  // Enhanced drag handlers for three-panel layout
  const handleMouseMove = (e) => {
    if (isDraggingHorizontal) {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      setLeftPanelWidth(Math.max(25, Math.min(55, newWidth)));
    }
    if (isDraggingVertical) {
      const rect = document.getElementById('editor-console-container').getBoundingClientRect();
      const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
      setEditorHeight(Math.max(30, Math.min(80, newHeight)));
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDraggingHorizontal(false);
      setIsDraggingVertical(false);
    };

    if (isDraggingHorizontal || isDraggingVertical) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingHorizontal, isDraggingVertical]);

  return (
    <div className={`h-screen bg-white text-black flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Enhanced Header */}
      <div className="bg-white border-b border-blue-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-blue-700 p-2 rounded-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-700">
                  AceMyInterview
                </h1>
                <p className="text-sm text-gray-600">Professional Coding Platform</p>
              </div>
            </motion.div>
            
            {problemDetails && (
              <div className="flex items-center space-x-3 ml-8">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  difficulties.find(d => d.value === problemDetails.difficulty)?.bgColor
                } ${difficulties.find(d => d.value === problemDetails.difficulty)?.color}`}>
                  {problemDetails.difficulty.toUpperCase()}
                </span>
                <span className="text-black">{problemDetails.title}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <select
              value={language.id}
              onChange={(e) => handleLanguageChange(languages.find(l => l.id === parseInt(e.target.value)))}
              className="bg-white text-black px-4 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.label} {lang.version}
                </option>
              ))}
            </select>

            {/* Theme Selector */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-white text-black px-4 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:outline-none"
            >
              {themes.map(t => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-300"
              >
                <Settings className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-300"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Font Size:</label>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-black w-8">{fontSize}px</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Auto-save:</span>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs">ON</button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">
                    Lines: {codeStats.lines} | Characters: {codeStats.chars}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div id="main-content" className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description with home page theme */}
        <div 
          className="border-r border-blue-200 flex flex-col shadow-lg bg-white"
          style={{ 
            width: `${leftPanelWidth}%`
          }}
        >
          {/* Problem Tabs with home page styling */}
          <div className="flex border-b border-blue-200 bg-blue-50">
            {[
              { key: 'problem', label: 'Problem', icon: BookOpen },
              { key: 'submissions', label: 'Submissions', icon: Trophy }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'text-blue-700 border-blue-700 bg-white'
                    : 'text-black border-transparent hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.key === 'submissions' && submissions.length > 0 && (
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
                    {submissions.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Problem Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'problem' && problemDetails && (
              <div className="space-y-6">
                {/* Problem Header */}
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      difficulties.find(d => d.value === problemDetails.difficulty)?.bgColor
                    } ${difficulties.find(d => d.value === problemDetails.difficulty)?.color}`}>
                      {problemDetails.difficulty.toUpperCase()}
                    </span>
                    <span className="text-blue-600 text-sm"># {problemDetails.id}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-black mb-2">{problemDetails.title}</h1>
                </div>

                {/* Description */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-black mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{problemDetails.description}</p>
                </div>

                {/* Examples */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-black mb-3">Examples</h3>
                  {problemDetails.examples.map((example, idx) => (
                    <div key={idx} className="mb-4 last:mb-0">
                      <div className="bg-white rounded p-3 mb-2 border border-blue-200">
                        <div className="text-sm text-blue-700 mb-1 font-semibold">Input:</div>
                        <code className="text-black">{example.input}</code>
                      </div>
                      <div className="bg-white rounded p-3 mb-2 border border-blue-200">
                        <div className="text-sm text-blue-700 mb-1 font-semibold">Output:</div>
                        <code className="text-black">{example.output}</code>
                      </div>
                      {example.explanation && (
                        <div className="text-sm text-gray-600 italic">
                          Explanation: {example.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-black mb-3">Constraints</h3>
                  <ul className="space-y-1">
                    {problemDetails.constraints.map((constraint, idx) => (
                      <li key={idx} className="text-gray-700 text-sm">
                        • {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-black">Your Submissions</h3>
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                    <p className="text-gray-600">No submissions yet</p>
                    <p className="text-sm text-gray-500">Submit your solution to see results here</p>
                  </div>
                ) : (
                  submissions.map(submission => (
                    <div key={submission.id} className={`p-4 rounded-lg border ${
                      submission.status === 'Accepted' 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-red-50 border-red-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold ${
                          submission.status === 'Accepted' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {submission.status}
                        </span>
                        <span className="text-sm text-gray-600">{submission.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-700">
                        <span>{submission.language}</span>
                        <span>Runtime: {submission.runtime}</span>
                        <span>Memory: {submission.memory}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Professional Horizontal Resizer - Question/Editor Divider */}
        <div
          className="w-2 cursor-col-resize transition-all duration-200 hover:w-3 flex items-center justify-center group bg-blue-200 hover:bg-blue-300"
          style={{
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
          }}
          onMouseDown={() => setIsDraggingHorizontal(true)}
        >
          <div className="w-0.5 h-8 bg-blue-700 rounded-full group-hover:bg-blue-800 transition-colors" />
        </div>

        {/* Right Panel - Code Editor & Console */}
        <div className="flex-1 flex flex-col bg-white" id="editor-console-container">
          {/* Editor Controls with home page theme */}
          <div className="border-b border-blue-200 px-4 py-3 shadow-sm bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${language.color}`}></div>
                  <span className="text-sm font-medium text-black">{language.label}</span>
                </div>
                
                {isRunning && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Running... {(executionTime / 1000).toFixed(1)}s</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white rounded-lg font-medium"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isRunning ? 'Running' : 'Run'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={isRunning}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                >
                  <TestTube className="w-4 h-4" />
                  <span>Submit</span>
                </motion.button>

                <div className="w-px h-6 bg-blue-300" />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="p-2 text-gray-600 hover:text-black hover:bg-blue-100 rounded"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="p-2 text-gray-600 hover:text-black hover:bg-blue-100 rounded"
                >
                  <Download className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-black hover:bg-blue-100 rounded"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Code Editor with home page theme */}
          <div 
            className="flex-1 relative shadow-inner bg-white border border-blue-200" 
            style={{ 
              height: `${editorHeight}%`
            }}
          >
            <Editor
              height="100%"
              language={language.name}
              value={code}
              onChange={setCode}
              theme={theme}
              options={{
                fontSize,
                fontFamily: 'JetBrains Mono, Fira Code, Monaco, monospace',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: true,
                folding: true,
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
                suggest: { insertMode: 'replace' },
                quickSuggestions: true,
                parameterHints: { enabled: true },
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
              }}
              onMount={(editor) => {
                editorRef.current = editor;
                editor.focus();
              }}
            />
          </div>

          {/* Professional Vertical Resizer - Editor/Console Divider */}
          <div
            className="h-2 cursor-row-resize transition-all duration-200 hover:h-3 flex items-center justify-center group bg-blue-200 hover:bg-blue-300"
            style={{
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)'
            }}
            onMouseDown={() => setIsDraggingVertical(true)}
          >
            <div className="h-0.5 w-8 bg-blue-700 rounded-full group-hover:bg-blue-800 transition-colors" />
          </div>

          {/* Console Panel with home page theme */}
          <div 
            className="border-t border-blue-200 shadow-lg bg-white"
            style={{ 
              height: `${100 - editorHeight}%`
            }}
          >
            {/* Console Tabs with unique styling */}
            <div className="flex border-b border-blue-200 bg-blue-50">
              {[
                { key: 'output', label: 'Output', icon: '📋' },
                { key: 'tests', label: 'Test Results', icon: '🧪' },
                { key: 'debug', label: 'Debug', icon: '🐛' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setConsoleTabs(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                    consoleTabs === tab.key
                      ? 'text-blue-700 border-blue-700 bg-white'
                      : 'text-black border-transparent hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.key === 'tests' && testResults && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      testResults.passed === testResults.total 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                    }`}>
                      {testResults.passed}/{testResults.total}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Console Content */}
            <div className="h-full overflow-auto p-4">
              {consoleTabs === 'output' && (
                <div className="font-mono text-sm">
                  {output ? (
                    <pre className="text-blue-700 whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="text-gray-500 italic">
                      Click "Run" to execute your code and see output here...
                    </div>
                  )}
                </div>
              )}

              {consoleTabs === 'tests' && (
                <div>
                  {testResults ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`font-semibold ${
                          testResults.passed === testResults.total ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {testResults.passed}/{testResults.total} Passed
                        </span>
                        <span className="text-gray-600">
                          Accuracy: {testResults.accuracy}%
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {testResults.results.map(result => (
                          <div key={result.id} className={`p-3 rounded border ${
                            result.passed 
                              ? 'bg-green-50 border-green-300' 
                              : 'bg-red-50 border-red-300'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-black">Test Case {result.id}</span>
                              <span className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {result.passed ? '✅ PASS' : '❌ FAIL'} ({result.time})
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600 mb-1">Expected:</div>
                                <code className="block p-2 bg-blue-50 border border-blue-200 rounded text-black">{result.expected}</code>
                              </div>
                              <div>
                                <div className="text-gray-600 mb-1">Actual:</div>
                                <code className="block p-2 bg-blue-50 border border-blue-200 rounded text-black">{result.actual}</code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TestTube className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                      <p className="text-gray-600">No test results yet</p>
                      <p className="text-sm text-gray-500">Submit your solution to run test cases</p>
                    </div>
                  )}
                </div>
              )}

              {consoleTabs === 'debug' && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <div className="text-gray-600 mb-1">Language</div>
                      <div className="text-black">{language.label}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <div className="text-gray-600 mb-1">Theme</div>
                      <div className="text-black">{themes.find(t => t.value === theme)?.label}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <div className="text-gray-600 mb-1">Font Size</div>
                      <div className="text-black">{fontSize}px</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <div className="text-gray-600 mb-1">Memory Usage</div>
                      <div className="text-black">{memoryUsage}MB</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                    <div className="text-gray-600 mb-2">Keyboard Shortcuts</div>
                    <div className="space-y-1 text-xs text-gray-700">
                      <div>Ctrl+Enter: Run Code</div>
                      <div>Ctrl+Shift+Enter: Submit</div>
                      <div>Ctrl+S: Save Code</div>
                      <div>Ctrl+R: Reset Code</div>
                      <div>Ctrl+F: Toggle Fullscreen</div>
                      <div>Ctrl+= / Ctrl+-: Adjust Font Size</div>
                    </div>
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

export default CompilerPageEnhanced;