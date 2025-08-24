// Judge0 API Utility
// Enhanced configuration for Judge0 CE API calls

const JUDGE0_CONFIG = {
  baseUrl: 'https://judge0-ce.p.rapidapi.com',
  // Alternative endpoints to try
  alternativeUrls: [
    'https://judge0-ce.p.rapidapi.com',
    'https://ce.judge0.com' // Direct Judge0 endpoint (free tier)
  ],
  apiKey: import.meta.env.VITE_RAPIDAPI_KEY || '1690033ea2mshd19e1cbf16ab7e6p15099ajsnb73c9a715dc5',
  host: 'judge0-ce.p.rapidapi.com'
};

// Language ID mapping for Judge0
export const LANGUAGE_IDS = {
  'c': 50,
  'cpp': 54,
  'java': 62,
  'python': 71,
  'javascript': 63,
  'typescript': 74,
  'go': 60,
  'rust': 73,
  'csharp': 51
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

// Get headers for direct Judge0 (fallback)
export const getDirectJudge0Headers = () => ({
  'Content-Type': 'application/json'
});

export const getJudge0Urls = () => ({
  submit: `${JUDGE0_CONFIG.baseUrl}/submissions`,
  submitBatch: `${JUDGE0_CONFIG.baseUrl}/submissions/batch`,
  getResult: (token) => `${JUDGE0_CONFIG.baseUrl}/submissions/${token}`,
  getBatchResult: (tokens) => `${JUDGE0_CONFIG.baseUrl}/submissions/batch?tokens=${tokens.join(',')}`
});

// Get direct Judge0 URLs (fallback)
export const getDirectJudge0Urls = () => ({
  submit: 'https://ce.judge0.com/submissions',
  submitBatch: 'https://ce.judge0.com/submissions/batch',
  getResult: (token) => `https://ce.judge0.com/submissions/${token}`,
  getBatchResult: (tokens) => `https://ce.judge0.com/submissions/batch?tokens=${tokens.join(',')}`
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

// Test multiple Judge0 endpoints to find working one
export const testMultipleEndpoints = async () => {
  const endpoints = [
    {
      name: 'RapidAPI Judge0',
      baseUrl: 'https://judge0-ce.p.rapidapi.com',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_CONFIG.apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    },
    {
      name: 'Direct Judge0 (Free)',
      baseUrl: 'https://ce.judge0.com',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ];

  const safeBtoa = (str) => {
    try {
      return btoa(str || '');
    } catch (e) {
      return btoa(unescape(encodeURIComponent(str || '')));
    }
  };

  const testPayload = {
    source_code: safeBtoa('print("Hello World")'),
    language_id: 71, // Python
    stdin: safeBtoa('')
  };

  console.log('=== Testing Multiple Judge0 Endpoints ===');

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint.name}...`);
      console.log('URL:', `${endpoint.baseUrl}/submissions`);
      console.log('Headers:', endpoint.headers);

      const response = await fetch(`${endpoint.baseUrl}/submissions`, {
        method: 'POST',
        headers: endpoint.headers,
        body: JSON.stringify(testPayload)
      });

      console.log(`${endpoint.name} Response Status:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name} SUCCESS!`, data);
        return {
          success: true,
          endpoint: endpoint,
          data: data
        };
      } else {
        const errorText = await response.text();
        console.log(`❌ ${endpoint.name} Failed:`, response.status, errorText);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} Error:`, error.message);
    }
  }

  return {
    success: false,
    message: 'All endpoints failed'
  };
};

// Test Judge0 API connectivity with enhanced debugging
export const testJudge0Connection = async () => {
  if (!isJudge0Configured()) {
    throw new Error('Judge0 API key not configured');
  }

  try {
    const headers = getJudge0Headers();
    const urls = getJudge0Urls();

    console.log('=== Judge0 Connection Test ===');
    console.log('API Key:', JUDGE0_CONFIG.apiKey.substring(0, 10) + '...');
    console.log('Base URL:', JUDGE0_CONFIG.baseUrl);
    console.log('Headers:', headers);
    console.log('Submit URL:', urls.submit);

    // Helper function to safely encode
    const safeBtoa = (str) => {
      try {
        return btoa(str || '');
      } catch (e) {
        return btoa(unescape(encodeURIComponent(str || '')));
      }
    };

    const testPayload = {
      source_code: safeBtoa('print("Hello World")'),
      language_id: 71, // Python
      stdin: safeBtoa('')
    };

    console.log('Test payload:', testPayload);

    const response = await fetch(urls.submit, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Judge0 API connection successful!',
      token: data.token
    };
  } catch (error) {
    console.error('Judge0 connection test failed:', error);
    return {
      success: false,
      message: `Failed to connect to Judge0: ${error.message}`,
      error: error.message
    };
  }
};

export default JUDGE0_CONFIG;
