// Judge0 API Utility
// Centralized configuration for Judge0 CE API calls

const JUDGE0_CONFIG = {
  baseUrl: 'http://localhost:2358',
  apiKey: null, // Local Judge0 doesn't need API key
  host: 'localhost'
};

export const isJudge0Configured = () => {
  return true; // Local Judge0 is always configured when running
};

export const getJudge0Headers = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const getJudge0Urls = () => ({
  submit: `${JUDGE0_CONFIG.baseUrl}/submissions`,
  getResult: (token) => `${JUDGE0_CONFIG.baseUrl}/submissions/${token}`
});

export const validateJudge0Setup = () => {
  if (!isJudge0Configured()) {
    return {
      valid: false,
      message: `🔑 Judge0 API Key Required
      
To use the code compilation feature:
1. Get a FREE RapidAPI key for Judge0 CE
2. Add it to your .env file as VITE_RAPIDAPI_KEY
3. Restart the development server

See JUDGE0_SETUP.md for detailed instructions.`,
      instructions: 'Check JUDGE0_SETUP.md for setup instructions'
    };
  }
  
  return {
    valid: true,
    message: 'Judge0 API configured successfully'
  };
};

// Language configurations for Judge0
export const JUDGE0_LANGUAGES = {
  javascript: { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
  python: { id: 71, name: 'Python (3.8.1)' },
  java: { id: 62, name: 'Java (OpenJDK 13.0.1)' },
  cpp: { id: 54, name: 'C++ (GCC 9.2.0)' },
  c: { id: 50, name: 'C (GCC 9.2.0)' },
  go: { id: 60, name: 'Go (1.13.5)' },
  rust: { id: 73, name: 'Rust (1.40.0)' },
  typescript: { id: 74, name: 'TypeScript (3.7.4)' }
};

export default JUDGE0_CONFIG;
