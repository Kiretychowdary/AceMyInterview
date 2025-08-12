// PROFESSIONAL CODING INTERVIEW - MODERN UI DESIGN
// NMKRSPVLIDATAPERMANENT - Beautiful, Professional Coding Interface
import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from 'react-toastify';
import GeminiService from '../services/GeminiService';

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
  { value: 'algorithms', label: 'Algorithms', icon: '🧠', color: 'purple' },
  { value: 'data-structures', label: 'Data Structures', icon: '📊', color: 'blue' },
  { value: 'dynamic-programming', label: 'Dynamic Programming', icon: '🔄', color: 'green' },
  { value: 'strings', label: 'String Manipulation', icon: '📝', color: 'yellow' },
  { value: 'arrays', label: 'Arrays & Lists', icon: '📋', color: 'red' },
];

const difficulties = [
  { value: 'easy', label: 'Easy', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { value: 'medium', label: 'Medium', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { value: 'hard', label: 'Hard', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
];

function ProfessionalCodingInterview() {
  const [code, setCode] = useState(languages[3].template); // Default to Python
  const [language, setLanguage] = useState(languages[3]);
  const [problemDetails, setProblemDetails] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showProblemPanel, setShowProblemPanel] = useState(true);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const editorRef = useRef(null);

  // Problem generation configuration
  const [problemConfig, setProblemConfig] = useState({
    topic: 'algorithms',
    difficulty: 'medium',
    language: 'python'
  });

  // Generate new problem
  const generateNewProblem = async () => {
    setLoadingProblem(true);
    setProblemDetails(null);
    
    try {
      toast.info('🤖 AI is generating a coding challenge...', { duration: 3000 });
      
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

    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions",
        {
          source_code: btoa(code),
          language_id: language.id,
          stdin: btoa(""),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": "your-rapidapi-key", // Add your RapidAPI key
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const token = response.data.token;

      // Poll for result
      const checkResult = async () => {
        const result = await axios.get(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
          {
            headers: {
              "X-RapidAPI-Key": "your-rapidapi-key",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          }
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
  };

  // Configuration Screen (when no problem is loaded)
  if (!problemDetails && !loadingProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="min-h-screen bg-black/20 backdrop-blur-sm py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl"
              >
                <span className="text-3xl text-white">💻</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-bold text-white mb-4"
              >
                AI Coding Interview
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-blue-100 max-w-3xl mx-auto"
              >
                Solve AI-generated coding problems in your favorite programming language
              </motion.p>
            </div>

            {/* Configuration Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8"
            >
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Configure Your Coding Challenge</h2>
              
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Topic Selection */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-blue-100 mb-4">Problem Topic</label>
                  <div className="space-y-3">
                    {topics.map((topic) => (
                      <motion.button
                        key={topic.value}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setProblemConfig({ ...problemConfig, topic: topic.value })}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          problemConfig.topic === topic.value
                            ? 'border-blue-400 bg-blue-500/20 text-blue-100 shadow-lg'
                            : 'border-white/20 bg-white/5 hover:border-white/30 text-gray-200 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{topic.icon}</span>
                          <div>
                            <div className="font-semibold">{topic.label}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Difficulty & Language */}
                <div className="space-y-6">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-lg font-semibold text-blue-100 mb-4">Difficulty Level</label>
                    <div className="space-y-3">
                      {difficulties.map((diff) => (
                        <motion.button
                          key={diff.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setProblemConfig({ ...problemConfig, difficulty: diff.value })}
                          className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                            problemConfig.difficulty === diff.value
                              ? 'border-blue-400 bg-blue-500/20 text-blue-100 shadow-md'
                              : 'border-white/20 bg-white/5 hover:border-white/30 text-gray-200'
                          }`}
                        >
                          <span className="font-semibold">{diff.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-blue-100 mb-4">Programming Language</label>
                  <div className="space-y-3">
                    {languages.map((lang) => (
                      <motion.button
                        key={lang.id}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setProblemConfig({ ...problemConfig, language: lang.name });
                          setLanguage(lang);
                        }}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          problemConfig.language === lang.name
                            ? 'border-blue-400 bg-blue-500/20 text-blue-100 shadow-lg'
                            : 'border-white/20 bg-white/5 hover:border-white/30 text-gray-200 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{lang.icon}</span>
                          <div className="font-semibold">{lang.label}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateNewProblem}
                disabled={loadingProblem}
                className="w-full mt-8 py-4 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loadingProblem ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Generating Challenge...</span>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Generating Your Challenge...</h2>
          <p className="text-blue-200">AI is crafting the perfect coding problem for you</p>
        </div>
      </div>
    );
  }

  // Main Coding Interface
  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">💻 Coding Interview</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Language:</span>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${language.color}`}>
                {language.icon} {language.label}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
            >
              {editorTheme === 'vs-dark' ? '☀️' : '🌙'}
            </motion.button>

            {/* Font Size */}
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600"
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
              className="bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
            >
              {showProblemPanel ? 'Hide Problem' : 'Show Problem'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Problem Panel */}
        <AnimatePresence>
          {showProblemPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '40%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white border-r border-gray-300 p-6 overflow-y-auto"
            >
              {problemDetails && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{problemDetails.title}</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={generateNewProblem}
                      disabled={loadingProblem}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                      🔄 New Problem
                    </motion.button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{problemDetails.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Input Format</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{problemDetails.inputFormat}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Output Format</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{problemDetails.outputFormat}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Examples</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-gray-600 text-sm whitespace-pre-wrap">{problemDetails.examples}</pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Constraints</h3>
                      <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg">{problemDetails.constraints}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Code Editor & Output */}
        <div className="flex-1 flex flex-col">
          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={language.name}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={editorTheme}
              options={{
                fontSize: fontSize,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: true,
                folding: true,
                lineDecorationsWidth: 20,
                lineNumbersMinChars: 3,
                padding: { top: 20, bottom: 20 },
              }}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>

          {/* Controls */}
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={runCode}
                  disabled={isRunning}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                  onClick={resetCode}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  🔄 Reset
                </motion.button>
              </div>

              <div className="text-gray-400 text-sm">
                Press Ctrl+Enter to run code
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-gray-900 border-t border-gray-700 p-4 h-48">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Output</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOutput('')}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-all duration-200"
              >
                Clear
              </motion.button>
            </div>
            <div className="bg-black rounded-lg p-4 h-32 overflow-y-auto">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {output || 'Click "Run Code" to see output...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalCodingInterview;
