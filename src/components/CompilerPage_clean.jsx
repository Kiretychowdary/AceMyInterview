// OPTIMIZED FULL-PAGE CODING INTERVIEW INTERFACE
import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import GeminiService from '../services/GeminiService';

const languages = [
  {
    id: 71,
    name: "python",
    label: "Python",
    icon: "🐍",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    template: `# Your solution here
def solve():
    # Write your solution
    pass

if __name__ == "__main__":
    solve()`
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

public class Solution {
    public static void main(String[] args) {
        // Your solution here
        System.out.println("Hello, World!");
    }
}`
  }
];

const CompilerPage = () => {
  const location = useLocation();
  const editorRef = useRef(null);
  
  const [code, setCode] = useState(languages[0].template);
  const [language, setLanguage] = useState(languages[0]);
  const [problemDetails, setProblemDetails] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showProblemPanel, setShowProblemPanel] = useState(true);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [activeTab, setActiveTab] = useState('description');
  const [submissions, setSubmissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate problem on component mount
  useEffect(() => {
    generateNewProblem();
  }, []);

  const generateNewProblem = async () => {
    setLoadingProblem(true);
    try {
      const problem = await GeminiService.generateCodingProblem({
        difficulty: "Medium",
        topic: "Algorithms",
        type: "algorithm"
      });
      
      if (problem.success && problem.data) {
        setProblemDetails(problem.data);
        toast.success("New coding challenge generated!");
      } else {
        toast.error("Failed to generate problem. Please try again.");
      }
    } catch (error) {
      console.error('Error generating problem:', error);
      toast.error("Error generating problem. Please try again.");
    } finally {
      setLoadingProblem(false);
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first!");
      return;
    }
    
    setIsRunning(true);
    setOutput('Running your code...');
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/execute`, {
        code: code,
        language: language.name,
        input: ""
      });
      
      if (response.data.success) {
        setOutput(response.data.output || 'Code executed successfully!');
      } else {
        setOutput(`Error: ${response.data.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!problemDetails || !code.trim()) {
      toast.error("Please write a solution first!");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/submit`, {
        code: code,
        language: language.name,
        problemId: problemDetails.id || 'sample',
        testCases: problemDetails.testCases || []
      });
      
      if (response.data.success) {
        const submission = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          code: code,
          language: language.label,
          status: response.data.allPassed ? 'Accepted' : 'Failed',
          passedTests: response.data.passedTests || 0,
          totalTests: response.data.totalTests || 0,
          executionTime: response.data.executionTime || 'N/A'
        };
        
        setSubmissions(prev => [submission, ...prev]);
        
        if (response.data.allPassed) {
          toast.success("🎉 All tests passed! Great job!");
          setActiveTab('submissions');
        } else {
          toast.error(`${response.data.passedTests}/${response.data.totalTests} tests passed`);
        }
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } catch (error) {
      toast.error("Error submitting code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProblem) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl">Generating AI Coding Challenge...</div>
          <div className="text-gray-400 mt-2">Preparing your interview question</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>💻</span>
              <span>AceMyInterview - Coding Challenge</span>
            </h1>
            
            {problemDetails && (
              <div className="flex items-center space-x-3 text-sm">
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                  ⭐ MEDIUM
                </span>
                <span className="text-gray-300 font-medium">
                  {problemDetails.title?.substring(0, 40)}...
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
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
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
              className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all duration-200 text-sm"
            >
              {editorTheme === 'vs-dark' ? '☀️' : '🌙'}
            </button>

            <button
              onClick={generateNewProblem}
              disabled={loadingProblem}
              className="px-3 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-all duration-200 text-sm"
            >
              🔄 New Problem
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Problem Panel */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-hidden flex flex-col">
          {/* Tabs - Only Description and Submissions */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === 'description' 
                    ? 'text-blue-600 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                }`}
              >
                📚 Description
              </button>
              <button 
                onClick={() => setActiveTab('submissions')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === 'submissions' 
                    ? 'text-blue-600 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                }`}
              >
                📊 Submissions
                {submissions.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {submissions.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {problemDetails && (
              <>
                {activeTab === 'description' && (
                  <div className="space-y-6">
                    {/* Problem Title */}
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

                    {/* Description */}
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

                    {/* Examples */}
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

                    {/* Constraints */}
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
                            className={`border-2 rounded-xl p-5 transition-all duration-300 ${
                              submission.status === 'Accepted' 
                                ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
                                : 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className={`text-2xl ${
                                  submission.status === 'Accepted' ? '🎉' : '⚠️'
                                }`}></div>
                                <div>
                                  <div className={`font-bold text-base ${
                                    submission.status === 'Accepted' ? 'text-green-800' : 'text-red-800'
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
                                <div className={`text-lg font-bold ${
                                  submission.status === 'Accepted' ? 'text-green-700' : 'text-red-700'
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
              </>
            )}
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Editor */}
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
                padding: { top: 10, bottom: 10 },
              }}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>

          {/* Controls */}
          <div className="bg-gray-800 border-t border-gray-700 p-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
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
                </button>

                <button
                  onClick={submitCode}
                  disabled={isSubmitting || !problemDetails}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
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
                </button>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Font Size:</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600"
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                </select>
              </div>
            </div>
          </div>

          {/* Output Console */}
          <div className="bg-gray-900 border-t border-gray-700 p-4 h-48 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>📟</span> Console Output
              </h3>
            </div>
            
            <div className="bg-black rounded-lg border border-gray-700 h-32 overflow-y-auto p-3">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {output || 'Click "Run Code" to see output here...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompilerPage;
