// Code Editor Component for Interview
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CodeEditor = ({ onCodeChange, initialCode = '', language = 'javascript' }) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput('');
    
    try {
      // Create a safe execution environment
      const logs = [];
      const customConsole = {
        log: (...args) => logs.push(args.join(' ')),
        error: (...args) => logs.push('Error: ' + args.join(' ')),
        warn: (...args) => logs.push('Warning: ' + args.join(' '))
      };

      // Execute code in isolated scope
      const func = new Function('console', code);
      func(customConsole);
      
      setOutput(logs.join('\n') || 'Code executed successfully (no output)');
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearCode = () => {
    setCode('');
    setOutput('');
    if (onCodeChange) {
      onCodeChange('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-lg border-2 border-blue-500 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-3 text-sm font-medium">💻 Code Editor</span>
          <span className="text-xs text-gray-400 ml-2">({language})</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
          >
            {isRunning ? '⏳ Running...' : '▶ Run Code'}
          </button>
          <button
            onClick={clearCode}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Code Input Area */}
      <div className="relative">
        <textarea
          value={code}
          onChange={handleCodeChange}
          placeholder="// Write your code here..."
          className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 resize-none focus:outline-none"
          spellCheck="false"
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
          Lines: {code.split('\n').length}
        </div>
      </div>

      {/* Output Area */}
      {output && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="border-t-2 border-gray-700"
        >
          <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 flex items-center gap-2">
            <span>📤 Output:</span>
          </div>
          <pre className="p-4 bg-gray-50 text-sm font-mono text-gray-800 max-h-32 overflow-auto whitespace-pre-wrap">
            {output}
          </pre>
        </motion.div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 px-4 py-2 text-xs text-gray-600 border-t border-blue-200">
        💡 <strong>Tip:</strong> Use console.log() to see output. Write clean, well-commented code.
      </div>
    </motion.div>
  );
};

export default CodeEditor;
