// Judge0 API client - using RapidAPI endpoint
const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';

const runOnce = async ({ code, languageId, stdin = '' }) => {
  // Using RapidAPI requires authentication headers
  const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    console.warn('RapidAPI key not configured - Judge0 compilation will fail');
    return {
      status: { description: 'Configuration Error' },
      compile_output: 'RapidAPI key not configured. Please add VITE_RAPIDAPI_KEY to .env file.',
      stdout: '',
      stderr: 'Missing API key'
    };
  }
  
  try {
    const response = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({ source_code: code, language_id: languageId, stdin })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return {
          status: { description: 'Authentication Error' },
          compile_output: 'Invalid RapidAPI key. Please check your VITE_RAPIDAPI_KEY.',
          stdout: '',
          stderr: 'Authentication failed'
        };
      }
      if (response.status === 429) {
        return {
          status: { description: 'Rate Limit Exceeded' },
          compile_output: 'Too many requests. Please wait a moment and try again.',
          stdout: '',
          stderr: 'Rate limit exceeded'
        };
      }
    }
    
    return response.json();
  } catch (error) {
    console.error('Judge0 API error:', error);
    return {
      status: { description: 'Network Error' },
      compile_output: error.message,
      stdout: '',
      stderr: 'Failed to connect to compilation service'
    };
  }
};

const runBatch = async ({ code, languageId, testCases = [] }) => {
  // Run each test case sequentially with wait=true to simplify polling
  const details = [];
  let passed = 0;
  let totalTime = 0;
  let maxMemory = 0;

  for (const tc of testCases) {
    try {
      const stdin = tc.input !== undefined ? (typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input)) : '';
      const expected = tc.output !== undefined ? (typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output)) : null;
      const res = await runOnce({ code, languageId, stdin });

      // Extract outputs
      const actual = res.stdout ?? '';
      const compile_output = res.compile_output;
      const stderr = res.stderr;
      const time = res.time ? Number(res.time) : (res.time_used || 0);
      const memory = res.memory ? Number(res.memory) : (res.memory_used || 0);

      const isPassed = expected !== null ? String(actual).trim() === String(expected).trim() : false;
      if (isPassed) passed += 1;

      totalTime += (time || 0);
      if (memory && memory > maxMemory) maxMemory = memory;

      details.push({
        input: tc.input,
        expected,
        actual,
        passed: !!isPassed,
        time,
        memory,
        compile_output,
        stderr,
        error: res.status && res.status.description && res.status.description.toLowerCase().includes('error') ? res.status.description : null
      });
    } catch (err) {
      details.push({ input: tc.input, expected: tc.output, actual: null, passed: false, time: 0, memory: 0, compile_output: null, stderr: null, error: err.message });
    }
  }

  const metrics = {
    avgTime: details.length ? totalTime / details.length : 0,
    maxMemory: maxMemory
  };

  return { passed, total: testCases.length, details, metrics };
};

const judge0Client = { runOnce, runBatch };
export default judge0Client;
