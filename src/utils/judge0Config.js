// Judge0 API Utility
// Centralized configuration for Judge0 CE API calls
// Now supports environment variable overrides so deployment (self-hosted, remote, RapidAPI) can be switched
// without code changes.

// Vite exposes env vars as import.meta.env.VITE_*
// Fallback order: explicit env -> localhost default
const ENV_BASE = import.meta?.env?.VITE_JUDGE0_BASE_URL || import.meta?.env?.VITE_JUDGE0_URL;
const DEFAULT_BASE = 'http://localhost:2358';

const JUDGE0_CONFIG = {
  baseUrl: (ENV_BASE || DEFAULT_BASE).replace(/\/$/, ''),
  apiKey: import.meta?.env?.VITE_JUDGE0_API_KEY || import.meta?.env?.VITE_RAPIDAPI_KEY || null,
  host: import.meta?.env?.VITE_JUDGE0_HOST || 'localhost',
  requestTimeoutMs: Number(import.meta?.env?.VITE_JUDGE0_TIMEOUT_MS || 15000)
};

export const isJudge0Configured = () => {
  return true; // Local Judge0 is always configured when running
};

export const getJudge0Headers = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (JUDGE0_CONFIG.apiKey) {
    // Support both RapidAPI and direct Judge0 deployments. RapidAPI requires specific headers.
    if (JUDGE0_CONFIG.baseUrl.includes('rapidapi')) {
      headers['X-RapidAPI-Key'] = JUDGE0_CONFIG.apiKey;
      headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    } else {
      headers['X-API-Key'] = JUDGE0_CONFIG.apiKey; // self-hosted Enterprise variant or custom proxy
    }
  }
  return headers;
};

export const getJudge0Urls = () => ({
  submit: `${JUDGE0_CONFIG.baseUrl}/submissions`,
  getResult: (token) => `${JUDGE0_CONFIG.baseUrl}/submissions/${token}`
});

export const validateJudge0Setup = () => {
  // For self-hosted local default we treat absence of apiKey as fine.
  const ok = !!JUDGE0_CONFIG.baseUrl;
  if (!ok) {
    return { valid: false, message: 'Judge0 base URL missing: set VITE_JUDGE0_BASE_URL in .env' };
  }
  return { valid: true, message: 'Judge0 configuration loaded' };
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
