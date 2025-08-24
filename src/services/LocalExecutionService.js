// Local Code Execution Service
// Fallback for when Judge0 is rate-limited

class LocalExecutionService {
  constructor() {
    this.pythonWorker = null;
    this.isInitializing = false;
  }

  // Initialize Python worker
  async initializePython() {
    if (this.pythonWorker || this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    
    try {
      this.pythonWorker = new Worker('/python-worker.js');
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Python initialization timeout'));
        }, 30000); // 30 second timeout

        this.pythonWorker.onmessage = (e) => {
          const { type } = e.data;
          
          if (type === 'ready') {
            clearTimeout(timeout);
            this.isInitializing = false;
            resolve();
          } else if (type === 'error') {
            clearTimeout(timeout);
            this.isInitializing = false;
            reject(new Error(e.data.error));
          }
        };

        this.pythonWorker.onerror = (error) => {
          clearTimeout(timeout);
          this.isInitializing = false;
          reject(error);
        };

        // Start initialization
        this.pythonWorker.postMessage({ type: 'init' });
      });
    } catch (error) {
      this.isInitializing = false;
      throw error;
    }
  }

  // Execute Python code locally
  async executePython(code, input = '', timeout = 10000) {
    if (!this.pythonWorker) {
      await this.initializePython();
    }

    return new Promise((resolve, reject) => {
      const executionTimeout = setTimeout(() => {
        reject(new Error('Local execution timeout'));
      }, timeout + 5000); // Extra buffer

      const messageHandler = (e) => {
        const { type } = e.data;
        
        if (type === 'result') {
          clearTimeout(executionTimeout);
          this.pythonWorker.removeEventListener('message', messageHandler);
          resolve(e.data);
        } else if (type === 'error') {
          clearTimeout(executionTimeout);
          this.pythonWorker.removeEventListener('message', messageHandler);
          reject(new Error(e.data.error));
        }
      };

      this.pythonWorker.addEventListener('message', messageHandler);
      this.pythonWorker.postMessage({ 
        type: 'execute', 
        code, 
        input, 
        timeout 
      });
    });
  }

  // Execute JavaScript code locally (simple eval with safety measures)
  executeJavaScript(code, input = '', timeout = 5000) {
    return new Promise((resolve, reject) => {
      try {
        // Create a sandboxed execution environment
        const sandbox = {
          console: {
            log: (...args) => {
              sandbox._output += args.join(' ') + '\n';
            }
          },
          _output: '',
          _input: input,
          prompt: () => {
            const lines = sandbox._input.split('\n');
            return lines.shift() || '';
          }
        };

        // Set timeout
        const timeoutId = setTimeout(() => {
          reject(new Error('JavaScript execution timeout'));
        }, timeout);

        try {
          // Execute code in sandbox
          const func = new Function('console', 'prompt', '_output', code);
          func.call(sandbox, sandbox.console, sandbox.prompt, sandbox._output);

          clearTimeout(timeoutId);
          resolve({
            success: true,
            output: sandbox._output,
            error: null,
            status: 'Completed successfully'
          });
        } catch (error) {
          clearTimeout(timeoutId);
          resolve({
            success: false,
            output: sandbox._output,
            error: error.message,
            status: 'Runtime error'
          });
        }
      } catch (error) {
        reject(new Error(`Execution setup error: ${error.message}`));
      }
    });
  }

  // Main execution method that determines which engine to use
  async executeCode(language, code, input = '', timeout = 10000) {
    const languageLower = language.toLowerCase();
    
    try {
      if (languageLower === 'python') {
        return await this.executePython(code, input, timeout);
      } else if (languageLower === 'javascript') {
        return await this.executeJavaScript(code, input, timeout);
      } else {
        throw new Error(`Local execution not supported for ${language}. Please use Judge0 when available.`);
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        status: 'Local execution error'
      };
    }
  }

  // Check if local execution is available for a language
  isLanguageSupported(language) {
    const languageLower = language.toLowerCase();
    return ['python', 'javascript'].includes(languageLower);
  }

  // Cleanup method
  cleanup() {
    if (this.pythonWorker) {
      this.pythonWorker.terminate();
      this.pythonWorker = null;
    }
  }
}

// Export singleton instance
export const localExecutionService = new LocalExecutionService();
export default LocalExecutionService;
