// Judge0 API Utility
// Centralized configuration for Judge0 CE API calls

const JUDGE0_CONFIG = {
  baseUrl: 'https://judge0-ce.p.rapidapi.com',
  apiKey: import.meta.env.VITE_RAPIDAPI_KEY || 'your-rapidapi-key-here',
  host: 'judge0-ce.p.rapidapi.com'
};

export const isJudge0Configured = () => {
  return JUDGE0_CONFIG.apiKey && JUDGE0_CONFIG.apiKey !== 'your-rapidapi-key-here';
};

export const getJudge0Headers = () => {
  if (!isJudge0Configured()) {
    throw new Error('Judge0 API key not configured. Please check JUDGE0_SETUP.md for instructions.');
  }
  
  return {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': JUDGE0_CONFIG.apiKey,
    'X-RapidAPI-Host': JUDGE0_CONFIG.host,
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
