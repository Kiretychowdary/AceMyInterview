// Web Worker for safe local Python execution
// This worker uses Pyodide (Python in the browser) for local execution

let pyodide = null;
let isInitialized = false;

self.onmessage = async function(e) {
  const { type, code, input, timeout = 5000 } = e.data;

  try {
    if (type === 'execute') {
      // Initialize Pyodide if not already done
      if (!isInitialized) {
        self.postMessage({ type: 'status', message: 'Loading Python environment...' });
        
        // Load Pyodide from CDN
        importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
        pyodide = await loadPyodide();
        isInitialized = true;
        
        self.postMessage({ type: 'status', message: 'Python environment ready!' });
      }

      // Set up timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Execution timeout')), timeout);
      });

      // Execute code
      const executionPromise = new Promise(async (resolve, reject) => {
        try {
          // Capture stdout
          let output = '';
          pyodide.runPython(`
import sys
from io import StringIO

# Redirect stdout to capture output
sys.stdout = StringIO()
          `);

          // Set input if provided
          if (input && input.trim()) {
            pyodide.runPython(`
import sys
from io import StringIO
sys.stdin = StringIO('''${input}''')
            `);
          }

          // Execute user code
          pyodide.runPython(code);

          // Get output
          output = pyodide.runPython('sys.stdout.getvalue()');

          resolve({
            success: true,
            output: output || '',
            error: null,
            status: 'Completed successfully'
          });

        } catch (error) {
          reject({
            success: false,
            output: '',
            error: error.message,
            status: 'Runtime error'
          });
        }
      });

      // Race between execution and timeout
      const result = await Promise.race([executionPromise, timeoutPromise]);
      self.postMessage({ type: 'result', ...result });

    } else if (type === 'init') {
      // Initialize Pyodide
      if (!isInitialized) {
        self.postMessage({ type: 'status', message: 'Initializing Python environment...' });
        importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
        pyodide = await loadPyodide();
        isInitialized = true;
        self.postMessage({ type: 'ready' });
      } else {
        self.postMessage({ type: 'ready' });
      }
    }

  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error.message,
      success: false,
      output: '',
      status: 'Worker error'
    });
  }
};
